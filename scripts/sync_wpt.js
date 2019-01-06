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

//TODO: Auto fill test_shell json data
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

let loadTestCase = function(url, suite_name) {
    console.log(url);
    fetch(url)
        .then(res => res.text())
        .then(function(html) {
            let $$ = cheerio.load(html);
            let script = $$('head script:last-of-type');

            // TODO: What if script doesn't exist?

            let parsed = esprima.parseScript(script.get()[0].children[0].data);
            let steps = parsed.body[1].declarations[0].init.arguments[0].properties[0].value;
            let steps_json = escodegen.generate(steps, {
                format: {
                    json: true
                }
            });
            steps_json = JSON.parse(steps_json);

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

            let file_html = url.replace('http://www.w3c-test.org/', '');
            let file_json = file_html.replace('.html', '.json');

            // ensure the json exists
            let path_json = dataDir+'/tests/wpt/'+file_json;
            if (!fs.existsSync(path_json)) {
                let path = path_json.substring(0, path_json.lastIndexOf("/"));
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }

                let json = TEST_SHELL;

                json.title = title;
                json.description = "This is an imported test imported from [WPT " + suite_name + "]("+'http://w3c.github.io/test-results/'+suite_name+'/all.html'+")\r\n";
                json.description += "[View the external text]("+url+")\r\n";

                if (suite_name === 'accname') {
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
                    //TODO: do we have to depend on steps_json for this? Would it be better to map the html tag+attributes directly to ARIA properties?
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


