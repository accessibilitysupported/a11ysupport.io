let helper = {};
const moment = require('moment');
let now = new moment();

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
	featureObject.core_must_support = [];
	featureObject.core_must_support_string = 'na';
	featureObject.core_should_support = [];
	featureObject.core_should_support_string = 'na';
	featureObject.core_may_support = [];
	featureObject.core_may_support_string = 'na';

	if (!featureObject.keywords) {
		featureObject.keywords = [];
	}

	featureObject.keywords.push(featureObject.title);

	// Set defaults for assertions
	featureObject.assertions.forEach((assertion, assertion_key) => {
		switch (assertion.id) {
			case 'convey_name':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey an appropriate name",
					rationale: "A screen reader user needs to know what to enter.",
					type: "MUST",
					operation_modes: [
						"sr/reading",
						"sr/interaction",
						"vc"
					]
				}, assertion);
				break;
			case 'convey_role':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey an appropriate role",
					rationale: "A screen reader user needs to know how they can interact with the element.",
					type: "MUST",
					operation_modes: [
						"sr/reading",
						"sr/interaction",
						"vc"
					]
				}, assertion);
				break;
			case 'convey_value':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey the current value",
					rationale: "A screen reader user needs to know the current value of the input.",
					type: "MUST",
					operation_modes: [
						"sr/reading",
						"sr/interaction"
					]
				}, assertion);
				break;
			case 'convey_change_in_value':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey the current value",
					rationale: "The user needs to know that the value was successfully changed.",
					type: "MUST",
					pass_strategy: "all",
					operation_modes: [
						"sr/interaction"
					]
				}, assertion);
				break;
			case 'convey_boundaries':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey the boundaries of the element",
					rationale: "A user needs to know when they enter and exit an element",
					type: "MUST",
					examples: [
						"A screen reader might announce the role of the element when entering and say something like \"leaving\" when exiting.",
						"A screen reader might not explicitly announce entering and existing the element, but instead imply that the is in the containing object by conveying the roles of required children (options in a listbox for example).",
						"A screen reader might announce position in set information such as \"1 of 6\".",
						"A screen reader might not convey boundaries if the content fits on a single line"
					],
					pass_strategy: "all",
					operation_modes: [
						"sr/reading",
						"sr/interaction"
					]
				}, assertion);
				break;
			case 'content_navigable':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "allow navigating content",
					rationale: "A user needs to be able to navigate the content",
					type: "MUST",
					examples: [
						"A screen reader might allow reading-mode navigation, such as reading line-by-line."
					],
					pass_strategy: "all",
					operation_modes: [
						"sr/reading"
					]
				}, assertion);
				break;
			case 'convey_posinset':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey the position in set information",
					rationale: "A user needs to where the position is in the list",
					type: "MUST",
					examples: [
						"A screen reader might something like \"1 of 6\".",
					],
					operation_modes: [
						"sr/reading",
						"sr/interaction"
					]
				}, assertion);
				break;
			case 'convey_boolean_property':
				featureObject.assertions[assertion_key] = Object.assign({
					id: "convey_boolean_property",
					title: "convey the property",
					rationale: "The user needs to know that property is set",
					type: "MUST",
					examples: [
						"A screen reader might announce the property along with the elements name, role, and value"
					],
					operation_modes: [
						"sr/reading",
						"sr/interaction"
					]
				}, assertion);
				break;
			case 'provide_shortcuts':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "provide shortcuts to jump to text inputs",
					rationale: "Screen reader users might want to quickly navigate to elements of this type.",
					type: "SHOULD",
					operation_modes: [
						"sr/reading"
					]
				}, assertion);
				break;
			case 'convey_setsize':
				featureObject.assertions[assertion_key] = Object.assign({
					title: "convey the number of items in the list",
					rationale: "A user needs to be able to understand how many items are in the list",
					type: "MUST",
					examples: [
						"A screen reader might convey the position of each item in the list as something like \"x of y\" where y is the number of items in the list.",
						"A screen reader might convey the number of items in the list when first entering the list."
					],
					operation_modes: [
						"sr/reading"
					]
				}, assertion);
				break;
		}
	});

	// Define the keywords_string
	featureObject.keywords_string = featureObject.keywords.join(' ').replace(/\"/g, '');
};

