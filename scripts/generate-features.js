let fs = require('fs');
const fetch = require('node-fetch');
let sanitize = require("sanitize-filename");
let moment = require('moment');

let currentDateString = moment().format('YYYY-MM-DD');

let createFeature = function(id, techId, title, description, linkTitle, linkUrl) {
	//Ensure a constant and safe file name
	id = id.replace(' ', '_').toLowerCase(); //Remove spaces
	id = sanitize(id);

	let file = __dirname + '/../data/tech/'+techId+'/'+id+'.json';

	if (fs.existsSync(file)) {
		// Don't overwrite existing files
		return;
	}

	let feature = {
		"id": id,
		"title": title,
		"description": "",
		"references": [],
		"tests": [],
		"date_updated": currentDateString
	};

	if (description) {
		feature.description = description;
	}

	if (linkTitle && linkUrl) {
		feature.references.push({
			title: linkTitle,
			url: linkUrl
		});
	}

	fs.writeFileSync(file, JSON.stringify(feature, null, 2));
};

fetch('https://raw.githubusercontent.com/w3c/elements-of-html/master/elements.json')
	.then(res => res.json())
	.then(function(json) {
		for (let i=0; i<json.length; i++) {
			if (!json[i].specs.includes('5.2')) {
				continue;
			}

			// There are a LOT of elements, so lets reduce it to keep it simple for testing purposes
			let temporary_whitelist = ['a', 'abbr', 'article', 'canvas', 'dialog', 'input[type="text"]', 'input[type="tel"]', 'progress'];
			if (!temporary_whitelist.includes(json[i].element)) {
				continue;
			}

			let id = json[i].element + '_element';
			let title = json[i].element + ' Element';

			createFeature(id, 'html', title, null, 'HTML5 spec for ' + json[i].element, json[i].link);
		}
	});
