let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");

/* GET feature listing. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../tech.json');
	let helper = require(__dirname+'/../src/feature-helper.js');

	res.render('tech-index', {
		tech: tech,
		title: 'All Technologies',
		helper: helper
	});
});

/* GET feature listing. */
router.get('/:techId', function(req, res, next) {
	let tech = require(__dirname+'/../tech.json');
	let helper = require(__dirname+'/../src/feature-helper.js');

	res.render('tech', {
		techId: req.params.techId,
		tech: tech[req.params.techId],
		title: req.params.techId,
		helper: helper
	});
});

/* GET a specific feature. */
router.get('/:techId/:featureId', function(req, res, next) {
	let helper = require(__dirname+'/../src/feature-helper');
	let feature_object = require(__dirname+'/../data/tech/'+sanitize(req.params.techId)+'/'+sanitize(req.params.featureId)+'.json');
	helper.initalizeFeatureObject(feature_object);

	res.render('feature', {
		title: 'Feature',
		techId: req.params.techId,
		featureId: req.params.featureId,
		data: feature_object,
		helper: helper
	});
});

/* GET a specific test for a feature. */
router.get('/:techId/:featureId/:testIndex', function(req, res, next) {
	let helper = require(__dirname+'/../src/feature-helper');
	let feature_object = require(__dirname+'/../data/tech/'+sanitize(req.params.techId)+'/'+sanitize(req.params.featureId)+'.json');
	helper.initalizeFeatureObject(feature_object);

	let test = feature_object.tests[req.params.testIndex];
	let test_html = false;
	let test_html_file = __dirname+'/../data/test_data/'+sanitize(req.params.techId)+'/'+sanitize(req.params.featureId)+'/'+sanitize(test.id)+'.html';
	if (fs.existsSync(test_html_file)) {
		test_html = fs.readFileSync(test_html_file, 'utf8');
	}

	res.render('feature-test', {
		title: 'Test: '+test.title,
		techId: req.params.techId,
		featureId: req.params.featureId,
		testIndex: req.params.testIndex,
		testHTML: test_html,
		test: test,
		data: feature_object,
		helper: helper
	});
});

module.exports = router;
