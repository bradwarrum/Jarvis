var http = require('http');
var qs = require('querystring');

exports.current = function(city, state, zip, callback) {
	if (typeof(callback) !== 'function') return null;
	var params = getParams(city,state,zip,true);
	if (params === null) callback(null);
	var reqstr = {"hostname":"api.wunderground.com",
					"path":params};
	var req = http.get(reqstr, function (response) {
					var d  = "";
					response.on('data', function(chunk) {
						d += chunk;
					});
					response.on('end', function() {
						try {
							var jdata = JSON.parse(d);
							callback(jdata);
						} catch (e) {
							callback(null);
						}
					});
				
	});
	req.on('error', function(data) {
		console.log("error searching weather");
		callback(null);
	});
}

exports.forecast = function(city, state, zip, callback) {
	if (typeof(callback) !== 'function') return null;
	var params = getParams(city,state,zip,false);
	if (params === null) {callback(null)};
	var reqstr = {"hostname":"api.wunderground.com",
					"path":params};
	var req = http.get(reqstr, function(response) {
		var d= "";
		response.on('data', function(chunk) {
			d += chunk;
		});
		response.on('end', function() {
			try {
				var jdata = JSON.parse(d);
				callback(jdata);
			} catch (e) {
				callback(null);
			}
		});
	});
	req.on('error', function(data) {
		console.log("error searching forecast");
		callback(null);
	});
}

function getParams(city, state, zip, current) {
	city = city.trim();
	state = state.trim();
	zip = zip.trim();
	if (city == "" && zip == "") return null;
	var params = "";
	if (current) 
		params = "/api/6d0faa7ca40a1d94/conditions/q/";
	else
		params = "/api/6d0faa7ca40a1d94/forecast10day/q/";
	if (city == "") {
		//Resort to zipcode
		params += (zip + ".json");
	} else {
		if (state == "" || state.trim().length !== 2) {
			params += "IN/" + city.trim().replace(/ /g, '_') + ".json";
		} else {
			params += state.trim() + "/" + city.trim().replace(/ /g, '_') + ".json";
		}
	}
	return params;
}	

exports.cToString = function(jobj) {
	resp = jobj.response;
	if (resp.error == null) {
		try {
			jobj = jobj.current_observation;
			var rstr = "Current Conditions for " + jobj.display_location.full + ":\n\n";
			rstr += "Temperature: " + jobj.temp_f + " F\n";
			rstr += "Wind: " + jobj.wind_mph + " mph " + jobj.wind_dir + "\n";
			rstr += jobj.weather;
			return rstr;
		} catch (e){
			return "Conditions not found.";
		}
	} else {
		return "Conditions not found.";
	}
}

exports.fToString = function(jobj, city, state, zip) {
	city = city.trim();
	state = state.trim();
	zip = zip.trim();
	console.log("\"" + city + "\", \"" + state + "\", \"" + zip + "\"");
	resp = jobj.response;
	if (resp.error == null) {
		try {
			jobj = jobj.forecast.simpleforecast;
			var cs = "";
			if (zip == "") {
				if (state == "") cs = city + ", IN";
				else cs = city + ", " + state;
			} else {
			cs = zip;
			console.log("ZIP CODE ONLY");
			}
			var rstr = "7 Day Forecast for " + cs + ": \n\n"
			for (var d = 0; d < 7; d++) {
				var day = jobj.forecastday[d]
				rstr += day.date.weekday_short + ": " + "Hi " + day.high.fahrenheit + "F, Lo " + day.low.fahrenheit + "F\n";
				rstr += day.conditions + "\n\n";
			}
			return rstr;
		} catch (e){
			return "Forecast not found.";
		}
	} else {
		return "Forecast not found.";
	}
}