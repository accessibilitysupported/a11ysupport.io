let helper = {
	"core_at": ["jaws", "nvda", "vo_ios", "vo_macos", "narrator", "android", "dragon_win"],
	"extended_at": ["dragon_mac", "zoomtext"],
	"at": {
		"jaws": {
			"id": "jaws",
			"title": "Jaws",
			"os": "Windows",
			"core_browsers": ['edge', 'ie'],
			"extended_browsers": ['chrome', 'firefox'],
			"url": "https://www.freedomscientific.com/Products/Blindness/JAWS",
			"description": "",
			"bugs": "https://github.com/FreedomScientific/VFO-standards-support/issues",
		},
		"nvda": {
			"id": "nvda",
			"title": "NVDA",
			"os": "Windows",
			"core_browsers": ["firefox"],
			"extended_browsers": ["ie", "edge", "chrome"],
			"url": "https://www.nvaccess.org/",
			"description": "",
			"bugs": "https://github.com/nvaccess/nvda",
		},
		"vo_ios": {
			"id": "vo_ios",
			"title": "VoiceOver for iOS",
			"os": "iOS",
			"core_browsers": ["ios_saf"],
			"extended_browsers": [],
			"url": "https://www.apple.com/accessibility/iphone/vision/",
			"description": ""
		},
		"vo_macos": {
			"id": "vo_macos",
			"title": "VoiceOver for macOS",
			"os": "macOS",
			"core_browsers": ["safari"],
			"extended_browsers": ["chrome", "firefox"],
			"url": "https://www.apple.com/accessibility/mac/vision/",
			"description": ""
		},
		"narrator": {
			"id": "narrator",
			"title": "Narrator",
			"os": "Windows",
			"core_browsers": ["edge"],
			"extended_browsers": ["firefox", "chrome", "ie"],
			"url": "https://support.microsoft.com/en-us/help/22798/windows-10-narrator-get-started",
			"description": "",
			"bugs": ""
		},
		"android": {
			"id": "android",
			"title": "Android Accessibility Suite",
			"os": "Android",
			"core_browsers": ["and_chr"],
			"extended_browsers": ["firefox"],
			"url": "https://support.google.com/accessibility/android/answer/6283677?hl=en",
			"description": "",
			"bugs": "https://www.google.com/accessibility/get-in-touch.html"
		},
		"dragon_win": {
			"id": "dragon_win",
			"title": "Dragon Naturally Speaking (windows)",
			"os": "Windows",
			"core_browsers": ["chrome"],
			"extended_browsers": ["firefox", "edge", "ie"],
			"url": "https://www.nuance.com/dragon.html",
			"description": "http://www.nuance.com/support/dragon-naturallyspeaking/index.htm?link_name=technical_support#dr_support_contact"
		},
		"dragon_mac": {
			"id": "dragon_mac",
			"title": "Dragon Naturally Speaking (mac)",
			"os": "macOS",
			"core_browsers": ["firefox"],
			"extended_browsers": ["chrome", "safari"],
			"url": "https://www.nuance.com/dragon/dragon-for-mac.html",
			"description": "http://www.nuance.com/support/dragon-naturallyspeaking/index.htm?link_name=technical_support#dr_support_contact"
		},
		"zoomtext": {
			"id": "zoomtext",
			"title": "Zoom Text",
			"os": "windows",
			"core_browsers": ["firefox"],
			"extended_browsers": ["edge", "chrome", "ie"],
			"url": "https://www.zoomtext.com/products/zoomtext-magnifierreader/#Feature%20Complete%20Screen%20Reading",
			"description": "https://zoomtext.zendesk.com/hc/en-us"
		}
	},
	"browsers": {
		"chrome": {
			"title": "Google Chrome"
		},
		"firefox": {
			"title": "Firefox (desktop)"
		},
		"and_chr": {
			"title": "Google Chrome (android)"
		},
		"edge": {
			"title": "Microsoft Edge"
		},
		"and_ff": {
			"title": "Firefox (Android)"
		},
		"ie": {
			"title": "Internet Explorer"
		},
		"ios_saf": {
			"title": "Safari (iOS)"
		},
		"safari": {
			"title": "Safari (macOS)"
		}
	}
};

Array.prototype.pushUnique = function(value) {
	if (this.includes(value)) {
		//return;
	}
	this.push(value);
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

helper.initalizeFeatureObject = function(featureObject) {
	//Set up support properties
	featureObject.core_support = [];
	featureObject.extended_support = [];

	for (let testIndex = 0; testIndex < featureObject.tests.length; testIndex++) {
		//Set support properties
		featureObject.tests[testIndex].core_support = [];
		featureObject.tests[testIndex].extended_support = [];

		//Add missing AT
		for(let at in this.at){
			//Add an empty versions array if we don't have any info on versions
			if (!featureObject.tests[testIndex].at.hasOwnProperty(at)) {
				featureObject.tests[testIndex].at[at] = {
					"browsers": {},
				}
			}

			//Set this ID so we can use it later with a `this` scope where `this` is the AT object
			featureObject.tests[testIndex].at[at].id = at;
			featureObject.tests[testIndex].at[at].core_support = [];
			featureObject.tests[testIndex].at[at].extended_support = [];

			for (let browser in helper.browsers) {
				if (!featureObject.tests[testIndex].at[at].browsers) {
					//Add the missing browser property
					featureObject.tests[testIndex].at[at].browsers = {};
				}

				if (!featureObject.tests[testIndex].at[at].browsers[browser]) {
					//Add an empty array to make future operations easier
					featureObject.tests[testIndex].at[at].browsers[browser] = {
						"support": "u", //unknown support
						"id": browser
					};
				}

				//Set support arrays
				let support = featureObject.tests[testIndex].at[at].browsers[browser].support;
				if (helper.at[at].core_browsers.includes(browser)) {
					featureObject.tests[testIndex].at[at].core_support.pushUnique(support);
					if (helper.core_at.includes(at)) {
						featureObject.tests[testIndex].core_support.pushUnique(support);
						featureObject.core_support.pushUnique(support);
					} else {
						featureObject.tests[testIndex].extended_support.pushUnique(support);
						featureObject.extended_support.pushUnique(support);
					}
				} else if (helper.at[at].extended_browsers.includes(browser)) {
					featureObject.tests[testIndex].at[at].extended_support.pushUnique(support);
					featureObject.tests[testIndex].extended_support.pushUnique(support);
					featureObject.extended_support.pushUnique(support);
				}
			}
		}
	}

	var fs = require('fs');

	fs.writeFileSync('test.json', JSON.stringify(featureObject, null, 2));

	return featureObject;
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