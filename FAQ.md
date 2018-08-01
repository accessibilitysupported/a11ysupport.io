# FAQ

1. [What is this?](#what-is-this%3F)
1. [Can't this be automated?](#cant-this-be-automated%3F)
2. [What Assistive Technologies are in scope?](#what-assistive-technologies-are-in-scope%3F)
3. [Who runs this?](#who-runs-this%3F)
4. [What are the levels of support?](#what-are-the-levels-of-support%3F)

## What is this?

This is a community driven website that aims to help inform developers about what is [accessibility supported](https://www.w3.org/TR/WCAG21/#cc4). In order to conform to WCAG 2.0, you must write code in ways that are supported by assistive technologies (such as screen readers).

Our goal is not to tell you what you can or can not use, but to help you make informed decisions. For example, you may be able to use unsupported features in a way that does not negatively affect AT interaction.

We also hope to help developers learn how to test with assistive technologies. To accomplish this, we will provide introductory materials on how to use different assistive technologies and provide detailed instructions about how to perform tests. We also hope to run workshops at developer conferences.

There are some other projects that are similar to this, however most of them:
* Are closed sourced (no contributions)
* Do not cover all of the common AT
* Do not disclose exactly how tests are performed
* Only tests a specific technology (or subset of that technology)
* Only tests the accessibility API layer, not the end result of the AT

## Can't this be automated?

There are many different ways that Assistive Technology (AT) interacts with a browser and your code.

1. Accessibility APIs (most common). In this method, a browser will create an accessibility tree (subset of the DOM) and expose it to a system Accessibility API. The AT will then consume that API. This mapping is being standardized for many technologies via the [Accessibility API Mapping standards](https://www.w3.org/TR/core-aam-1.1/).
2. The AT will directly interface with the browser and read the DOM.
3. A mixture of 1 and 2.

It is possible to automatically test the Accessibility APIs and DOM, but the AT itself might have bugs or not fully implement certain features.

Unfortunately, it is not yet possible to fully drive AT in an automated way, so we are left with having to do manual tests.

## What Assistive Technologies are in scope?

**The Accessibility Supported conformance requirement in WCAG does not specify what technologies must be supported.** Our core support list may not match the list of technologies that you choose to support for any given project.

**Our goal is to test against a manageable list of common and widely available AT.**

We list Assistive Technologies that must interact with code in order to be operable. This boils down to two main categories of AT:
 
 1. Screen reader software
 2. Voice Control software

Testing every possible combination of AT and Browser is simply unrealistic. We organize both AT and Browsers into two categories:

1. Core
2. Extended

### Core AT + Browser combinations

Core AT and Browsers are commonly used or widely available. We try to keep the list to a minimum in order to make testing easier. The following rules are used to determine what should be considered 'core':

For each category of AT that is within scope:
1. AT that is built into the operating system if it is used by at least 10% of respondents + the native browser on that operating system. This currently includes:
    * VoiceOver for Mac + Safari for Mac
    * VoiceOver for iOS + Safari for iOS
    * Windows Narrator + Edge
    * Android Accessibility Suite + Google Chrome
2. Free or Open source AT (eg. NVDA) that this is widely adopted + the browser with the highest usage for the AT. This currently includes:
    * NVDA + Firefox
3. AT that requires a paid license and is widely adopted + the browser with the highest reported usage for the AT. This currently includes:
    * JAWS + IE and Edge (both browsers during transition from IE)
    * Dragon Naturally Speaking + Google Chrome (voice control software)

The phrase 'widely supported' for core AT means that greater than or equal to 20% of respondents use it as their primary AT.

### Extended Combinations

Extended combinations include rarer AT/Browser combinations that are used by at least 10% of respondents + the major browsers available on the operating system.

Major browsers are defined as: Google Chrome, Edge, Firefox, Internet Explorer, and Safari.

### Survey Sources

For now, we base our data on the results of the latest

* [WebAim Screen Reader Survey](https://webaim.org/projects/screenreadersurvey7/). 
* [UK.gov AT Survey](https://accessibility.blog.gov.uk/2016/11/01/results-of-the-2016-gov-uk-assistive-technology-survey/)

## Who runs this?

The community both runs and ownes this project. The original idea and prototype was developed by Michael Fairchild with encouragement from the web development community at the University of Nebraska - Lincoln. The data and software is opened sourced under the GPL 3.0 license.

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
