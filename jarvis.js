var http = require('http');
var qs = require('querystring');
var wiki = require('./wiki.js');
var tags = require('./tags.js');
var command = require('./command.js');

var helpstr = "Jarvis\n\n\"Jarvis, wiki [Page Title]\"\nSummarize a Wikipedia article\n\"Jarvis, help\"\nDisplay this help message";



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
		res.end(jarUnknown());
	}
};

var server = http.createServer(function(req, res) {
	console.log("Message Received");
	processPost(req, res, function(preqstr) {
		console.log(preqstr);
		var cmd = command.parse(preqstr);
		res.writeHead(200, "OK");
		if (cmd !== null) {
			//Warrant a response
			if (cmd["command"] == null) {
				res.end(cmd["nullresp"]);
			} else if (cmd["command"] == "wiki") {
				//Perform a wiki request and return the text
				wiki.request(cmd["target"], function(jobj) {
					if (jobj !== undefined) {
						console.log(jobj);
						res.end(jobj["title"] + '\n' + tags.remove(jobj["extract"]));
					} else {
						res.end("Wiki article not found.");
					}
				});
			} else if (cmd["command"] == "help") {
				res.end(helpstr);
			} else {
				res.end();
			}
		} else {
			res.end();
		}
		var tex = "";
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
server.listen(53000);