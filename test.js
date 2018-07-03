let expect = require('chai').expect;
let fs = require('fs');
const Ajv = require('ajv');
let ajv = new Ajv({schemas: [
		require('./data/schema/test.json'),
		require('./data/schema/dev-test.json'),
		require('./data/schema/feature.json'),
		require('./data/schema/dev-feature.json'),
	]});

let buildDir = __dirname+'/build';
let devDir = __dirname+'/data';
let tech = require(buildDir+"/tech.json");

describe('Development tests', function () {
	let testFiles = fs.readdirSync(devDir+'/tests');

	testFiles.forEach(function (file) {
		if (!file.endsWith('.json')) {
			return;
		}

		it(file + ' should conform to the dev-test schema', function () {
			let test = require(devDir + '/tests/' + file);
			let valid = ajv.validate('http://accessibilitysupported.com/dev-test.json', test);
			if (!valid) {
				console.log(ajv.errors);
			}
			expect(valid).to.be.equal(true);
		});

	});
});

describe('Development tech features', function () {
	for (let techId in tech) {
		describe(techId, function() {
			let featureDir = devDir + '/tech/'+techId;
			if (!fs.existsSync(featureDir)) {
				// Directory doesn't exist, so there are not features yet
				return;
			}
			let files = fs.readdirSync(featureDir);
			files.forEach(function(file) {
				let feature = require(featureDir + '/' + file);

				it(file + ' should conform to the dev-feature schema', function () {
					let valid = ajv.validate('http://accessibilitysupported.com/dev-feature.json', feature);
					if (!valid) {
						console.log(ajv.errors);
					}
					expect(valid).to.be.equal(true);
				});

				describe(file + ' tests', function() {
					for (let i=0; i < feature.tests.length; i++) {
						it('tests/'+feature.tests[i] + '.json should exist', function () {
							let exists = fs.existsSync(devDir+'/tests/'+feature.tests[i]+'.json');
							expect(exists).to.be.equal(true);
						});
					}
				});
			});
		});
	}
});

describe('Built tests', function () {
	let testFiles = fs.readdirSync(buildDir+'/tests');

	testFiles.forEach(function (file) {
		if (!file.endsWith('.json')) {
			return;
		}

		it(file + ' should conform to the test schema', function () {
			let test = require(buildDir + '/tests/' + file);
			let valid = ajv.validate('http://accessibilitysupported.com/test.json', test);
			if (!valid) {
				console.log(ajv.errors);
			}
			expect(valid).to.be.equal(true);
		});

	});
});

describe('Built tech features', function () {
	for (let techId in tech) {
		describe(techId, function() {
			let featureDir = buildDir + '/tech/'+techId;
			if (!fs.existsSync(featureDir)) {
				// Directory doesn't exist, so there are not features yet
				return;
			}
			let files = fs.readdirSync(featureDir);
			files.forEach(function(file) {
				it(file + ' should conform to the feature schema', function () {
					let feature = require(featureDir + '/' + file);
					let valid = ajv.validate('http://accessibilitysupported.com/feature.json', feature);
					if (!valid) {
						console.log(ajv.errors);
					}
					expect(valid).to.be.equal(true);
				});
			});
		});
	}
});

