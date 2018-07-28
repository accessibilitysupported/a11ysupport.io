let fs = require('fs');
let rimraf = require('rimraf');

let helper = require(__dirname+'/src/feature-helper');
let tech = require(__dirname+"/data/tech.json");
let ATBrowsers = require(__dirname+"/data/ATBrowsers.json");
let testMap = {};
let allFeatures = [];

/**
 * Generic array sorting
 *
 * @param property
 * @returns {Function}
 */
let sortByProperty = function (property) {
	return function (x, y) {
		return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
	};
};

let getFeatures = function(techId, buildDir) {
	let dir_feature = __dirname + '/data/tech/'+techId;
	if (!fs.existsSync(dir_feature)) {
		// Directory doesn't exist, so there are not features yet
		return;
	}
	let files = fs.readdirSync(dir_feature);
	let features = [];
	let techDir = buildDir+'/tech/'+techId;

	if (!fs.existsSync(techDir)) {
		fs.mkdirSync(techDir);
	}

	files.forEach(function(file) {
		let feature = require(dir_feature+'/'+file);
		let id = file.slice(0, -5);
		let failingTests = [];

		// Initialize the feature object to add missing data points and generate support strings
		helper.initalizeFeatureObject(feature);
		feature.id = techId + '/' + id;
		feature.techId = techId;

		// Save initialized JSON in the build dir
		fs.writeFileSync(techDir+'/'+file, JSON.stringify(feature, null, 2));

		// Map associated tests
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

		// Push to the list of features
		features.push({
			id: id,
			techId: feature.techId,
			title: feature.title,
			core_support: feature.core_support,
			core_support_string: feature.core_support_string,
			core_support_by_at: feature.core_support_by_at,
			failing_tests: failingTests,
			total_test_count: feature.tests.length
		});
	});

	return features;
};

let buildDir = __dirname+'/build';
let dataDir = __dirname+'/data';

if (fs.existsSync(buildDir)) {
	rimraf.sync(buildDir);
}

fs.mkdirSync(buildDir);
fs.mkdirSync(buildDir+'/tech');
fs.mkdirSync(buildDir+'/tests');

let testFiles = fs.readdirSync(dataDir+'/tests');
let supportPoints = [];

testFiles.forEach(function(file) {
	if (!file.endsWith('.json')) {
		return;
	}

	let test = require(dataDir+'/tests/'+file);
	helper.initalizeTestCase(test);

	for(let at in ATBrowsers.at) {
		let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
		validBrowsers.forEach(function(browser) {
			supportPoints.push(test.at[at].browsers[browser]);
		});
	}

	fs.writeFileSync(buildDir+'/tests/'+file, JSON.stringify(test, null, 2));
});

for (let techId in tech) {
	tech[techId].features = getFeatures(techId, buildDir);

	if (tech[techId].features) {
		allFeatures = allFeatures.concat(tech[techId].features);
	}
}

allFeatures.sort(sortByProperty('title'));
supportPoints.sort(sortByProperty('priority'));

fs.writeFileSync(buildDir+'/tech.json', JSON.stringify(tech, null, 2));
fs.writeFileSync(buildDir+'/test_map.json', JSON.stringify(testMap, null, 2));
fs.writeFileSync(buildDir+'/features.json', JSON.stringify(allFeatures, null, 2));
fs.writeFileSync(buildDir+'/support_points.json', JSON.stringify(supportPoints, null, 2));