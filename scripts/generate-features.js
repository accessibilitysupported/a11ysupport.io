let fs = require('fs');
const fetch = require('node-fetch');
let sanitize = require("sanitize-filename");
let moment = require('moment');

let currentDateString = moment().format('YYYY-MM-DD');

let urlSafe = function(string) {
	string = string.replace('[', '(');
	string = string.replace(']', ')');
	string = string.replace('=', '-');
	return string;
};

let createFeature = function(id, featureType, techId, title, description, linkTitle, linkUrl) {
	//Ensure a constant and safe file name
	id = id.replace(' ', '_').toLowerCase(); //Remove spaces
	id = sanitize(id);
	id = urlSafe(string);

	let file = __dirname + '/../data/tech/'+techId+'/'+id+'.json';

	if (fs.existsSync(file)) {
		// Don't overwrite existing files
		return;
	}

	let feature = {
		"id": id,
		"title": title,
		"type": featureType,
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
			let temporary_whitelist = ['canvas', 'dialog', 'input[type="text"]', 'input[type="tel"]', 'th', 'td'];
			if (!temporary_whitelist.includes(json[i].element)) {
				continue;
			}

			let id = json[i].element + '_element';
			let title = json[i].element + ' element';

			createFeature(id, 'element', 'html', title, null, 'HTML5 spec for ' + json[i].element, json[i].link);
		}
	});

// ARIA 1.1
fetch('https://raw.githubusercontent.com/jamiebuilds/aria-data/master/data.json')
	.then(res => res.json())
	.then(function(json) {

		// Temporary whitelist to keep things at a minimum during prototyping
		let whitelist_roles = ['alert'];
		let whitelist_attributes = ['aria-hidden'];

		for (let key in json.roles) {
			let role = json.roles[key];

			if (!whitelist_roles.includes(role.name)) {
				continue;
			}

			let id = role.name + '_role';
			let title = role.name + ' role';

			createFeature(id, 'role', 'aria', title, role.description, 'ARIA spec for ' + role.name, key);
		}


		for (let key in json.attributes) {
			let attribute = json.attributes[key];

			if (!whitelist_attributes.includes(attribute.name)) {
				continue;
			}

			let id = attribute.name + '_attribute';
			let title = attribute.name + ' attribute';

			createFeature(id, 'attribute', 'aria', title, attribute.description, 'ARIA spec for ' + attribute.name, key);
		}
	});
