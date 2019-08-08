let express = require('express');
let router = express.Router();
let fs = require('fs');
let createError = require('http-errors');
let testHelper = require('../src/test-id-helper.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	let tech = require(__dirname+'/../build/tech.json');
	res.render('index', {
		title: 'Accessibility Support',
		features: require(__dirname+'/../build/features.json'),
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json')
	});
});

router.get('/contribute', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../CONTRIBUTING.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Contributing | Accessibility Support',
		result: result
	});
});

router.get('/run-tests', function(req, res, next) {
	let supportPoints = require(__dirname+'/../build/support_points.json');
	res.render('run-tests', {
		title: 'Run Tests | Accessibility Support',
		supportPoints: supportPoints,
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		testHelper: testHelper
	});
});

router.get('/faq', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../FAQ.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'FAQ | Accessibility Support',
		result: result
	});
});

router.get('/learn', function(req, res, next) {
	let markdown = fs.readFileSync(__dirname+'/../documentation/learn.md', 'utf8');
	let MarkdownIt = require('markdown-it');
	let md = new MarkdownIt().use(require('markdown-it-anchor'));
	let result = md.render(markdown);
	res.render('static-page', {
		title: 'Learn | Accessibility Support',
		result: result
	});
});

router.get('/learn/commands', function(req, res, next) {
	res.render('commands', {
		title: 'All AT commands | Accessibility Support',
		commands: require(__dirname+'/../build/command_matrix.json'),
		ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
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
	let at_id = req.params.id;

	if (at_id === 'dragon') {
		at_id = 'dragon_win';
	}

	res.render('learn-at', {
		title: req.params.id + ' | Learn | Accessibility Support',
		markdown: result,
        ATBrowsers: require(__dirname+'/../data/ATBrowsers.json'),
		at_id: at_id,
		command_list_has_notes: function(command_list, tag) {
			return !!Object.values(command_list).find(function(command) {
				return command.tags.includes(tag) && command.note;
			});
		},
		command_list_contains_tag: function(command_list, tag) {
            return !!Object.values(command_list).find(function(command) {
                return command.tags.includes(tag);
            });
        },
	});
});

module.exports = router;
