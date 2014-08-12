var http = require('http');
var qs = require('querystring');
var wiki = require('./wiki.js');
var tags = require('./tags.js');
var command = require('./command.js');
var weather = require('./weather.js');
var reminder = require('./reminder.js');
var groupme = require('./groupme.js');
var schedule = require('node-schedule');
var _GCL = {"VERSION": "v0.1.20", 
			"CL": "Wiki fetching reliability greatly improved.\n\n" + 
			"v0.1.18\nI can do recurring events now.  Chunked content now sends to GroupMe in order."};

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
				"\"Jarvis, recurrence [daily|[weekly|monthly] [day]] [time] [message]\"\n" + 
				"   Schedule a recurrence event\n" +
				"\"Jarvis, version\"\n" + 
				"   Display the changelog and version number\n" + 
				"\"Jarvis, help\"\n" + 
				"   Display this help message";

console.log("Server running " + _GCL.VERSION);
if (groupme._gadebug) console.log("Debug mode is ACTIVE");
else console.log("Debug mode is INACTIVE");

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
					if (jobj !== undefined && parseInt(jobj.pageid) !== -1) {
						console.log(jobj);
						//res.end(jobj["title"] + '\n' + tags.remove(jobj["extract"]));
						groupme.send(jobj["title"] + '\n' + tags.remove(jobj["extract"]) + '\n\n' + "http://en.wikipedia.org/wiki?curid=" + jobj.pageid);
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
			} else if (cmd.command === "recurrence") {
				var rec = new schedule.RecurrenceRule();
				console.log(rec);
				var stuff = cmd.target.split(/([,\:\s/]+)/g);
				var jid = -2;
				if (stuff !== null) {
					if (stuff[0] === "daily") {
						var msg = "";
						for (var vi = 6; vi < stuff.length; vi++) {
							msg += stuff[vi];
						}
						jid = reminder.setuprecurrence(stuff[0], null, stuff[2], stuff[4], msg);
					} else if (stuff[0] === "monthly" || stuff[0] === "weekly") {
						var msg = "";
						for (var vi = 8; vi<stuff.length; vi++) {
							msg += stuff[vi];
						}
						jid = reminder.setuprecurrence(stuff[0], stuff[2], stuff[4], stuff[6], msg);
					} else {
						groupme.send("Recurrence mode \"" + stuff[0] + "\" not supported.");
						return;
					}
					if (jid == -1) {
						groupme.send("Date is invalid.");
					} else {
						//res.end("Reminder scheduled. Cancel with this token: " + jid);
						groupme.send("Recurrence scheduled. Cancel with this token: " + jid);
					}
				} else {
					groupme.send("Parsing error on recurrence rule.");
				}
			}else if (cmd.command === "reminder") {
				cmd.target = cmd.target.trim();
				var stuff = cmd.target.split(/([,\:\s/]+)/g);
				//for(var v in stuff) v = v.trim().trim(',').trim(':').trim('\n');
				var msg = "";
				if (stuff.length > 8) {
				for (var vi = 8; vi < stuff.length; vi++) {
					msg += stuff[vi];
				}
				//Probably can remove all those trim statements
				var st = new reminder.STime(stuff[0].trim().trim(',').trim(':').trim('\n'),
											stuff[2].trim().trim(',').trim(':').trim('\n'),
											stuff[4].trim().trim(',').trim(':').trim('\n'), 
											stuff[6].trim().trim(',').trim(':').trim('\n'));
				console.log(msg);
				console.log(stuff);
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
				} else {
					groupme.send("Invalid reminder command, try again.");
				}
			}else if (cmd.command == "cancel") {
				var c = reminder.cancel(parseInt(cmd.target));
				console.log(c);
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
			}else if (cmd.command == "version") {
				groupme.send(_GCL.VERSION + "\n" + _GCL.CL);
			} else {
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