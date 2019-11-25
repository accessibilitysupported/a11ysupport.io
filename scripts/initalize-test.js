let fs = require('fs');
let moment = require('moment');
const argv = require('minimist')(process.argv.slice(2));
let ATBrowsers = require('./../data/ATBrowsers');
let currentDateString = moment().format('YYYY-MM-DD');
let dataDir = __dirname+'/../data';

if (!argv.id) {
    console.log('Invalid command.');
    console.log('initialize-test.js --id {test id}');
    process.exit();
}

let testFile = __dirname + '/../data/tests/'+argv.id+'.json';
let test = require(testFile);

if (!test.commands || argv['clear-all']) {
    test.commands = {};
}

var addCommand = function(test, at, browser, command, feature_id, feature_assertion_id, output, result, notes) {
    if (!test.commands[at]) {
        test.commands[at] = {};
    }

    if (!test.commands[at][browser]) {
        test.commands[at][browser] = [];
    }

    let command_index = test.commands[at][browser].findIndex(obj =>
        obj.command === command.command
        && obj.css_target === command.css_target
        && obj.from === command.from
        && obj.to === command.to
    );

    if (-1 === command_index) {
        command.results = [];
        test.commands[at][browser].push(command);
        command_index = test.commands[at][browser].length - 1;
    }

    let result_index = test.commands[at][browser][command_index].results.findIndex(obj =>
        obj.feature_id === feature_id
        && obj.feature_assertion_id === feature_assertion_id
    );

    if (-1 === result_index) {

        test.commands[at][browser][command_index].results.push({
            feature_id: feature_id,
            feature_assertion_id: feature_assertion_id,
            output: output,
            result: result,
            notes: notes
        });
    }
};

test.assertions.forEach(function(assertionLink) {
    var feature = require(__dirname + '/../build/tech/'+assertionLink.feature_id+'.json');

    let assertion_key = feature.assertions.findIndex(obj => obj.id === assertionLink.feature_assertion_id);
    if (assertion_key === -1) {
        console.log(assertionLink.feature_assertion_id + ' not found. Try re-building the project and run this command again.');
        process.exit();
    }

    var assertion = feature.assertions[assertion_key];

    for(let at in ATBrowsers.at) {
        if (assertion.exclude_at && Object.keys(assertion.exclude_at).includes(at)) {
            // This AT is not applicable for some reason. Don't pre-populate commands.
            // the "na" value is populated at build-time.
            continue;
        }

        if (assertionLink.exclude_at && Object.keys(assertionLink.exclude_at).includes(at)) {
            // This AT is not applicable for some reason. Don't pre-populate commands.
            // the "na" value is populated at build-time.
            continue;
        }

        if (ATBrowsers.at[at].type === "vc" && !assertion.operation_modes.includes("vc")) {
            //console.log('here');
            // We are not on a VC AT and the assertion is just for VC AT, so skip.
            continue;
        }

        let validBrowsers = ATBrowsers.at[at].core_browsers;
        validBrowsers.forEach(function (browser) {
            switch (assertion.id) {
                case 'convey_change_in_value':
                    if (ATBrowsers.at[at].type === "sr" && assertion.operation_modes.includes('sr/interaction')) {
                        // see if it already exists
                        addCommand(test, at, browser, {
                            command: "enter_text",
                            css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                            from: "before target",
                            to: "target"
                        }, assertionLink.feature_id, assertionLink.feature_assertion_id, "character was announced", "pass", null);
                    } else {
                        console.log("expected convey_change_in_value to support sr/interaction ");
                    }
                    break;
                case 'provide_shortcuts':
                    if (ATBrowsers.at[at].type === "sr" && assertion.operation_modes.includes('sr/reading')) {
                        addCommand(test, at, browser, {
                            command: "next_form_field",
                            css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                            from: "before target",
                            to: "target"
                        }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);

                        if (at === "jaws" || at === "nvda" || at === "vo_macos") {
                            // These support open_element_list
                            addCommand(test, at, browser, {
                                command: "open_element_list",
                                css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                from: "na",
                                to: "na"
                            }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);
                        }
                    } else {
                        console.log("expected convey_change_in_value to support sr/reading ");
                    }
                    break;
                case 'widget_is_supported':
                    addCommand(test, at, browser, {
                        command: "multiple_commands",
                        css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                        from: "na",
                        to: "na"
                    }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);
                    break;
                default:
                    if (ATBrowsers.at[at].type === "sr") {
                        if (assertion.operation_modes.includes('sr/reading')) {
                            addCommand(test, at, browser, {
                                command: "next_item",
                                css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                from: "before target",
                                to: "target"
                            }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);
                        }

                        if (assertion.operation_modes.includes('sr/interaction')) {
                            // not all screen readers have next_focusable_item...
                            if (ATBrowsers.at[at].commands.next_focusable_item) {
                                addCommand(test, at, browser, {
                                    command: "next_focusable_item",
                                    css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                    from: "before target",
                                    to: "target"
                                }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);
                            } else {
                                addCommand(test, at, browser, {
                                    command: "next_item",
                                    css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                    from: "before target",
                                    to: "target"
                                }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", null);
                            }
                        }
                    } else if (ATBrowsers.at[at].type === "vc" && assertion.operation_modes.includes('vc')) {
                        if (assertion.id === "convey_name" || assertion.id === "contribute_to_accessible_name") {
                            addCommand(test, at, browser, {
                                command: "activate_name",
                                css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                from: "na",
                                to: "na"
                            }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", "said \"\"");
                        }

                        if (assertion.id === "convey_role") {
                            if (at === "dragon_win") {
                                addCommand(test, at, browser, {
                                    command: "activate_role",
                                    css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                    from: "na",
                                    to: "na"
                                }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", "said \"\"");
                            } else {
                                addCommand(test, at, browser, {
                                    command: "show_numbers",
                                    css_target: (assertionLink.css_target)? assertionLink.css_target : assertion.css_target,
                                    from: "na",
                                    to: "na"
                                }, assertionLink.feature_id, assertionLink.feature_assertion_id, "\"\"", "unknown", "said \"\"");
                            }
                        }
                    }

            }

        });
    }

    // Use the latest versions that we have on file.
    var versions = require(__dirname + '/../data/latest_versions.json');
    test.versions = {};

    for(let at in ATBrowsers.at) {
        if (!test.versions[at]) {
            test.versions[at] = {
                browsers: {}
            }
        }

        let validBrowsers = ATBrowsers.at[at].core_browsers;
        validBrowsers.forEach(browser => {
            if (test.versions[at].browsers[browser]) {
                return;
            }
            test.versions[at].browsers[browser] = {
                at_version: versions.at[at].at_version,
                os_version: versions.at[at].os_version,
                browser_version: versions.browsers[browser].version,
                date: currentDateString
            }
        });
    }

    var string = JSON.stringify(test, null, 2);

    fs.writeFileSync(testFile, string);
});
