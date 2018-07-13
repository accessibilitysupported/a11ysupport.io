# Contributing

Thank you for your interest in contributing to our data.

There are a few ways that you can contribute:

1. [Tell us that something is wrong](#tell-us-that-something-is-wrong)
2. [Add or modify a support point](#add-or-modify-a-support-point)
3. [Suggest a missing test case](#suggest-a-missing-test-case)
4. [Improve a test case](#improve-a-test-case)
5. [Suggest a new technology](#suggest-a-new-technology)
6. [Suggest a new feature](#suggest-a-new-feature)

## Tell us that something is wrong

We can't get everything right. And let's be honest, this project represents a huge amount of work by a lot of people. We are human and we make mistakes. But in order for us to fix those mistakes, we must first know about them. Please [create an issue](https://github.com/accessibilitysupported/accessibilitysupported/issues) to bring something to our attention.

When creating an issue, please be as detailed as you can.

## Add or modify a support point

The best thing you can do to help us out is to run tests against specific AT/Browser combinations and contribute your findings back to us.

A support point is the support value for a given AT/Browser/Test.

1. Find a test that you want to run.
2. Read the provided instructions so that you understand the expected results.
2. Use your chosen AT/Browser combination to run the test.
3. Open an issue that details the results or create a pull request with your findings. Be sure to provide specific versions of the AT, Browser, and OS that were used.
4. Add an entry to the history array for the test that describes any changes.
5. Your findings must be verified by at least one other person before they are accepted. Verification must either be done manually, or by citing a trust worthy 3rd party resource.

An issue to add or modify a support point should include:

1. The name of the test
2. The AT name
3. The AT version
4. The Browser Name
5. The Browser version
6. The OS version
7. The output announced by the screen reader (if using a screen reader).
8. Whether or not you think the test passes or fails

## Suggest a missing test case

Please [create an issue](https://github.com/accessibilitysupported/accessibilitysupported/issues) or create a pull request to suggest a new test case. Details for the test case should include:

1. A name for the test case.
2. Sample code for the test case (preferably committed to this project so that it doesn't change without our knowledge).
4. List the feature(s) should reference the test case. If you are making a pull request, update the features to reference the test.
5. Describe the Expected output and instructions. This must be objective and empirical in nature and must correlate to the output that is described by associated standards. The following must be listed
    * The CSS selector for the target element
    * The expected role, accessible name, accessible description, states, and properties of the element
6. Any current support if you know it (follow the instructions for adding a new support point).

All new test cases must be approved by at least one other person.

### Determine the expected role, accessible name, accessible description, states, and properties

Use the [Accessibility API Mapping standards](https://www.w3.org/TR/core-aam-1.1/) wherever possible to determine the expected values.

* [Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.1/) - general expectations
* [HTML AAM](https://www.w3.org/TR/html-aam-1.0/) - specific HTML rules
* [SVG AAM](https://www.w3.org/TR/svg-aam-1.0/) - specific SVG rules

## Improve a test case

If you find a problem with a test case, please [create an issue](https://github.com/accessibilitysupported/accessibilitysupported/issues) or create a pull request to detail the problem. Any changes to a test case must be approved by one other person.

## Suggest a new technology

Please [create an issue](https://github.com/accessibilitysupported/accessibilitysupported/issues) or create a pull request to suggest a new technology. A new technology should include:

1. A link to the standard that supports the technology
2. Any relevant links to aid in determining the correct AT behavior when interacting with the technology. There must be at least one.
3. At least one feature with at least one test with at least one support point (follow relevant instructions).

All new technologies must be approved by at least one other person.

## Suggest a new feature

Please [create an issue](https://github.com/accessibilitysupported/accessibilitysupported/issues) or create a pull request to suggest a new feature. A new feature will only be accepted if it includes:

1. A name for the feature.
2. A description of the feature.
2. Links to relevant standards to support the feature and describe how AT interaction is supposed to work.
3. At least one test case with at least one support point.
4. Any support details that you are aware of.

All new features must be approved by at least one other person.
