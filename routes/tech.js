let express = require('express');
let router = express.Router();
let fs = require('fs');
let sanitize = require("sanitize-filename");
let createError = require('http-errors');
let MarkdownIt = require('markdown-it');
let md = new MarkdownIt().use(require('markdown-it-anchor'));

/* GET feature listing. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../build/tech.json');

	res.render('tech-index', {
		tech: tech,
		title: 'All Technologies | Accessibility',
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
		title: req.params.techId + ' | Accessibility Supported',
		techId: req.params.techId,
		tech: tech[req.params.techId],
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json')
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

	res.render('feature', {
		title: req.params.featureId + ' ' + req.params.techId + ' Feature | Accessibility Supported',
		techId: req.params.techId,
		featureId: req.params.featureId,
		data: feature_object,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		md: md
	});
});

module.exports = router;
