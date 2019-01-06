let fs = require('fs');
const fetch = require('node-fetch');
let sanitize = require("sanitize-filename");
let moment = require('moment');
let cheerio = require('cheerio');
let esprima = require('esprima');
let escodegen = require('escodegen');
let beautify_html = require('js-beautify').html;

let currentDateString = moment().format('YYYY-MM-DD');
let dataDir = __dirname+'/../data';

//TODO: [done] Scrape and pull both accname and wai-aria suites
//TODO: [done] Auto fill test_shell json data
//TODO: [done] create json files in the tests directory
//TODO: [done] create HTML files in the tests/html directory
//TODO: Generate related ARIA/HTML features
//TODO: Link ARIA/HTML features with associated tests
//TODO: Can we logically determine the value for test_shell.supports_vc?

const TEST_SHELL = {
    "type": "aam",
    "title": "todo",
    "description": "todo",
    "supports_sr": true,
    "supports_vc": false,
    "css_target": "#target",
    "expected": {},
    "history": [
        {
            "date": currentDateString,
            "message": "Test created"
        }
    ],
    "at": {}
};


const ARIA_ATTRIBUTE_MAP = {
    "aria-label": "accessible_name",
    "aria-labelledby": "accessible_name",
    "aria-description": "accessible_description",
    "aria-describedby": "accessible_description"
};

let loadTestCase = function(url, suite_name) {
    console.log(url);
    fetch(url)
        .then(res => res.text())
        .then(function(html) {
            let $$ = cheerio.load(html);

            let file_html = url.replace('http://www.w3c-test.org/', '');
            let file_json = file_html.replace('.html', '.json');

            // ensure the json exists
            // TODO: a lot of this could be generalized to generate a json file for any given HTML.
            let path_json = dataDir+'/tests/wpt/'+file_json;
            if (!fs.existsSync(path_json)) {
                let path = path_json.substring(0, path_json.lastIndexOf("/"));
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }

                // Figure out what to name this test
                let target = $$('#test');
                let title = target[0].name;
                let skip_attributes = ['id'];
                let all_attributes = Object.entries(target[0].attribs);

                if (all_attributes.length > 0) {
                    // attributes
                    let attributes = [];
                    all_attributes.forEach(entry => {
                        if (skip_attributes.includes(entry[0])) {
                            return;
                        }

                        attributes.push(entry[0] + '="'+entry[1]+'"');
                    });

                    title += "["+attributes.join(' ')+']';
                }

                if (suite_name === 'accname') {
                    // innertext could be important for accname computations
                    if (target.text().trim() !== "") {
                        title += ' with innerText';
                    }

                    // TODO: css text could also be important for name computations. Is it possible to detect that here?
                }

                let json = TEST_SHELL;

                json.title = title;
                json.description = "This is an imported test imported from [WPT " + suite_name + "]("+'http://w3c.github.io/test-results/'+suite_name+'/all.html'+")\r\n";
                json.description += "[View the external text]("+url+")\r\n";

                if (suite_name === 'accname') {
                    // the expected accessible name/description are already in the steps data. Extract it.
                    let script = $$('head script:last-of-type');
                    let parsed = esprima.parseScript(script.get()[0].children[0].data);
                    let steps = parsed.body[1].declarations[0].init.arguments[0].properties[0].value;
                    let steps_json = escodegen.generate(steps, {
                        format: {
                            json: true
                        }
                    });
                    steps_json = JSON.parse(steps_json);

                    // now map the steps data
                    steps_json[0].test.ATK.forEach(assertion => {
                        if (assertion[0] !== 'property') {
                            return;
                        }

                        if (assertion[2] !== 'is') {
                            // we only care about positive assertions
                            return;
                        }

                        if (assertion[3] === '') {
                            // Make it obvious that we expect nothing (is there a better way to make this obvious?)
                            assertion[3] = '""';
                        }

                        if (assertion[1] === 'name') {
                            json.expected.accessible_name = assertion[3];
                        } else if (assertion[1] === 'description') {
                            json.expected.accessible_description = assertion[3];
                        }
                    });
                } else if (suite_name === 'wai-aria') {
                    // map all role and aria-* attributes on the target element
                    // TODO: what if there are relevant attributes on other elements in the test?
                    all_attributes.forEach(attribute => {
                        if (attribute[0] === 'role') {
                            json.expected.role = attribute[1];
                        } else if (ARIA_ATTRIBUTE_MAP[attribute[0]]) {
                            // this is a custom mapping to the accessible name or description
                            json.expected[ARIA_ATTRIBUTE_MAP[attribute[0]]] = attribute[1];
                        } else if (attribute[0].startsWith('aria-')) {
                            if (!json.expected.states_and_properties) {
                                json.expected.states_and_properties = {};
                            }

                            json.expected.states_and_properties[attribute[0]] = attribute[1];
                        }
                    });
                }

                // now write the file
                fs.writeFileSync(path_json, JSON.stringify(TEST_SHELL, null, 2));
            }

            let path_html = dataDir+'/tests/html/wpt/'+file_html;
            if (!fs.existsSync(path_html)) {
                let path = path_html.substring(0, path_html.lastIndexOf("/"));
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }

                // Remove scripts (we don't need them)
                $$('script').remove();
                // Remove css (we don't need them)
                $$('link').remove();
                // Remove html containers that we don't need
                $$('#manualMode').remove();
                $$('#log').remove();
                $$('#ATTAmessages').remove();

                // now write the file
                fs.writeFileSync(path_html, beautify_html($$.html(), {
                    preserve_newlines: false
                }));
            }
        });
};

let test_suites = ['accname', 'wai-aria'];

test_suites.forEach(function(suite_name) {
    // Fetch the listing index http://w3c.github.io/test-results/accname/all.html
    fetch('http://w3c.github.io/test-results/'+suite_name+'/all.html')
        .then(res => res.text())
        .then(function(html) {
            let $ = cheerio.load(html);
            $('.test a').each(function(i) {
                if (i === 0) { // only load one while testing
                    //Load the test html and parse it.
                    loadTestCase($(this).attr('href'), suite_name);
                }
            });
        });
});