helper.bubbleFeatureSupport = function(featureObject) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	featureObject.assertions.forEach((assertion, assertion_key) => {
		featureObject.assertions[assertion_key].tests = [];

		if (!assertion.pass_strategy) {
			featureObject.assertions[assertion_key].pass_strategy = 'all';
		}

		// Now set a flag for what types of AT this assertion applies to
		featureObject.assertions[assertion_key].supports_at = [];
		if (!featureObject.assertions[assertion_key].rationale) {
			featureObject.assertions[assertion_key].rationale = "";
		}

		if (assertion.operation_modes.includes('sr/reading')
			|| assertion.operation_modes.includes('sr/interaction')) {
			featureObject.assertions[assertion_key].supports_at.push('sr');
		}

		if (assertion.operation_modes.includes('vc')) {
			featureObject.assertions[assertion_key].supports_at.push('vc');
		}

		let titleModifier = "The assistive technology ";
		if (featureObject.assertions[assertion_key].supports_at[0] === 'sr') {
			titleModifier = "The screen reader ";
		} else if (featureObject.assertions[assertion_key].supports_at[0] === 'vc') {
			titleModifier = "The voice control software ";
		}

		featureObject.assertions[assertion_key].title = titleModifier + featureObject.assertions[assertion_key].type.toUpperCase() + " " + featureObject.assertions[assertion_key].title;
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
				featureObject.assertions[assertion_key].core_support_by_at = {};
				featureObject.assertions[assertion_key].core_support_by_at_browser = {};
			}

			for(let at in ATBrowsers.at){
				let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
				validBrowsers.forEach(function(browser) {
					//Set support arrays
					let support = assertion.results[at].browsers[browser].support;
					let some_support_behind_settings = assertion.results[at].browsers[browser].some_support_behind_settings;
					if (ATBrowsers.at[at].core_browsers.includes(browser)) {
						if (ATBrowsers.core_at.includes(at)) {
							if (!featureObject.core_support_by_at[at]) {
								featureObject.core_support_by_at[at] = {
									'string': null,
									'values': [],
									'some_support_behind_settings': false
								};
							}

							if (!featureObject.core_support_by_at_browser) {
								featureObject.core_support_by_at_browser = {};
							}

							if (!featureObject.core_support_by_at_browser[at]) {
								featureObject.core_support_by_at_browser[at] = {};
							}

							if (!featureObject.core_support_by_at_browser[at][browser]) {
								featureObject.core_support_by_at_browser[at][browser] = {
									'string': null,
									'values': [],
									'some_support_behind_settings': false
								};
							}

							if (!featureObject.assertions[assertion_key].core_support_by_at[at]) {
								featureObject.assertions[assertion_key].core_support_by_at[at] = {
									'string': null,
									'values': [],
									'some_support_behind_settings': false
								};
							}

							if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at]) {
								featureObject.assertions[assertion_key].core_support_by_at_browser[at] = {};
							}

							if (!featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser]) {
								featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser] = {
									'string': null,
									'values': [],
									'some_support_behind_settings': false
								};
							}

							if (featureObject.assertions[assertion_key].type === "MUST" || featureObject.assertions[assertion_key].type === "MUST NOT") {
								// Only include "must" assertions in core support at the feature level
								featureObject.core_support_by_at_browser[at][browser].values.push(support);
								if (some_support_behind_settings) {
									featureObject.core_support_by_at_browser[at][browser].some_support_behind_settings = some_support_behind_settings;
								}

								featureObject.core_support_by_at[at].values.push(support);
								featureObject.core_support.push(support);
							} else {
								featureObject.extended_support.push(support);
							}

							featureObject.assertions[assertion_key].core_support_by_at[at].values.push(support);
							if (some_support_behind_settings) {
								featureObject.assertions[assertion_key].core_support_by_at[at].some_support_behind_settings = some_support_behind_settings;
							}

							featureObject.assertions[assertion_key].core_support.push(support);
							featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].values.push(support);
							if (some_support_behind_settings) {
								featureObject.assertions[assertion_key].core_support_by_at_browser[at][browser].some_support_behind_settings = some_support_behind_settings;
							}
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
			if (!featureObject.assertions[assertion_key].core_support_by_at) {
				featureObject.assertions[assertion_key].core_support_by_at = {};
			}

			if (!featureObject.assertions[assertion_key].core_support_by_at[at]) {
				featureObject.assertions[assertion_key].core_support_by_at[at] = {
					"values": [],
					"string": ""
				};
			}
			featureObject.assertions[assertion_key].core_support_by_at[at].string = helper.generateSupportString(featureObject.assertions[assertion_key].core_support_by_at[at].values);

			// Loop over browsers and set values
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

	featureObject.assertions.forEach((assertion, assertion_key) => {
		// aggregate must/should/may core support
		if (assertion.type === "MUST" || assertion.type === "MUST NOT") {
			if (assertion.core_support && assertion.core_support.length) {
				featureObject.core_must_support = featureObject.core_must_support.concat(assertion.core_support);
			}
			featureObject.core_must_support_string = helper.generateSupportString(featureObject.core_must_support);
		} else if (assertion.type === "SHOULD") {
			if (assertion.core_support && assertion.core_support.length) {
				featureObject.core_should_support = featureObject.core_should_support.concat(assertion.core_support);
			}
			featureObject.core_should_support_string = helper.generateSupportString(featureObject.core_should_support);
		} else {
			if (assertion.core_support && assertion.core_support.length) {
				featureObject.core_may_support = featureObject.core_may_support.concat(assertion.core_support);
			}
			featureObject.core_may_support_string = helper.generateSupportString(featureObject.core_may_support);
		}
	});
};


