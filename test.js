let expect = require('chai').expect;

let featureObject = require('./data/sample_feature.json');
let helper = require('./src/feature-helper');

featureObject = helper.initalizeFeatureObject(featureObject);


describe('Sample Feature Object', function () {
	it('sample.test should be an array', function () {
		expect(featureObject.tests).to.be.an.instanceof(Array);
	});

	describe('sample.tests[0].at', function () {
		for(let at in helper.at){
			it('sample.at property for ' + at, function () {
				expect(featureObject.tests[0].at).to.have.a.property(at);
			});
		}

		describe('sample.tests[0].at.nvda', function () {
			for(let browser in helper.browsers){
				it('sample.tests[0].at.nvda.browsers should have a property for the browser: ' + browser, function () {
					expect(featureObject.tests[0].at.nvda.browsers).to.have.a.property(browser);
				});
			}

			describe('sample.tests[0].at.nvda.browsers.firefox', function () {
				it('should have a browser version', function () {
					expect(featureObject.tests[0].at.nvda.browsers.firefox.browser_version).to.equal("60");
				});

				it('should have an AT version', function () {
					expect(featureObject.tests[0].at.nvda.browsers.firefox.at_version).to.equal("2018.1.1");
				});

				it('should have a support property', function () {
					expect(featureObject.tests[0].at.nvda.browsers.firefox.support).to.equal("y");
				});
			});
		});
	});

	//TODO: Set and test static .currentSupport and .previousSupport properties (for both core and extended browsers)
	//If all=="n":"n" - "no combination support" ("all-n")
	//If some="n"&some="p"&none="y":"?????" - "some combination(s) partially support" ("some-p")
	//If some="p"&some="y":"p" - "some combination(s) fully support" ("some-y")
	//If all="y":"y" - "all combinations fully support" ("all-y")
});