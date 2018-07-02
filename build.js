let fs = require('fs');
let helper = require(__dirname+'/src/feature-helper');
let tech = {
	'html': {
		id: 'html',
		references: [
			{
				"title": "W3C HTML5 Standard",
				"url": "https://w3c.github.io/html/"
			},
			{
				"title": "HTML Accessibility API Mapping",
				"url": "https://w3c.github.io/html-aam/"
			}
		],
		features: []
	},
	'css': {
		id: 'css',
		references: [
			{
				"title": "W3C CSS Standards",
				"url": "https://www.w3.org/standards/techs/css"
			},
			{
				"title": "Core Accessibility API Mapping",
				"url": "https://www.w3.org/TR/core-aam-1.1/"
			},
			{
				"title": "Accessible Name and Description Computation",
				"url": "https://www.w3.org/TR/accname-1.1/"
			},
		],
		features: []
	},
	'aria': {
		id: 'aria',
		features: []
	},
	'svg': {
		id: 'svg',
		features: []
	}
};

let testMap = {};

let getFeatures = function(techId) {
	let dir_feature = __dirname + '/data/tech/'+techId;
	let files = fs.readdirSync(dir_feature);
	let features = [];
	files.forEach(function(file) {
		let feature = require(dir_feature+'/'+file);
		let id = file.slice(0, -5);
		let failingTests = [];
		helper.initalizeFeatureObject(feature);

		for (let testIndex = 0; testIndex < feature.tests.length; testIndex++) {
			if (!testMap[feature.tests[testIndex].id]) {
				testMap[feature.tests[testIndex].id] = [];
			}
			testMap[feature.tests[testIndex].id].push({
				techId: techId,
				featureId: id,
				title: feature.title
			});

			//populate failing tests
			if (feature.tests[testIndex].core_support.includes('n')) {
				failingTests.push({
					title: feature.tests[testIndex].title,
					id: feature.tests[testIndex].id
				});
			}
		}

		features.push({
			id: id,
			title: feature.title,
			core_support: feature.core_support,
			failing_tests: failingTests
		});
	});

	return features;
};

tech.html.features = getFeatures('html');
tech.css.features = getFeatures('css');

fs.writeFileSync(__dirname+'/tech.json', JSON.stringify(tech));
fs.writeFileSync(__dirname+'/test_map.json', JSON.stringify(testMap));
