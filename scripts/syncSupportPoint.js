const argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');
let moment = require('moment');
let currentDateString = moment().format('YYYY-MM-DD');

void async function() {
	const GitHub = require('github-api');
	const gh = new GitHub();
	let issue = gh.getIssues('accessibilitysupported', 'a11ysupport.io');

	let body;

	if (argv.issue) {
		let result = await issue.getIssue(argv.issue);
		body = result.data.body;
	} else if (argv.comment) {
		let result = await issue.getIssueComment(argv.comment);
		body = result.data.body;
	} else {
		console.log('Invalid command.');
		console.log('syncSupportIssue.js --issue {issue-id}');
		console.log('syncSupportIssue.js --comment {comment-id}');
		process.exit();
	}

	// now process the body
	let data = markdownBodyToObject(body);
	if (!data.testId) {
		console.log('data is not complete, missing the testId');
		process.exit();
	}

	let testFile = __dirname + '/../data/tests/'+data.testId+'.json';
	let test = require(testFile);

	if (!test) {
		console.log('test could not be found');
		process.exit();
	}

	test.at[data.at].browsers[data.browser] = data.supportPoint;

	test.history.push({
		date: currentDateString,
		message: data.at+'/'+data.browser+' support updated'
	});

	fs.writeFileSync(testFile, JSON.stringify(test, null, 2));
}();

let markdownBodyToObject = function(body) {
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
			notes: null
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
		if (columns.length != 4) {
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
