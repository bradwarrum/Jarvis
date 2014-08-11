var S = require('string');

var jarUnknown = function() {
	var jarUnknownResp = ["I do not understand your request.", 
						"Excuse me?", 
						"I'm afraid I don't know what you're talking about.", 
						"Please repeat your request.", 
						"I cannot parse your request."];
	var select = Math.floor(Math.random() * 5);
	return jarUnknownResp[select];
}

exports.parse = function(body) {
	var text = "";
	try {
		text = JSON.parse(body)['text'].trim();
	} catch (e) {
		text = "";
	}
	//var text = body.trim();
	if (text !== undefined) {
		// First test if someone called our name
		var jname = /^Jarvis.*$/gi.test(text);
		if (jname) {
			var jmatch = /^Jarvis.*((wiki|weather|forecast)( for)?|help|say|reminder|cancel)[^ ]*(.*)/gi.exec(text);
			if (jmatch !== null) {
				console.log("Match: " + jmatch);
				console.log("Command: " + jmatch[1] + "\n" + "Target: " + jmatch[4]);
				return {"command": jmatch[1].trim(),
						"target": jmatch[4].trim(),
						"nullresp": null};
			} else {
				// We were called but the command doesn't match. Return a response.
				console.log("No command found.");
				return {"command": null,
						"target": null,
						"nullresp":jarUnknown()};
			}
		} else {
			// We weren't called, do nothing
			return null;
		}
	}
}