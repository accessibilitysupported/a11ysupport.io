let helper = {};

Array.prototype.unique = function() {
	return this.filter(function(elem, pos, self) {
		return self.indexOf(elem) === pos;
	});
};

Array.prototype.occurenceCount = function (what) {
	let count = 0;
	for (let i = 0; i < this.length; i++) {
		if (this[i] === what) {
			count++;
		}
	}
	return count;
};

helper.initalizeFeatureObject = function(featureObject) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	//Set up support properties
	featureObject.core_support = [];
	featureObject.core_support_by_at = {};
	featureObject.core_support_string = 'unknown';
	featureObject.extended_support = [];
	featureObject.extended_support_string = 'unknown';

	for (let testIndex = 0; testIndex < featureObject.tests.length; testIndex++) {
		featureObject.tests[testIndex] = require('../build/tests/'+featureObject.tests[testIndex]);

		// Detect support
		for(let at in ATBrowsers.at){
			for (let browser in ATBrowsers.browsers) {
				//Set support arrays
				let support = featureObject.tests[testIndex].at[at].browsers[browser].support;
				if (ATBrowsers.at[at].core_browsers.includes(browser)) {
					if (ATBrowsers.core_at.includes(at)) {
						if (!featureObject.core_support_by_at[at]) {
							featureObject.core_support_by_at[at] = {
								'string': null,
								'values': []
							};
						}

						featureObject.core_support_by_at[at].values.push(support);
						featureObject.core_support.push(support);
					} else {
						featureObject.extended_support.push(support);
					}
				} else if (ATBrowsers.at[at].extended_browsers.includes(browser)) {
					featureObject.extended_support.push(support);
				}
			}
		}
	}

	if (featureObject.tests.length === 0) {
		// This is just a stub
		featureObject.core_support.push('u');
		for (let i = 0; i < ATBrowsers.core_at.length; i++) {
			featureObject.core_support_by_at[ATBrowsers.core_at[i]] = {};
			featureObject.core_support_by_at[ATBrowsers.core_at[i]].values = ['u'];
			featureObject.core_support_by_at[ATBrowsers.core_at[i]].string = helper.generateSupportString(['u']);
		}
	}

	//Set support strings
	featureObject.core_support_string = helper.generateSupportString(featureObject.core_support);
	featureObject.extended_support_string = helper.generateSupportString(featureObject.extended_support);

	for (let i = 0; i < ATBrowsers.core_at.length; i++) {
		let at = ATBrowsers.core_at[i];
		featureObject.core_support_by_at[at].string = helper.generateSupportString(featureObject.core_support_by_at[at].values);
	}
};


helper.initalizeTestCase = function (testCase) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	//Set support properties
	testCase.core_support = [];
	testCase.core_support_string = 'unknown';
	testCase.extended_support = [];
	testCase.extended_support_string = 'unknown';

	//Add missing AT
	for(let at in ATBrowsers.at){
		//Add an empty versions array if we don't have any info on versions
		if (!testCase.at.hasOwnProperty(at)) {
			testCase.at[at] = {
				"browsers": {},
			}
		}

		//Set this ID so we can use it later with a `this` scope where `this` is the AT object
		testCase.at[at].id = at;
		testCase.at[at].core_support = [];
		testCase.at[at].core_support_string = 'unknown';
		testCase.at[at].extended_support = [];
		testCase.at[at].extended_support_string = 'unknown';

		for (let browser in ATBrowsers.browsers) {
			if (!testCase.at[at].browsers) {
				//Add the missing browser property
				testCase.at[at].browsers = {};
			}

			if (!testCase.at[at].browsers[browser]) {
				//Add an empty array to make future operations easier
				testCase.at[at].browsers[browser] = {
					"support": "u", //unknown support
					"id": browser
				};
			}

			//Set support arrays
			let support = testCase.at[at].browsers[browser].support;
			if (ATBrowsers.at[at].core_browsers.includes(browser)) {
				testCase.at[at].core_support.push(support);
				if (ATBrowsers.core_at.includes(at)) {
					testCase.core_support.push(support);
				} else {
					testCase.extended_support.push(support);
				}
			} else if (ATBrowsers.at[at].extended_browsers.includes(browser)) {
				testCase.at[at].extended_support.push(support);
				testCase.extended_support.push(support);
			}
		}

		//Set support strings
		testCase.at[at].core_support_string = helper.generateSupportString(testCase.at[at].core_support);
		testCase.at[at].extended_support_string = helper.generateSupportString(testCase.at[at].extended_support);
	}

	//Set support strings
	testCase.core_support_string = helper.generateSupportString(testCase.core_support);
	testCase.extended_support_string = helper.generateSupportString(testCase.extended_support);
};

helper.generateSupportString = function(support) {
	if (typeof support === "string") {
		let supportString = '';
		switch(support) {
			case 'y':
				supportString = 'full support';
				break;
			case 'n':
				supportString = 'no support';
				break;
			case 'p':
				supportString = 'partial support';
				break;
			case 'na':
				supportString = 'not applicable';
				break;
			case 'u':
				supportString = 'unknown support';
				break;
			default:
				supportString = 'unknown support case';
		}

		return supportString;
	}

	//Get the unique values to make it easier to compare
	let uniqueSupport = support.unique();

	if (uniqueSupport.length === 1) {
		return helper.generateSupportString(uniqueSupport[0]);
	}

	if (support.occurenceCount('y') / support.length > .75) {
		return 'mostly supported';
	}

	if (support.includes('y')) {
		return 'some support';
	}

	if (support.includes('p')) {
		return 'some support';
	}

	return 'unknown support';
};

module.exports = helper;