helper.initalizeTestCase = function (testCase) {
	//Grab the ATBrowsers data
	let ATBrowsers = require('./../data/ATBrowsers');

	//Set support properties
	testCase.core_support = [];
	testCase.core_support_string = 'unknown';
	testCase.extended_support = [];
	testCase.extended_support_string = 'unknown';
	testCase.core_must_support = [];
	testCase.core_must_support_string = 'na';
	testCase.core_should_support = [];
	testCase.core_should_support_string = 'na';
	testCase.core_may_support = [];
	testCase.core_may_support_string = 'na';

	testCase.history = testCase.history.sort(sortByProperty('date'));

	testCase.assertions.forEach(function(assertion, assertion_key) {
		// Load the feature object so that we can reference linked assertions (use the data version because the feature hasn't been built yet)
		let feature = require('../data/tech/'+assertion.feature_id+".json");
		let ref_assertion = feature.assertions.find(obj => obj.id === assertion.feature_assertion_id);

		if (!ref_assertion) {
			console.log(testCase.id, assertion.feature_assertion_id);
		}

		// Look at what operations modes the assertion supports and set some helpful flags
		// We have to do this here because tests are built before features.
		let supports_sr = false;
		let supports_vc = false;
		testCase.assertions[assertion_key].supports_at = [];

		if (!ref_assertion.operation_modes) {
			console.log(feature, ref_assertion);
		}

		if (ref_assertion.operation_modes.includes('sr/reading')
		|| ref_assertion.operation_modes.includes('sr/interaction')) {
			supports_sr = true;
			testCase.assertions[assertion_key].supports_at.push('sr');
		}

		if (ref_assertion.operation_modes.includes('vc')) {
			supports_vc = true;
			testCase.assertions[assertion_key].supports_at.push('vc')
		}

		let titleModifier = 'The assistive technology ';
		if (testCase.assertions[assertion_key].supports_at.length === 1 && testCase.assertions[assertion_key].supports_at[0] === 'sr') {
			titleModifier = 'The screen reader ';
		} else if (testCase.assertions[assertion_key].supports_at.length === 1 && testCase.assertions[assertion_key].supports_at[0] === 'vc') {
			titleModifier = 'The voice control software ';
		}

		testCase.assertions[assertion_key].feature_title = feature.title;
		testCase.assertions[assertion_key].assertion_title = titleModifier + ref_assertion.type.toUpperCase() + " " + ref_assertion.title;
		testCase.assertions[assertion_key].core_support = [];
        testCase.assertions[assertion_key].extended_support = [];
		testCase.assertions[assertion_key].operation_modes = ref_assertion.operation_modes;

		testCase.assertions[assertion_key].rationale = "";
		if (ref_assertion.rationale) {
			testCase.assertions[assertion_key].assertion_rationale = ref_assertion.rationale;
		}
		if (ref_assertion.examples) {
			testCase.assertions[assertion_key].assertion_examples = ref_assertion.examples;
		}
		if (ref_assertion.pass_strategy) {
			testCase.assertions[assertion_key].pass_strategy = ref_assertion.pass_strategy;
		}

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
					testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings = false;
					testCase.assertions[assertion_key].results[at].browsers[browser].output.forEach(function(output) {
						if (output.behind_setting) {
							testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings = true;
						}
						results.push(output.result);
					});

					// Reduce it to unique values
					results = results.unique();

					// No support by default
					testCase.assertions[assertion_key].results[at].browsers[browser].support = 'unknown';

					var pass_strategy = 'any';
					if (ref_assertion.pass_strategy) {
						pass_strategy = ref_assertion.pass_strategy;
					}

					if (pass_strategy === 'all') {
						// 'any' strategy, a single pass for a command counts a pass for the assertion
						if (results.length === 1 && results.includes('pass')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'y';
						} else if (results.includes('pass')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
						} else if (results.includes('partial')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
						} else if (results.includes('fail')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'n';
						} else if (results.includes('na')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
						} else if (results.includes('unknown')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'u';
						}
					} else {
						// 'any' strategy, a single pass for a command counts a pass for the assertion
						if (results.includes('pass')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'y';
						} else if (results.includes('partial')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'p';
						} else if (results.includes('fail')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'n';
						} else if (results.includes('na')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'na';
						} else if (results.includes('unknown')) {
							testCase.assertions[assertion_key].results[at].browsers[browser].support = 'u';
						}
					}
				}

				// Set associated IDs to help define the support point
				testCase.assertions[assertion_key].results[at].browsers[browser].id = browser;
				testCase.assertions[assertion_key].results[at].browsers[browser].testId = testCase.id;
				testCase.assertions[assertion_key].results[at].browsers[browser].ATId = at;
				testCase.assertions[assertion_key].results[at].browsers[browser].test_title = testCase.title;
				testCase.assertions[assertion_key].results[at].browsers[browser].support_string = helper.generateSupportString(testCase.assertions[assertion_key].results[at].browsers[browser].support);

				// Set support arrays
				let support = testCase.assertions[assertion_key].results[at].browsers[browser].support;
				if (ATBrowsers.at[at].core_browsers.includes(browser)) {
					testCase.assertions[assertion_key].results[at].core_support.push(support);

					if (testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings) {
						testCase.assertions[assertion_key].results[at].some_support_behind_settings = testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings;
					}

					if (ATBrowsers.core_at.includes(at)) {
                        testCase.assertions[assertion_key].core_support.push(support);

                        if (ref_assertion.type === "MUST" || ref_assertion.type === "MUST NOT") {
							testCase.core_support.push(support);
						}

						if (testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings) {
							testCase.assertions[assertion_key].some_support_behind_settings = testCase.assertions[assertion_key].results[at].browsers[browser].some_support_behind_settings;
						}
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
		testCase.assertions[assertion_key].extended_support_string = helper.generateSupportString(testCase.assertions[assertion_key].extended_support);

		// aggregate must/should/may core support
		if (ref_assertion.type === "MUST" || ref_assertion.type === "MUST NOT") {
			if (testCase.assertions[assertion_key].core_support && testCase.assertions[assertion_key].core_support.length) {
				testCase.core_must_support = testCase.core_must_support.concat(testCase.assertions[assertion_key].core_support);
			}
			testCase.core_must_support_string = helper.generateSupportString(testCase.core_must_support);
		} else if (ref_assertion.type === "SHOULD") {
			if (testCase.assertions[assertion_key].core_support && testCase.assertions[assertion_key].core_support.length) {
				testCase.core_should_support = testCase.core_should_support.concat(testCase.assertions[assertion_key].core_support);
			}
			testCase.core_should_support_string = helper.generateSupportString(testCase.core_should_support);
		} else {
			if (testCase.assertions[assertion_key].core_support && testCase.assertions[assertion_key].core_support.length) {
				testCase.core_may_support = testCase.core_may_support.concat(testCase.assertions[assertion_key].core_support);
			}
			testCase.core_may_support_string =  helper.generateSupportString(testCase.core_may_support);
		}
	});

	//Set support strings for the test
	testCase.core_support_string = helper.generateSupportString(testCase.core_support);
	testCase.extended_support_string = helper.generateSupportString(testCase.extended_support);
};

helper.generateSupportString = function(support) {
	if (typeof support === "string") {
		let supportString = '';
		let supportClass = '';
		switch(support) {
			case 'y':
				supportString = 'yes';
				supportClass = 'ye';
				break;
			case 'n':
				supportString = 'none';
				supportClass = 'no';
				break;
			case 'p':
				supportString = 'partial';
				supportClass = 'pa';
				break;
			case 'na':
				supportString = 'not applicable';
				supportClass = 'na';
				break;
			default:
				supportString = 'unknown';
				supportClass = 'un';
		}

		return {
			class: supportClass,
			string: supportString
		}
	}

	if (support.length === 0) {
		return helper.generateSupportString("un");
	}

	// test for full na support before filtering na support
	let uniqueSupport = support.unique();
	if (uniqueSupport.length === 1 && uniqueSupport[0] === "na") {
		return helper.generateSupportString("na");
	}

	// filter out "na" values
	let filteredSupport = support.filter(function(element) {
		return element !== "na"
	});

	if (filteredSupport.length === 0) {
		return helper.generateSupportString("na");
	}

	//Get the unique values to make it easier to compare
	uniqueSupport = filteredSupport.unique();

	if (uniqueSupport.length === 1) {
		if (uniqueSupport[0] === 'y') {
			return {
				class: "ye",
				string: "supported"
			};
		}

		return helper.generateSupportString(uniqueSupport[0]);
	}

	if (uniqueSupport.length === 2 && uniqueSupport.includes('y') && uniqueSupport.includes('u')) {
		let numUnknown = filteredSupport.occurenceCount('u');
		if (numUnknown === 1) {
			return {
				class: 'pa',
				string: 'supported with '+numUnknown+' unknown result'
			}
		}

		return {
			class: 'pa',
			string: 'supported with '+numUnknown+' unknown results',
		}
	}

	let numPassing = filteredSupport.occurenceCount('y');

	if (numPassing) {
		// At least one thing is passing
		return {
			class: 'pa',
			string: 'partial ('+numPassing+'/'+filteredSupport.length+')',
		}
	}

	let numPartial = filteredSupport.occurenceCount('p');

	if (numPartial) {
		// At least one thing is passing
		return {
			class: 'pa',
			string: 'some partial support',
		}
	}

	if (support.includes('n')) {
		return {
			class: 'no',
			string: 'no known support',
		}
	}

	return {
		class: 'un',
		string: 'unknown support',
	}
};

module.exports = helper;
