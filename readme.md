# Accessibility Supported

Status: prototype, awaiting feedback

accessibilitysupported.com

## Install and run

1. Install required node packages: `npm install`
2. Build data: `npm run build`
3. Run tests: `npm run test`
4. Serve: `npm run start`

## Structure

This project is built on express js, and all data lives in json files in the `data` directory. These json files are processed during the build step and saved to the `build` directory.

* `tech` - tech are different categories of technology (html, css, aria, svg, etc)
* `feature` - features are specific features of a technology, such as elements, attributes, properties, etc.
* `tests` - tests are specific test cases for a feature (or many features). Each feature should have at least one test that only tests that feature.

### the data directory

These files are essentially slimmed down versions of the full json files that are made during the build step. Only known information is filled out. The build step will add all unknown data points. The hope is that it will be easier to edit and maintain the these minimal files.

## accept a support point

**The task of accepting a support point is done by a project maintainer that has full access to the repository and is familiar with git and GitHub.**

Users can run tests for specific AT/Browser combinations (support point) and post their findings to a github issue. These findings should be verified by another user before being added to the repository.

Once a support point is verified, it is ready to be added to the repository. There is a script at `scripts/sync-support-point.js` that makes this a easy.

### Step 1: sync the test json file from a github issue (or comment)

Run `node scripts/sync-support-point.js --issue {issue number}` to update the appropriate json file with the results that were found. This will take the results in the issue body.

Run `node scripts/sync-support-point.js --comment {comment id}` to accept the results in a comment ID. This might be needed if a difference was found during the verification step. You can get the comment ID from the URL that is generated when the time stamp is clicked for the specific comment on GitHub.

### Step 2: Review and commit

Now you just need to make sure that everything was synced correctly. If you think it is ready, commit the change and push to a new branch on Github.

1. make sure you are on the right branch: `git checkout master`
2. make sure your clone is up to date: `git pull origin master`
3. build the project and test: `npm run build && npm run test`
4. (optional) manually verify that everything looks good `npm run start`
4. commit the changes: `git commit -m 'closes #{issue-number}'`
5. push the changes `git push origin master`
