# Accessibility Supported

Status: prototype, awaiting feedback

accessibilitysupported.com

## Install and run

1. Install required node packages: `npm install`
2. Build data: `npm build`
3. Run tests: `npm test`
4. Serve: `npm start`

## Structure

This project is built on express js, and all data lives in json files in the `data` directory. These json files are processed during the build step and saved to the `build` directory.

* `tech` - tech are different categories of technology (html, css, aria, svg, etc)
* `feature` - features are specific features of a technology, such as elements, attributes, properties, etc.
* `tests` - tests are specific test cases for a feature (or many features). Each feature should have at least one test that only tests that feature.

### the data directory

These files are essentially minimized versions of the full json files that are made during the build step. Only known information is filled out. The build step will add all unknown data points. The hope is that it will be easier to edit and maintain the these minimal files.

