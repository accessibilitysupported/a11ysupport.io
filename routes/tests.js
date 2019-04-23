let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");
let createError = require('http-errors');
let MarkdownIt = require('markdown-it');
let md = new MarkdownIt().use(require('markdown-it-anchor'));
let testIdHelper = require('../src/test-id-helper.js');

/* GET a specific test for a feature. */
router.get('/:testId', function(req, res, next) {
    let testId = testIdHelper.undoMakeSafe(req.params.testId);
	let testMap = require(__dirname+'/../build/test_map');
	let features = testMap[testId];
	let test_html, test, test_html_file;

	if (!features || !features.length) {
		// Not found in the test_map.
		next(createError(404));
		return;
	}

	try {
		test = require(__dirname+'/../build/tests/'+testId+'.json');
	} catch (e) {
		// Not found
		next(createError(404));
		return;
	}

	test_html_file = __dirname+'/../data/tests/html/'+testId+'.html';

	if (test.html_file) {
		test_html_file = __dirname+'/../data/tests/html/'+test.html_file;
	}

	if (fs.existsSync(test_html_file)) {
		test_html = fs.readFileSync(test_html_file, 'utf8');
	}

	res.render('test-case', {
		title: 'Test: '+test.title + ' | Accessibility Support',
		techId: req.params.techId,
		testMap: testMap,
		testHTML: test_html,
		test: test,
		features: features,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		md: md,
        testIdHelper: testIdHelper
	});
});

/* Run a specific test for a feature. */
router.get('/:testId/run', function(req, res, next) {
    let testId = testIdHelper.undoMakeSafe(req.params.testId);
    let testMap = require(__dirname+'/../build/test_map');
    let features = testMap[testId];
    let test_html, test, test_html_file;

	if (!features || !features.length) {
		// Not found in the test_map.
		next(createError(404));
		return;
	}

	try {
		test = require(__dirname+'/../build/tests/'+testId+'.json');
	} catch (e) {
		// Not found
		next(createError(404));
		return;
	}

	test_html_file = __dirname+'/../data/tests/html/'+testId+'.html';

	if (test.html_file) {
		test_html_file = __dirname+'/../data/tests/html/'+test.html_file;
	}

    if (fs.existsSync(test_html_file)) {
        test_html = fs.readFileSync(test_html_file, 'utf8');
    }

    res.render('test-case-run', {
        title: 'Test: '+test.title + ' | Accessibility Support',
        techId: req.params.techId,
        testMap: testMap,
        testHTML: test_html,
        test: test,
        features: features,
        ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		md: md,
        testIdHelper: testIdHelper
    });
});

/* GET a specific test for a feature. */
router.get('/:testId/:featureId/:featureAssertionId/:atId/:browserId', function(req, res, next) {
    let testId = testIdHelper.undoMakeSafe(req.params.testId);
    let featureId = testIdHelper.undoMakeSafe(req.params.featureId);
	let testMap = require(__dirname+'/../build/test_map');
	let features = testMap[testId];
	let test_html, test, test_html_file;
	let ATBrowsers = require(__dirname+'/../data/ATBrowsers.json');

	if (!features || !features.length) {
		// Not found in the test_map.
		next(createError(404));
		return;
	}

	try {
		test = require(__dirname+'/../build/tests/'+testId+'.json');
	} catch (e) {
		// Not found
		next(createError(404));
		return;
	}

	let assertion = test.assertions.find(
		o =>
			o.feature_id === featureId
			&& o.feature_assertion_id === req.params.featureAssertionId
	);

	if (!assertion) {
		// Not found
		next(createError(404));
		return;
	}

	if (!assertion.results[req.params.atId]) {
		// Not found
		next(createError(404));
		return;
	}

	if (!assertion.results[req.params.atId].browsers[req.params.browserId]) {
		// Not found
		next(createError(404));
		return;
	}

    test_html_file = __dirname+'/../data/tests/html/'+testId+'.html';

    if (test.html_file) {
        test_html_file = __dirname+'/../data/tests/html/'+test.html_file;
    }

    if (fs.existsSync(test_html_file)) {
        test_html = fs.readFileSync(test_html_file, 'utf8');
    }

	res.render('test-case-support-point', {
		title: req.params.atId + '/' + req.params.browserId + ' | Test: '+test.title + ' | Accessibility Support',
		techId: req.params.techId,
		atId: req.params.atId,
		browserId: req.params.browserId,
		testMap: testMap,
		testHTML: test_html,
		test: test,
		features: features,
		ATBrowsers: ATBrowsers,
		md: md,
		assertion: assertion,
        testIdHelper: testIdHelper
	});
});

module.exports = router;
