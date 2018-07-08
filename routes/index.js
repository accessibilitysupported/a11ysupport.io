let express = require('express');
let router = express.Router();
let fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../build/tech.json');
	res.render('index', {
		title: 'Accessibility Supported',
		tech: tech
	});
});

router.get('/contribute', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../CONTRIBUTING.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Contributing | Accessibility Supported',
		result: result
	});
});

router.get('/faq', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../FAQ.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'FAQ | Accessibility Supported',
		result: result
	});
});

module.exports = router;
