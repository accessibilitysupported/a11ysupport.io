let helper = {};
const moment = require('moment');
let now = new moment();

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

helper.initalizeFeatureObject = function(featureObject, techId, id) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	featureObject.id = id;
	featureObject.techId = techId;

	//Set up support properties
	featureObject.core_support = [];
	featureObject.core_support_by_at = {};
	featureObject.core_support_by_at_browser = {};
	featureObject.core_support_string = 'unknown';
	featureObject.extended_support = [];
	featureObject.extended_support_string = 'unknown';

	if (!featureObject.keywords) {
		featureObject.keywords = [];
	}

	featureObject.keywords.push(featureObject.title);

	featureObject.assertions.forEach((assertion, assertion_key) => {
		featureObject.assertions[assertion_key].tests = [];

		// Now set a flag for what types of AT this assertion applies to
		featureObject.assertions[assertion_key].supports_at = [];

		if (assertion.operation_modes.includes('sr/reading')
			|| assertion.operation_modes.includes('sr/interaction')) {
			featureObject.assertions[assertion_key].supports_at.push('sr');
		}

		if (assertion.operation_modes.includes('vc')) {
			featureObject.assertions[assertion_key].supports_at.push('vc');
		}
	});

	for (let testIndex = 0; testIndex < featureObject.tests.length; testIndex++) {
		featureObject.tests[testIndex] = require('../build/tests/'+featureObject.tests[testIndex]);

		// Set up keywords to help searches
		if (featureObject.tests[testIndex].keywords) {
			featureObject.keywords = featureObject.keywords.concat(featureObject.tests[testIndex].keywords);
		}

		// Note: tests are be built before a feature is built so that bubbling works correctly
		// Detect support
		featureObject.tests[testIndex].assertions.forEach(assertion => {
			if (featureObject.id !== assertion.feature_id) {
				return;
			}

			let assertion_key = featureObject.assertions.findIndex(obj => obj.id === assertion.feature_assertion_id);

			if (!featureObject.assertions[assertion_key].tests.some(e => e.id  === featureObject.tests[testIndex].id)) {
				featureObject.assertions[assertion_key].tests.push({
					id: featureObject.tests[testIndex].id,
					title: featureObject.tests[testIndex].title,
					core_support_string: featureObject.tests[testIndex].core_support_string
				});
			}

			// Set up the feature assertion properties
			if (featureObject.assertions[assertion_key].core_support === undefined) {
				featureObject.assertions[assertion_key].core_support = [];
				featureObject.assertions[assertion_key].extended_support = [];
				featureObject.assertions[assertion_key].core_support_by_at_browser = {};
			}

			for(let at in ATBrowsers.at){
				let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
				validBrowsers.forEach(function(browser) {
					//Set support arrays
					let support = assertion.results[at].browsers[browser].support;
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

							if (!featureObject.core_support_by_at_browser) {
								featureObject.core_support_by_at_browser = {};
							}

							if (!featureObject.core_support_by_at_browser[at]) {
								featureObject.core_support_by_at_browser[at] = {};
							}

							if (!featureObject.core_support_by_at_browser[at][browser]) {
								featureObject.core_support_by_at_browser[at][browser] = {
									'string': null,
									'values': []
								};
							}

							if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at]) {
								featureObject.assertions[assertion_key].core_support_by_at_browser[at] = {};
							}

							if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser]) {
								featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
									'string': null,
									'values': []
								};
							}

							if (assertion.type === "MUST") {
								// Only include "must" assertions in core support at the feature level
								featureObject.core_support_by_at_browser[at][browser].values.push(support);
								featureObject.core_support.push(support);
							} else {
								featureObject.extended_support.push(support);
							}

							featureObject.assertions[assertion_key].core_support.push(support);
							featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].values.push(support);
						} else {
							featureObject.extended_support.push(support);
							featureObject.assertions[assertion_key].extended_support.push(support);
						}
					} else if (ATBrowsers.at[at].extended_browsers.includes(browser)) {
						featureObject.extended_support.push(support);
						featureObject.assertions[assertion_key].extended_support.push(support);
					}
				});
			}
		});
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

		if (!featureObject.core_support_by_at_browser[at]) {
			featureObject.core_support_by_at_browser[at] = {};
		}

		ATBrowsers.at[at].core_browsers.forEach(browser => {
			if (!featureObject.core_support_by_at_browser[at][browser]) {
				featureObject.core_support_by_at_browser[at][browser] = {
					"values": [],
					"string": ""
				};
			}

			featureObject.core_support_by_at_browser[at][browser].string = helper.generateSupportString(featureObject.core_support_by_at_browser[at][browser].values);
		});

		featureObject.assertions.forEach((assertion, assertion_key) => {
			ATBrowsers.at[at].core_browsers.forEach(browser => {
				if (!featureObject.assertions[assertion_key].core_support_by_at_browser) {
					featureObject.assertions[assertion_key].core_support_by_at_browser = {};
				}

				if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at]) {
					featureObject.assertions[assertion_key].core_support_by_at_browser[at] = {};
				}

				if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser]) {
					featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
						"values": [],
						"string": ""
					};
				}

				featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].string = helper.generateSupportString(featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].values);
			});
		});
	}

	// Define the keywords_string
	featureObject.keywords_string = featureObject.keywords.join(' ');
};


