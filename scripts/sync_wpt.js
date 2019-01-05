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
    "expected": {
        "role": "todo",
        "accessible_name": "todo"
    },
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
            let test = escodegen.generate(steps, {
                format: {
                    json: true
                }
            });

            // TODO: Map these expected results to the TEST_SHELL
            console.log(JSON.parse(test));

            let file_html = url.replace('http://www.w3c-test.org/', '');
            let file_json = file_html.replace('.html', '.json');

            // ensure the json exists
            let path_json = dataDir+'/tests/wpt/'+file_json;
            if (!fs.existsSync(path_json)) {
                let path = path_json.substring(0, path_json.lastIndexOf("/"));
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
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


