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

let linkTestToFeature = function(test_id, feature_id) {
    //load the feature by feature_id
    let path_json = dataDir + '/tech/'+feature_id;
    let feature = require(path_json+'.json');

    if (!feature) {
        console.log('could not load feature at: ' + path_json);
        return;
    }

    if (feature.tests.includes(test_id)) {
        // already exists, escape early
        return;
    }

    feature.tests.push(test_id);

    fs.writeFileSync(path_json+'.json', JSON.stringify(feature, null, 2));
};

let assertionToFileName = function(assertion) {
    if (assertion.states_and_properties) {
        return assertion.states_and_properties[0].title;
    }

    return Object.keys(assertion)[0];
};

let loadTestCase = function(url, suite_name) {
    //console.log(url);
    fetch(url)
        .then(res => res.text())
        .then(function(html) {
            let $$ = cheerio.load(html);

            let file_html = url.replace('http://www.w3c-test.org/', '');
            let file_json = file_html.replace('.html', '');
            let target = $$('#test');
            let all_attributes = Object.entries(target[0].attribs);

            // Figure out what tests we need to create (one test for each assertion)

            let assertions = [];
            if (suite_name === 'wai-aria') {
                // wai-aria
                all_attributes.forEach(attribute => {
                    if (attribute[0] === 'role') {
                        assertions.push({
                            role: attribute[1]
                        });
                    } else if (ARIA_ATTRIBUTE_MAP[attribute[0]]) {
                        // this is a custom mapping to the accessible name or description
                        let assertion = {};
                        assertion[ARIA_ATTRIBUTE_MAP[attribute[0]]] = attribute[1];
                        assertions.push(assertion);
                    } else if (attribute[0].startsWith('aria-')) {
                        let assertion = {states_and_properties: []};
                        assertion.states_and_properties[0] = {
                            title: attribute[0].replace('aria-', ''),
                            value: attribute[1]
                        }
                        assertions.push(assertion);
                    } else if (!['id', 'tabindex', 'class', 'src', 'alt', 'style', 'type', 'value', 'contenteditable'].includes(attribute[0])) {
                        // Likely testing to make sure native HTML attribute overrides ARIA... Need to verify in every case.
                        console.log("unknown attribute: " + url+"\t"+attribute[0]);
                    }
                });
            } else if (suite_name === 'accname') {
                // accname
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
                        assertions.push({
                            accessible_name: assertion[3]
                        });
                    } else if (assertion[1] === 'description') {
                        assertions.push({
                            accessible_description: assertion[3]
                        });
                    }
                });
            }

            assertions.forEach(assertion => {
                // ensure the json exists
                // TODO: a lot of this could be generalized to generate a json file for any given HTML.
                let key = assertionToFileName(assertion);
                let path_json = dataDir+'/tests/wpt/'+file_json+'_'+key+'.json';
                let test_id = 'wpt/'+file_json+'_'+key;
                if (!fs.existsSync(path_json)) {
                    let path = path_json.substring(0, path_json.lastIndexOf("/"));
                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path, { recursive: true });
                    }

                    // Figure out what to name this test
                    let title = '('+key+') '+ target[0].name;
                    let skip_attributes = ['id'];

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
                    }

                    // Clone the TEST_SHELL and make a new json object.
                    let json = JSON.parse(JSON.stringify(TEST_SHELL));

                    json.title = title;
                    json.description = "This is an imported test imported from [WPT " + suite_name + "]("+'http://w3c.github.io/test-results/'+suite_name+'/all.html'+")\r\n";
                    json.description += "[View the external text]("+url+")\r\n";
                    json.expected = assertion;
                    json.html_file = 'wpt/'+file_html;

                    // now write the test file
                    fs.writeFileSync(path_json, JSON.stringify(json, null, 2));

                    // now link the test to relevant features
                    if (json.expected.role) {
                        linkTestToFeature(test_id, 'aria/'+json.expected.role+'_role');
                    }

                    if (json.expected.states_and_properties) {
                        linkTestToFeature(test_id, 'aria/aria-'+json.expected.states_and_properties[0].title+'_attribute');
                    }
                }
            });

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
                //if (i === 0) { // only load one while testing
                    //Load the test html and parse it.
                    loadTestCase($(this).attr('href'), suite_name);
                //}
            });
        });
});


