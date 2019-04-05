# Architecutre of the project

This document contains details of the architecture of a11ysupport.io, including

* file structure
* data model
* build process
* front end
* workflow to update data


## High level summary of file structure

From the root directory of the project

* `/data/` contains the JSON data that drives the project
  * `/data/schema/` contains JSON files that describe other JSON files (used to validate JSON files)
  * `/data/tech/` contains JSON files that describe different technology features
  * `/data/tests/` contains JSON files that describe tests and test results
    * `/data/tests/html/` contains the static HTML files referenced by tests
* `/documentation/` contains documentation on the project
* `/public/` public facing assets that are served by the front end
* `/routes/` contains logic to route front end requests
* `/scripts/` contains scripts to manage the project
* `/src/` contains helper functions and other source files
* `/views/` contains PUG files for the front end

## Data model

This section describes the data model

### Tech data model

The project supports tracking the support of many different technologies and their features, such as HTML, SVG, ARIA, CSS, etc.

A master list of the technologies can be found at [/data/tech.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/tech.json)

Within the `/data/tech` directory are subfolders for each tech ID found in `/data/tech.json`. For example, `aria` would map to `tech.aria` and `/data/tech/aria/`. Each file within `/data/tech/aria/` describes a specific technology feature (attribute, role, element, etc).

#### Tech features

Taking `aria-haspopup` as an example, the associated technology object is located at [/data/tech/aria/aria-has-popup_attribute.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/tech/aria/aria-haspopup_attribute.json). The trailing '_attribute' part of the name is not necessary, but helps track the type of feature when browsing the folder.

Within the feature JSON object we have the following properties

* `id` (optional): this is not required and must match the file name. If it is not defined here, the build process will define it using the file name. The ID is prefixed with the tech. `aria-haspopup` would be `aria/aria-haspopup_attribute`.
* `title` (required): a human readable title for the feature.
* `type` (optional): the type of feature. Usually one of `element`, `role`, or `attribute`.
* `description` (required): a human readable description of the feature in markdown format.
* `related_issues` (optional): an array of url objects that point to related issues in browsers or assistvie technologies.
* `references` (optional): an array of url objects that point to specifications or other resources.
* `reccomendation` (optional): a markdown string that descibes any reccomendations for authors.
* `date_updated` (required): the date that this feature object was last updated.
* `keywords` (optional): array of strings used to help surface search results
* `keywords_string` (built): a string that is created during the build process by imploding the `keywords` array.
* `tests` (built): this process will be created during the build process and contains an array of associated test objects. This makes it easier to build the front end.

### Test data model

Continuing with the `aria-haspopup` example, a single feature might have many tests. A test for `aria/aria-haspopup_attribute` is the file [/data/tests/tech/aria/aria-haspopup_listbox.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/tests/tech/aria/aria_haspopup_listbox.json). There are other tests for other attribute values. The support result of all of these tests bubbles to a single value of support for the feature itself.

Within the test JSON object we have the following properties

* `id` (string|built): the ID of the test, based on the file name.
* `type` (enum|required): the type of test (`custom` or `assertion`)
* `title` (string|required): the title of the test.
* `description` (string|required): a longer markdown formatted description of the test.
* `supports_sr`: (bool|required): true = the test supports screen reader testing
* `supports_vc`: (bool|required): true = the test supports voice control testing (Dragon)
* `html_file` (string|optional): the path, relative to the `data/tests/` directory for the HTML test file. If empty, the same path as the test file is assumed (relative to the `data/tests/` directory)
* `css_target` (string|required): the css selector to test against. All elements that match the selector must be tested.
* `assertion` (object|required): an object that describes the assertion that must be met for the test to pass.
* `features` (array|required): an array of strings, where each string is an ID that matches a technology feature.
* `history` (array|required): an array of history objects that describe how the test and results have changed over time.
* `at` (array|required|built): an array of objects that scribe support findings for various combinations of AT/Browsers.

#### `assertion` object

* `aspect` (enum|required): the aspect of the feature to be tested. One of `role`, `name`, `description`, `property`, `state`, `other`.
* `title` (string|conditionally required): The name of the `property`, `state`, or `other` values to be tested.
* `value` (string|required): the value that must be conveyed to pass testing.

A test must have a single assertion if the `type` property of the test object is set to `assertion`. 

### `at/browser` object

The `at/browser` object (located at `test.at`) can contain a property for each of the at `at` objects listed in [/data/ATVBrowsers.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/ATBrowsers.json). For example, support data for `nvda` would live under `test.at.nvda`.

Each property under the `at/browser` object is an `at` object. Each `at` object chan contain a property for each of the browsers listed in [/data/ATVBrowsers.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/ATBrowsers.json). For example, support data for `nvda` and `firefox` would live under `test.at.nvda.firefox`. These objects are known as `browser` objects.

TODO: change the name of the `at/browser` object to `results`. 

Each `browser` object then contains

* `at_version` (string|required): the version of the AT used during the test
* `browser_version` (string|required): the version of the browser used during the test
* `os_version` (string|required): the version of the OS used during the test. The OS name can be inferred.
* `output` (array|required): an array of output objects that describes the specific output and results for different interactions.
* `date` (string|required): the date that this at/browser combination was last tested.
* `notes` (string|optional): any notes that describe findings or jusitfy the result.

The `output` object contains:

* `command` (string|required): The ID of the command used to navigate or trigger the element that matches the css target. These IDs match those found in the [/data/ATVBrowsers.json](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/data/ATBrowsers.json) array of commands for the current AT.
* `output` (string|required): the output of the result.
* `result` (enum|required): One of `pass`, `fail`, or `partial`.

## Build process

## Front end

## Workflow to update data
