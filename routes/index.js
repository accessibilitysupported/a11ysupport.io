var express = require('express');
var router = express.Router();
let fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../tech.json');
	let helper = require(__dirname+'/../src/feature-helper.js');
	res.render('index', {
		title: 'Accessibility Supported',
		tech: tech,
		helper: helper
	});
});

router.get('/contribute', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../CONTRIBUTING.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Contributing',
		result: result
	});
});

router.get('/faq', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../FAQ.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Contributing',
		result: result
	});
});

module.exports = router;
