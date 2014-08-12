var https = require('https');
var bid = "303b52438d097407caa94ef5cd";
var gadebug = false;
exports._gadebug = gadebug;
exports.send = function(message) {
	if (!gadebug) {
		_control(message);
	} else {
		console.log("SEND CMD INTERCEPT: " + message);
	}
	
}
function _control(message) {
	if (message.length > 450) {
		_send(message.substring(0,450));
		message = message.substring(450);
		setTimeout(_control(message), 7000);
	} else {
		_send(message);
	}
}
function _send (message) {
	var jsonstr = JSON.stringify({"bot_id": bid, "text": message});
	var headers = {"content-type":"application/json"};
	var options = {"host":"api.groupme.com", "path":"/v3/bots/post", "method":"post", "headers": headers};
	
	var req = https.request(options, function(response) {
		console.log("HEADERS " + response.headers);
		response.on('data', function() {});
	});
	req.write(jsonstr);
	req.end();
}