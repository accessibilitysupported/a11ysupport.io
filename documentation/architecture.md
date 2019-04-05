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

Within the JSON object we have the following properties

* `id` (optional): this is not required and must match the file name. If it is not defined here, the build process will define it using the file name.
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

## Build process

## Front end

## Workflow to update data
