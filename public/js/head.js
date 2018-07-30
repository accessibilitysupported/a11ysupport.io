if (!String.prototype.includes) {
	String.prototype.includes = function(search, start) {
		'use strict';
		if (typeof start !== 'number') {
			start = 0;
		}

		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}

var getJson = function(url, success, err) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			success(JSON.parse(request.responseText));
		} else {
			// We reached our target server, but it returned an error
			err(request.status);
		}
	};
	request.onerror = err;
	request.send();
};
