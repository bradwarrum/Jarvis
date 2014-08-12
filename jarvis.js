var http = require('http');
var qs = require('querystring');
var wiki = require('./wiki.js');
var tags = require('./tags.js');
var command = require('./command.js');
var weather = require('./weather.js');
var reminder = require('./reminder.js');
var groupme = require('./groupme.js');

var helpstr = "Jarvis\n\n" + 
				"\"Jarvis, wiki [Page Title]\"\n" + 
				"   Summarize a Wikipedia article\n" + 
				"\"Jarvis, weather [Zip | City, ST]\"\n" +
				"   Display current weather conditions\n" + 
				"\"Jarvis, forecast [Zip | City, ST]\"\n" +
				"   Display 7-day forecast\n" + 
				"\"Jarvis, say [message]\"\n" + 
				"   Repeat the message.\n" +
				"\"Jarvis, reminder [Month Day, Time] [Message]\"\n" + 
				"   Say something at a specific time.\n" + 
				"\"Jarvis, cancel [token]\"\n" + 
				"   Cancel a reminder with the given token\n" + 
				"\"Jarvis, help\"\n" + 
				"   Display this help message";


process.env.TZ = "America/New_York";
var processPost = function(req,res, callback) {
	var querydata = "";
	if (typeof callback !== 'function') return null;
	
	if (req.method == "POST") {
		//Handle data received events
		req.on('data', function (data) {
			querydata += data;
			if (querydata.length > 1e6) { //1 MB
				querydata = "";
				res.writeHead(413, {'Content-Type': 'text/plain'});
				res.end();
				request.connection.destroy();
			}
		});
		
		//Handle request end events
		req.on('end', function() {
			callback(querydata);
		});
		
	} else {
		res.writeHead(404, "Not Found");
		res.end();
	}
};

var server = http.createServer(function(req, res) {
	console.log("Message Received");
	processPost(req, res, function(preqstr) {
		console.log(preqstr);
		var cmd = command.parse(preqstr);
		res.writeHead(200, "OK");
		res.end();
		if (cmd !== null) {
			//Warrant a response
			if (cmd["command"] == null) {
				//res.end(cmd["nullresp"]);
				groupme.send(cmd.nullresp);
			} else if (cmd["command"] == "wiki") {
				//Perform a wiki request and return the text
				wiki.request(cmd["target"], function(jobj) {
					if (jobj !== undefined) {
						console.log(jobj);
						//res.end(jobj["title"] + '\n' + tags.remove(jobj["extract"]));
						groupme.send(jobj["title"] + '\n' + tags.remove(jobj["extract"]));
					} else {
						//res.end("Wiki article not found.");
						groupme.send("Wiki article not found.");
					}
				});
			} else if (/^weather/i.test(cmd["command"])) {
				var cs = cmd["target"].split(",");
				var city = "";
				var zip = "";
				var state = "";
				if (cs[1] == null) {
					if (/^\d+/.test(cs[0].trim())) zip = cs[0].trim();
					else city = cs[0].trim();
				} else {
					city = cs[0].trim();
					state = cs[1].trim();
				}
				weather.current(city, state, zip, function(jobj) { 
					if (jobj !== null && jobj !== undefined) {
						var s = weather.cToString(jobj);
						//res.end(s);
						groupme.send(s);
					}
						//res.end()
				});
			} else if (/^forecast/i.test(cmd["command"])) {
				var cs = cmd["target"].split(",");
				console.log(cs);
				var city = "";
				var zip = "";
				var state = "";
				if (cs[1] == null) {
					if (/^\d+/.test(cs[0].trim())) zip = cs[0].trim();
					else city = cs[0].trim();
				} else {
					city = cs[0].trim();
					state = cs[1].trim();
				}
				weather.forecast(city,state,zip, function(jobj) {
					if (jobj !== null && jobj !== undefined) {
						console.log(jobj);
						var s = weather.fToString(jobj, city, state, zip);
						//res.end(s);
						groupme.send(s);
					} //else res.end()
						
				});
			} else if (cmd.command == "reminder") {
				cmd.target = cmd.target.trim();
				var stuff = cmd.target.split(/([,\:\s/]+)/g);
				for(var v in stuff) v = v.trim().trim(',').trim(':').trim('\n');
				var msg = "";
				for (var vi = 4; vi < stuff.length; vi++) {
					msg += stuff[vi] + " ";
				}
				var st = new reminder.STime(stuff[0], stuff[1], stuff[2], stuff[3]);
				console.log(msg);
				var jid = reminder.setup(st, msg);
				if (jid == -1) {
					//res.end("Date is in the past, cannot schedule reminder.");
					groupme.send("Date is in the past, cannot schedule reminder.");
				} else if (jid == -2) {
					//res.end("Invalid date.");
					groupme.send("Invalid date.");
				} else {
					//res.end("Reminder scheduled. Cancel with this token: " + jid);
					groupme.send("Reminder scheduled. Cancel with this token: " + jid);
				}
			}else if (cmd.command == "cancel") {
				var c = reminder.cancel(parseInt(cmd.target));
				if (c) {
					//res.end("Reminder with id " + cmd.target + " was canceled.");
					groupme.send("Reminder with id " + cmd.target + " was canceled.");
				}
				else{
					//res.end("No reminder found with that id.");
					groupme.send("No reminder found with that id.");
				}
			}else if (cmd["command"] == "help") {
				groupme.send(helpstr);
				//res.end(helpstr);
			}else if (cmd.command == "say") {
				console.log(cmd.target);
				groupme.send(cmd.target.toString());
				//res.end(cmd.target);
			}else {
				//res.end();
			}
		} else {
			//res.end();
		}
		/*wiki.request(preqstr, function(jobj){
			if (jobj != undefined) {
				tex += jobj["title"] + "\n" + tags.remove(jobj["extract"]);
				res.writeHead(200, "OK");
				res.end(tex);
			} else {
				res.writeHead(400, "Not Found");
				res.end();
			}
		});*/
		//res.writeHead(200, "OK");
		//res.end();
	});
});
server.listen(process.env.PORT || 53000);