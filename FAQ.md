# FAQ

1. [What is this?](#what-is-this%3F)
1. [Can't this be automated?](#cant-this-be-automated%3F)
2. [What Assistive Technologies are in scope?](#what-assistive-technologies-are-in-scope%3F)
3. [Who runs this?](#who-runs-this%3F)
4. [What are the levels of support?](#what-are-the-levels-of-support%3F)

## What is this?

This is a community driven website that aims to help inform developers about what is [accessibility supported](https://www.w3.org/TR/WCAG21/#cc4). In order to conform to WCAG 2.0, you must use code in ways that are supported by assistive technologies (such as screen readers).

Our goal is not to tell you what you can or can not use, but to help you make informed decisions. For example, you may be able to use unsupported features in a way that does not negatively affect AT interaction.

## Can't this be automated?

There are many different ways that Assistive Technology (AT) interacts with a browser and your code.

1. Accessibility APIs (most common). In this method, a browser will create an accessibility tree (subset of the DOM) and expose it to a system Accessibility API. The AT will then consume that API. This mapping is being standardied via the [Accessibility API Mapping standards](https://www.w3.org/TR/core-aam-1.1/).
2. The AT will directly interface with the browser and read the DOM.
3. A mixture of 1 and 2.

It is possible to automatically test the Accessibility APIs and DOM, but the AT itself might have bugs or not fully implement certain features.

Unfortunately, it is not yet possible to fully drive AT in an automated way, so we are left with having to do manual tests.

## What Assistive Technologies are in scope?

We list Assistive Technologies that must interact with code in order to be operable. This boils down to two main categories of AT:
 
 1. Screen reader software
 2. Voice Control software

Testing every possible combination of AT and Browser is simply unrealistic. We organize both AT and Browsers into two categories:

1. Core
2. Extended

Core AT and Browsers are commonly used or widely available. We try to keep the list to a minimum in order to make testing easier. We try to use the following rule to determine what should be considered 'core':

* AT that is built into the operating system + the native browser on that operating system (eg. VoiceOver and Safari).
* Free or Open source AT that is widely available (eg. NVDA).
* AT that requires a paid license, but is widely adopted (eg. Jaws).

There will be some exceptions too this rule, but we will do our best to follow it.

Extended combinations include rare AT/Browser combinations or AT/Browser combinations that are rarely used in the wild.

**The Accessibility Supported conformance requirement in WCAG does not specify what technologies must be supported.** Our core support list may not match the list of technologies that you choose to support for any given project.

For now, we base most of our data on the results of the latest [WebAim Screen Reader Survey](https://webaim.org/projects/screenreadersurvey7/).

## Who runs this?

This project was originally developed by the University of Nebraska - Lincoln. It is run by the community and anyone can contribute to it.

## What are the levels of support?

There are several levels of support.

For a given support point (specific to a test):

* u = unknwon
* n = no support
* y = full support
* p = partial support (unusual)
* na = not applicable

For a test or feature:

* Full support (all core support points are fully supported across all tests)
* Some support (some core support points are fully supported across all tests)
* No support (no core support points are fully supported across all tests)
* Unknown (all core support points are unknown)
