let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");

/* GET a specific test for a feature. */
router.get('/:testId', function(req, res, next) {
	let testMap = require(__dirname+'/../build/test_map');
	let features = testMap[req.params.testId];
	let test_html = false;
	let test = require(__dirname+'/../build/tests/'+sanitize(req.params.testId)+'.json');
	let test_html_file = __dirname+'/../data/tests/'+sanitize(req.params.testId)+'.html';

	if (fs.existsSync(test_html_file)) {
		test_html = fs.readFileSync(test_html_file, 'utf8');
	}

	res.render('test-case', {
		title: 'Test: '+test.title + ' test | Accessibility Supported',
		techId: req.params.techId,
		testMap: testMap,
		testHTML: test_html,
		test: test,
		features: features,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json')
	});
});

module.exports = router;
