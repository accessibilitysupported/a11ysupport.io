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

module.exports = router;
