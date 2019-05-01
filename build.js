let fs = require('fs');
let rimraf = require('rimraf');
let glob = require('glob');

let helper = require(__dirname+'/src/feature-helper');
let tech = require(__dirname+"/data/tech.json");
let ATBrowsers = require(__dirname+"/data/ATBrowsers.json");
let testMap = {};
let featureMap = {};
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

		// search the test map for tests that include this id.
		feature.tests = [];
		if (featureMap[techId+'/'+id]) {
			feature.tests = featureMap[techId+'/'+id];
		}

		// Initialize the feature object to add missing data points and generate support strings
		helper.initalizeFeatureObject(feature, techId, techId + '/' + id);

		// Save initialized JSON in the build dir
		fs.writeFileSync(techDir+'/'+file, JSON.stringify(feature, null, 2));

		// Map associated tests
		for (let testIndex = 0; testIndex < feature.tests.length; testIndex++) {
			if (!testMap[feature.tests[testIndex].id]) {
				testMap[feature.tests[testIndex].id] = [];
			}

			// Slow, but it works. Room for optimization
			testMap[feature.tests[testIndex].id].forEach(function(data, index) {
				if (data.featureId !== feature.id) {
					return;
				}
				testMap[feature.tests[testIndex].id][index].techId = techId;
				testMap[feature.tests[testIndex].id][index].title = feature.title;
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
			keywords_string: feature.keywords_string,
			core_support: feature.core_support,
			core_support_string: feature.core_support_string,
			core_support_by_at: feature.core_support_by_at,
			core_support_by_at_browser: feature.core_support_by_at_browser,
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

//let testFiles = fs.readdirSync(dataDir+'/tests');
let supportPoints = [];

let testFiles = glob.sync(dataDir+'/tests/**/*.json');

testFiles.forEach(function(file) {
	if (!file.endsWith('.json')) {
		return;
	}

	// make the file name relative to the build dir
	file = file.replace(dataDir+'/tests/', '');

	// load the test
    let test = require(dataDir+'/tests/'+file);

	// Set the test ID to the file name minus the extension
	test.id = file.slice(0, -5);

	if (!test.html_file) {
		// html_file property isn't set. Map it to it's ID by default.
		test.html_file = test.id+'.html';
	}

	// Set up the test case
	helper.initalizeTestCase(test);

	test.assertions.forEach(assertion => {
		if (!testMap[test.id]) {
			testMap[test.id] = [];
		}

		let found = testMap[test.id].find(o => o.featureId === assertion.feature_id);
		if (!found) {
			testMap[test.id].push({
				// link tests with features here
				featureId: assertion.feature_id,
			});
		}

		// populate the featuremap
		if (!featureMap[assertion.feature_id]) {
			featureMap[assertion.feature_id] = [];
		}

		if (-1 === featureMap[assertion.feature_id].indexOf(test.id)) {
			featureMap[assertion.feature_id].push(test.id);
		}
	});

	test.assertions.forEach(assertion => {
		for(let at in ATBrowsers.at) {
			let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
			validBrowsers.forEach(function(browser) {
				supportPoints.push(assertion.results[at].browsers[browser]);
			});
		}
	});

	// ensure the path exists
	let path = buildDir+'/tests/'+file;
	path = path.substring(0, path.lastIndexOf("/"));
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    // now write the file
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
