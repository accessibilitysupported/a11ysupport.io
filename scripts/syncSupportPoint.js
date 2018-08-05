const argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');
let moment = require('moment');
let currentDateString = moment().format('YYYY-MM-DD');
let spMdToObject = require(__dirname+'/../src/sp-md-to-obj.js');

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
	let data = spMdToObject(body);
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

