var S = require('string');
exports.remove = function(str) {
	return S(str.replace(/(\<.*?\>)/g, '')).decodeHTMLEntities().s;
}
