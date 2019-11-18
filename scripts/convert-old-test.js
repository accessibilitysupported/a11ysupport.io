let fs = require('fs');
let moment = require('moment');
const argv = require('minimist')(process.argv.slice(2));
let ATBrowsers = require('./../data/ATBrowsers');
let currentDateString = moment().format('YYYY-MM-DD');
let dataDir = __dirname+'/../data';
let glob = require('glob');
let testFiles = glob.sync(__dirname+'/../data/tests/**/*.json');

testFiles.forEach(function(testFile) {
    let newTestFile = testFile.slice(0, -5)+'.json';
    let test = require(testFile);

    test.commands = {};

    test.assertions.forEach(function(assertionLink) {
        var feature = require(__dirname + '/../build/tech/'+assertionLink.feature_id+'.json');

        let assertion_key = feature.assertions.findIndex(obj => obj.id === assertionLink.feature_assertion_id);
        if (assertion_key === -1) {
            console.log(assertionLink.feature_assertion_id + ' not found. Try re-building the project and run this command again.');
            process.exit();
        }

        var assertion = feature.assertions[assertion_key];

        for(let at in ATBrowsers.at) {
            if (!test.commands[at]) {
                test.commands[at] = {};
            }

            let validBrowsers = ATBrowsers.at[at].core_browsers.concat(ATBrowsers.at[at].extended_browsers);
            validBrowsers.forEach(function (browser) {
                if (!assertionLink.results[at]
                    || !assertionLink.results[at].browsers[browser]
                    || !assertionLink.results[at].browsers[browser].output) {
                    // no output was found.
                    return;
                }

                // Initialize
                if (!test.commands[at][browser]) {
                    test.commands[at][browser] = [];
                }

                if (assertionLink.results[at].browsers[browser].notes) {
                    if (!assertionLink.browserNotes) {
						assertionLink.browserNotes = {};
                    }

                    if (!assertionLink.browserNotes[at]) {
						assertionLink.browserNotes[at] = {};
                    }

					assertionLink.browserNotes[at][browser] = assertionLink.results[at].browsers[browser].notes;
                }

                assertionLink.results[at].browsers[browser].output.forEach(command => {
                    // make a copy so that we don't change the original
                    let copy = Object.assign({}, command);

                    // css_target was not defined on this obj before this
                    copy.css_target = assertion.css_target;

                    // set default from and to where necessary
                    if (ATBrowsers.at[at].type === 'sr') {
                        switch(copy.command) {
                            case 'enter_text':
                                if (!copy.from) {
                                    copy.from = 'target';
                                }
                                if (!copy.to) {
                                    copy.to = 'target';
                                }
                                break;
                            case 'multiple_commands':
                            case 'open_element_list':
                                if (!copy.from) {
                                    copy.from = 'na';
                                }
                                if (!copy.to) {
                                    copy.to = 'na';
                                }
                                break;
                            default:
                                if (!copy.from) {
                                    copy.from = 'before target';
                                }
                                if (!copy.to) {
                                    copy.to = 'target';
                                }
                        }
                    } else {
                        if (!copy.from) {
                            copy.from = 'na';
                        }
                        if (!copy.to) {
                            copy.to = 'na';
                        }
                    }

                    // does the command already exit?
                    let command_key = test.commands[at][browser].findIndex(obj =>
                        obj.command === copy.command
                        && obj.css_target === copy.css_target
                        && obj.from === copy.from
                        && obj.to === copy.to
                    );

                    if (!copy.results) {
                        copy.results = [];
                    }

                    if (-1 === command_key) {
                        // add it
                        test.commands[at][browser].push(copy);
                        // Set the command key to the new key
                        command_key = test.commands[at][browser].length-1;
                    }

                    test.commands[at][browser][command_key].results.push({
                        feature_id: assertionLink.feature_id,
                        feature_assertion_id: assertionLink.feature_assertion_id,
                        result: copy.result,
                        notes: copy.notes
                    });

                    // Delete properties that now live in the results array.
                    delete copy.result;
                    delete copy.notes;
                });
            });
        }

        delete assertionLink.results;
    });

    test = Object.assign({
        "id": null,
        "title": null,
        "description": null,
        "html_file": null,
        "assertions": null,
        "commands": null,
        "history": null,
        "versions": null
    }, test);

	// Use the latest versions that we have on file.
	var string = JSON.stringify(test, null, 2);

	fs.writeFileSync(newTestFile, string);
});
