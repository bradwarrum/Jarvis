var schedule = require('node-schedule');
var groupme = require('./groupme.js');
var st_i = 0;
var references = [];
var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function STime(month, day, hour, minute){
	this.month = "";
	for (var i = 0; i< 12; i++) {
		if (months[i] == month.toLowerCase()) {
			this.month = i;
			break;
		}
	}
	this.day = parseInt(day);
	this.hour = parseInt(hour);
	this.minute = parseInt(minute);
}
exports.STime = STime;

exports.setup = function(at, message) {
	console.log(message);
	var date = new Date(2014, at.month, at.day, at.hour, at.minute, 0, 0);
	if (date < new Date()) {
		return -1;
	}
	if (isNaN(date.getTime())) {
		return -2;
	}
	console.log(date);
	console.log(date.getTime());
	var stask = schedule.scheduleJob(date, function() {ralarm(message, st_i);});
	stask.jobid = st_i;
	st_i+=1;
	references[stask.jobid] = stask;
	return stask.jobid;
}

exports.cancel = function(id) {
	if (references[id] !== null && references[id] !== undefined) {
		references[id].cancel();
		references.splice(id, 1);
		return true;
	}
	return false;
}

function ralarm(message, id) {
	console.log("Alarm: " + message);
	groupme.send(message);
	references.splice(id, 1);
}