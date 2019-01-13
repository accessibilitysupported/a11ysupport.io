# Changelog

## 2018-01-12
This was a major update to the prototype that involved the following major changes:

* Enforce a single assertion per test. In other words, do not allow test cases to test more than one name, role, value, state, or property at a time.
* Replace the "aam" test type with a more generic "assertion" type.
* Allow multiple test cases to reference the same html file via the `html_file` property on the test
* Tests now define which feature they relate to (instead of the other way around)
* Allow tests to be nested in a folder structure (will help support test suites)
* Simplification of the instructions to run a test, thanks to the new assertion data
* Note: test names changed and links were likely broken.