helper.initalizeTestCase = function (testCase) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	//Set support properties
	testCase.core_support = [];
	testCase.core_support_string = 'unknown';
	testCase.extended_support = [];
	testCase.extended_support_string = 'unknown';

	testCase.assertions.forEach(function(assertion, assertion_key) {
		// Load the feature object so that we can reference linked assertions (use the data version because the feature hasn't been built yet)
		let feature = require('../data/tech/'+assertion.feature_id+".json");
		let ref_assertion = feature.assertions.find(obj => obj.id === assertion.feature_assertion_id);

		// Look at what operations modes the assertion supports and set some helpful flags
		// We have to do this here because tests are built before features.
		let supports_sr = false;
		let supports_vc = false;
		testCase.assertions[assertion_key].supports_at = [];

		if (ref_assertion.operation_modes.includes('sr/reading')
		|| ref_assertion.operation_modes.includes('sr/interaction')) {
			supports_sr = true;
			testCase.assertions[assertion_key].supports_at.push('sr');
		}

		if (ref_assertion.operation_modes.includes('vc')) {
			supports_vc = true;
			testCase.assertions[assertion_key].supports_at.push('vc')
		}

		testCase.assertions[assertion_key].feature_title = feature.title;
		testCase.assertions[assertion_key].assertion_title = ref_assertion.title;
		testCase.assertions[assertion_key].core_support = [];
        testCase.assertions[assertion_key].extended_support = "unknown";
		testCase.assertions[assertion_key].operation_modes = ref_assertion.operation_modes;

        if (!testCase.assertions[assertion_key].css_target) {
        	// Use the referenced assertion's css target if it isn't overridden by the assertion link
			testCase.assertions[assertion_key].css_target = ref_assertion.css_target;
		}

		//Add missing AT
		for(let at in ATBrowsers.at){
			//Add an empty versions array if we don't have any info on versions
			if (!testCase.assertions[assertion_key].results.hasOwnProperty(at)) {
				testCase.assertions[assertion_key].results[at] = {
					"browsers": {},
				}
			}

			//Set this ID so we can use it later with a `this` scope where `this` is the AT object
			testCase.assertions[assertion_key].results[at].id = at;
			testCase.assertions[assertion_key].results[at].core_support = [];
			testCase.assertions[assertion_key].results[at].core_support_string = 'unknown';
			testCase.assertions[assertion_key].results[at].extended_support = [];
			testCase.assertions[assertion_key].results[at].extended_support_string = 'unknown';

			let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
			validBrowsers.forEach(function(browser) {
				if (!testCase.assertions[assertion_key].results[at].browsers) {
					//Add the missing browser property
					testCase.assertions[assertion_key].results[at].browsers = {};
				}

				if (!testCase.assertions[assertion_key].results[at].browsers[browser]) {
					//Add an empty array to make future operations easier
					testCase.assertions[assertion_key].results[at].browsers[browser] = {
						"support": "u", //unknown support
						"id": browser
					};
				}

				if (!supports_sr && ATBrowsers.at[at].type === "sr") {
					// This test case does not support this type of AT
					testCase.assertions[assertion_key].results[at].browsers[browser].support = "na";
				}

				if (!supports_vc && ATBrowsers.at[at].type === "vc") {
					// This test case does not support this type of AT
					testCase.assertions[assertion_key].results[at].browsers[browser].support = "na";
				}

				if (testCase.assertions[assertion_key].results[at].browsers[browser].output) {
					// Set the support property based on the result of the output.
					var results = [];
					testCase.assertions[assertion_key].results[at].browsers[browser].output.forEach(function(output) {
						results.push(output.result);
					});

					// Reduce it to unique values
					results = results.unique();

					if (results.length === 1 && results[0] === 'pass') {
						// yes, it is supported
						testCase.assertions[assertion_key].results[at].browsers[browser].support = 'y';
					} else if (results.length === 1 && results[0] === 'fail') {
						// no, it is not supported
						testCase.assertions[assertion_key].results[at].browsers[browser].support = 'n';
					} else {
						// partial support (some pass, some fail)
						testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
					}
				}

				// Set associated IDs to help define the support point
				testCase.assertions[assertion_key].results[at].browsers[browser].id = browser;
				testCase.assertions[assertion_key].results[at].browsers[browser].testId = testCase.id;
				testCase.assertions[assertion_key].results[at].browsers[browser].ATId = at;
				testCase.assertions[assertion_key].results[at].browsers[browser].test_title = testCase.title;
				testCase.assertions[assertion_key].results[at].browsers[browser].support_string = helper.generateSupportString(testCase.assertions[assertion_key].results[at].browsers[browser].support)

				// Set support arrays
				let support = testCase.assertions[assertion_key].results[at].browsers[browser].support;
				if (ATBrowsers.at[at].core_browsers.includes(browser)) {
					testCase.assertions[assertion_key].results[at].core_support.push(support);
					if (ATBrowsers.core_at.includes(at)) {
                        testCase.assertions[assertion_key].core_support.push(support);
						testCase.core_support.push(support);
					} else {
                        testCase.assertions[assertion_key].extended_support.push(support);
						testCase.extended_support.push(support);
					}
				} else if (ATBrowsers.at[at].extended_browsers.includes(browser)) {
					testCase.assertions[assertion_key].results[at].extended_support.push(support);
					testCase.extended_support.push(support);
				}

				// Set the priority for manual testing
				if (testCase.type === 'external') {
					// External test, low or no priority. (no priority for now)
					testCase.assertions[assertion_key].results[at].browsers[browser].priority = null;
				} else {
					// Internal tests, higher priority
					if (ATBrowsers.core_at.includes(at) && ATBrowsers.at[at].core_browsers.includes(browser)) {
						// core support
						if (support === 'u') {
							// Unknown core support is always top priority
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = 0;
						} else if (['n', 'p'].includes(support)) {
							let date = moment(testCase.assertions[assertion_key].results[at].browsers[browser].date);
							let diff = now.diff(date, 'days');
							if (diff >= 6) {
								// Older tests should have a higher priority
								testCase.assertions[assertion_key].results[at].browsers[browser].priority = 1;
							} else {
								testCase.assertions[assertion_key].results[at].browsers[browser].priority = 2;
							}
						} else if (support === 'y') {
							let date = moment(testCase.assertions[assertion_key].results[at].browsers[browser].date);
							let diff = now.diff(date, 'days');
							if (diff >= 12) {
								// Older tests should have a higher priority
								testCase.assertions[assertion_key].results[at].browsers[browser].priority = 3;
							} else {
								testCase.assertions[assertion_key].results[at].browsers[browser].priority = 4;
							}
						} else {
							// na (no need to test)
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = null;
						}
					} else {
						// extended support
						if (support === 'u') {
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = 5;
						} else if (['n', 'p'].includes(support)) {
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = 6;
						} else if (support === 'y') {
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = 7;
						} else {
							// na (no need to test)
							testCase.assertions[assertion_key].results[at].browsers[browser].priority = null;
						}
					}
				}

			});

			//Set support strings for the AT
			testCase.assertions[assertion_key].results[at].core_support_string = helper.generateSupportString(testCase.assertions[assertion_key].results[at].core_support);
			testCase.assertions[assertion_key].results[at].extended_support_string = helper.generateSupportString(testCase.assertions[assertion_key].results[at].extended_support);
		}

		//Set support strings for the assertion
		testCase.assertions[assertion_key].core_support_string = helper.generateSupportString(testCase.assertions[assertion_key].core_support);
		testCase.assertions[assertion_key].extended_support_string = helper.generateSupportString(testCase.assertions[assertion_key].extended_support)
	});

	//Set support strings for the test
	testCase.core_support_string = helper.generateSupportString(testCase.core_support);
	testCase.extended_support_string = helper.generateSupportString(testCase.extended_support);
};

helper.generateSupportString = function(support) {
	if (typeof support === "string") {
		let supportString = '';
		switch(support) {
			case 'y':
				supportString = 'full';
				break;
			case 'n':
				supportString = 'none';
				break;
			case 'p':
				supportString = 'partial';
				break;
			case 'na':
				supportString = 'not applicable';
				break;
			case 'u':
				supportString = 'unknown';
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
