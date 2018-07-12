let express = require('express');
let router = express.Router();
let fs = require('fs');
let createError = require('http-errors');

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

router.get('/learn', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../documentation/learn.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Learn | Accessibility Supported',
		result: result
	});
});

router.get('/learn/at/:id', function(req, res, next) {
	let allowed = ['dragon', 'jaws', 'narrator', 'nvda', 'talkback', 'vo_ios', 'vo_macos'];

	if (!allowed.includes(req.params.id)) {
		next(createError(404));
		return;
	}

	let markdown = fs.readFileSync(__dirname+'/../documentation/at/'+req.params.id+'.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: req.params.id + ' | Learn | Accessibility Supported',
		result: result
	});
});

module.exports = router;
