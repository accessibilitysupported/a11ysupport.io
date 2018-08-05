let moment = require('moment');
let currentDateString = moment().format('YYYY-MM-DD');

/**
 * This function will take a markdown formatted string from a github SupportPoint issue (or comment). It will parse it and then convert it to an object that represents all of the data that is needed to modify the test file (done by another script).
 *
 * @param body
 * @returns {{testId: null, at: null, browser: null, supportPoint: {at_version: null, browser_version: null, os_version: null, support: null, date: string, output: Array, notes: string}}}
 */
let spMdToObject = function(body) {
	let lines = body.split("\r\n");
	let skipColumns = ['property', '---', 'title'];
	let inNotes = false;

	let object = {
		testId: null,
		at: null,
		browser: null,
		supportPoint: {
			at_version: null,
			browser_version: null,
			os_version: null,
			support: null,
			date: currentDateString,
			output: [],
			notes: ''
		}
	};

	// There may be extra lines above and below the table.
	lines.forEach(function(line) {
		line = line.trim();
		if (line === '== begin notes ==') {
			inNotes = true;
			return;
		}
		if (inNotes) {
			if (line === '== end notes ==') {
				object.supportPoint.notes = object.supportPoint.notes.trim();
				inNotes = false;
				return;
			} else {
				object.supportPoint.notes += line + '\n';
			}
		}

		let columns = line.split('|');
		if (columns.length !== 4) {
			// This is not a table row
			return;
		}

		let property = columns[1].trim();
		let value = columns[2].trim();

		if (skipColumns.includes(property)) {
			if (property === 'title') {
				object.testId = value;
			}

			return;
		}

		if (property.indexOf('output_') === 0) {
			let match = property.match(/(\d+)/);
			let index = parseInt(match[0])-1;
			if (!object.supportPoint.output[index]) {
				object.supportPoint.output[index] = {};
			}

			let tmpProperty = property.replace(/output_(\d+)_/, '');
			object.supportPoint.output[index][tmpProperty] = value;
		} else if (property === 'at' || property === 'browser') {
			object[property] = value;
		} else {
			object.supportPoint[property] = value;
		}
	});

	return object;
};

module.exports = spMdToObject;