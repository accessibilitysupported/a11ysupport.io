let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");
let createError = require('http-errors');

/* GET a specific test for a feature. */
router.get('/:testId', function(req, res, next) {
	let testMap = require(__dirname+'/../build/test_map');
	let features = testMap[req.params.testId];
	let test_html, test, test_html_file;

	try {
		test = require(__dirname+'/../build/tests/'+sanitize(req.params.testId)+'.json');
	} catch (e) {
		// Not found
		next(createError(404));
		return;
	}

	test_html_file = __dirname+'/../data/tests/html/'+sanitize(req.params.testId)+'.html';

	if (fs.existsSync(test_html_file)) {
		test_html = fs.readFileSync(test_html_file, 'utf8');
	}

	res.render('test-case', {
		title: 'Test: '+test.title + ' | Accessibility Supported',
		techId: req.params.techId,
		testMap: testMap,
		testHTML: test_html,
		test: test,
		features: features,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json')
	});
});

/* GET a specific test for a feature. */
router.get('/:testId/:atId/:browserId', function(req, res, next) {
	let testMap = require(__dirname+'/../build/test_map');
	let features = testMap[req.params.testId];
	let test_html, test, test_html_file;
	let ATBrowsers = require(__dirname+'/../data/ATBrowsers.json');

	try {
		test = require(__dirname+'/../build/tests/'+sanitize(req.params.testId)+'.json');
	} catch (e) {
		// Not found
		next(createError(404));
		return;
	}

	if (!test.at[req.params.atId]) {
		// Not found
		next(createError(404));
		return;
	}

	if (!test.at[req.params.atId].browsers[req.params.browserId]) {
		// Not found
		next(createError(404));
		return;
	}

	test_html_file = __dirname+'/../data/tests/'+sanitize(req.params.testId)+'.html';

	if (fs.existsSync(test_html_file)) {
		test_html = fs.readFileSync(test_html_file, 'utf8');
	}

	res.render('test-case-support-point', {
		title: req.params.atId + '/' + req.params.browserId + ' | Test: '+test.title + ' | Accessibility Supported',
		techId: req.params.techId,
		atId: req.params.atId,
		browserId: req.params.browserId,
		testMap: testMap,
		testHTML: test_html,
		test: test,
		features: features,
		ATBrowsers: ATBrowsers
	});
});

module.exports = router;
