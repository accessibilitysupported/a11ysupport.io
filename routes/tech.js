let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");
let createError = require('http-errors');
let MarkdownIt = require('markdown-it');
let md = new MarkdownIt().use(require('markdown-it-anchor'));
let testHelper = require('../src/test-id-helper.js');
const moment = require('moment');

/* GET feature listing. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../build/tech.json');

	res.render('tech-index', {
		tech: tech,
		title: 'All Technologies | Accessibility',
		moment: moment
	});
});

/* GET feature listing. */
router.get('/:techId', function(req, res, next) {
	let tech = require(__dirname+'/../build/tech.json');

	if (!tech[req.params.techId]) {
		// Not found
		next(createError(404));
		return;
	}

	res.render('tech', {
		title: req.params.techId + ' | Accessibility Support',
		techId: req.params.techId,
		tech: tech[req.params.techId],
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		testHelper: testHelper,
		moment: moment
	});
});

/* GET a specific feature. */
router.get('/:techId/:featureId', function(req, res, next) {
	let feature_object;
	try {
		feature_object = require(__dirname+'/../build/tech/'+sanitize(req.params.techId)+'/'+sanitize(req.params.featureId)+'.json');
	} catch(e) {
		// Not found
		next(createError(404));
		return;
	}

	let related_features = [];
	if (feature_object.related_features) {
		var features = require(__dirname+'/../build/features.json');
		feature_object.related_features.forEach(function(id) {
			var tech_id = id.split('/')[0];
			var feature_id = id.split('/')[1];
			let found = features.find(obj => obj.techId === tech_id && obj.id === feature_id);
			if (found) {
				related_features.push(found);
			}
		});
	}

	res.render('feature', {
		title: req.params.featureId + ' (' + req.params.techId + ') | Accessibility Support',
		techId: req.params.techId,
		featureId: req.params.featureId,
		data: feature_object,
		related_features: related_features,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		md: md,
		testHelper: testHelper,
		moment: moment
	});
});

module.exports = router;
