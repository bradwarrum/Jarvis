var schedule = require('node-schedule');
var groupme = require('./groupme.js');
var st_i = 0;
var references = [];
var yr = 2014;
var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function ainc() {
	var rv = st_i;
	st_i += 1;
	if (st_i === 40) st_i = 0;
	return rv;
}
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
	var date = new Date(yr, at.month, at.day, at.hour, at.minute, 0, 0);
	if (date < new Date()) {
		return -1;
	}
	if (isNaN(date.getTime())) {
		return -2;
	}
	console.log(date);
	console.log(date.getTime());
	var stask = schedule.scheduleJob(date, function() {ralarm(message, st_i);});
	stask.jobid = ainc();
	references[stask.jobid] = stask;
	console.log(references);
	return stask.jobid;
}

exports.setuprecurrence = function(recur, d, h, m, message) {
	h = parseInt(h);
	m = parseInt(m);
	if (isNaN(h) || isNaN(m)) {
		return -1;
	}
	var pass = false;
	var r = null;
	if (recur === "daily") {
		r = new schedule.RecurrenceRule();
		r.hour = h;
		r.minute = m;
		r.second = 0;
		pass = true;
	}else{
		d = parseInt(d);
		if (isNaN(d)) return -1;
		
		r = new schedule.RecurrenceRule();
			r.hour = h;
			r.minute = m;
			r.second = 0;
		if (recur === "weekly" && d >=0 && d <= 6) {
			r.dayOfWeek = d;
			pass = true;
		} else if (recur === "monthly" && d>=0 && d <= 30) {
			r.date = d;
			pass = true;
		}
	}
	if (pass) {
		var stask = schedule.scheduleJob(r, function() {ralarmDNK(message, st_i);});
		stask.jobid = ainc()
		if (references[stask.jobid] === null) references[stask.jobid].cancel();
		references[stask.jobid] = stask;
		console.log(references);
		return stask.jobid;
	} else {
		return -1;
	}
}

exports.cancel = function(id) {
	id = parseInt(id);
	if (references[id] !== null && references[id] !== undefined) {
		references[id].cancel();
		references[id] = null;
		return true;
	}
	console.log(references);
	return false;
}

function ralarm(message, id) {
	console.log("Alarm: " + message);
	groupme.send(message);
	exports.cancel(id);
}
function ralarmDNK(message) {
	console.log("Alarm: " + message);
	groupme.send(message);
}