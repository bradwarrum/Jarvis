var http = require('http');
var qs = require('querystring');

exports.request = function(title, callback) {
	if (typeof(callback) !== 'function') return null;
	var params = {"action":"query",
					"prop":"extracts",
					"format":"json",
					"exchars":800,
					"exlimit":1,
					"explaintext":"",
					"exsectionformat":"plain",
					"redirects":"",
					"titles":title};
	var fparams = "/w/api.php?" + qs.stringify(params);
	var options = {"hostname": "en.wikipedia.org",
					"path":fparams};
	console.log(options);
	http.request(options, function(response) {
		response.on('data', function(data) {
			console.log(JSON.parse(data));
			var jdata = JSON.parse(data)['query']['pages'];
			var r;
			for (var k in jdata) {
				if (jdata.hasOwnProperty(k)) {
					if (k == "-1") {
						r = undefined;
						break;
					}
					r = jdata[k];
				}
			}
			callback(r);
		});
	}).end();
	
};