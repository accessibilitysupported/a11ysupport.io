let fs = require('fs');
let rimraf = require('rimraf');

let helper = require(__dirname+'/src/feature-helper');
let tech = require(__dirname+"/data/tech.json");
let testMap = {};

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
			title: feature.title,
			core_support: feature.core_support,
			core_support_string: feature.core_support_string,
			failing_tests: failingTests
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

testFiles.forEach(function(file) {
	if (!file.endsWith('.json')) {
		return;
	}

	let test = require(dataDir+'/tests/'+file);
	helper.initalizeTestCase(test);
	fs.writeFileSync(buildDir+'/tests/'+file, JSON.stringify(test, null, 2));
});

for (let techId in tech) {
	tech[techId].features = getFeatures(techId, buildDir);
}

fs.writeFileSync(buildDir+'/tech.json', JSON.stringify(tech, null, 2));
fs.writeFileSync(buildDir+'/test_map.json', JSON.stringify(testMap, null, 2));
