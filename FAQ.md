# FAQ

1. [What is this?](#what-is-this%3F)
2. [How should I interpret results?](#how-should-i-interpret-results%3F)
3. [What is the status of this project?](#what-is-the-status-of-this-project%3F)
4. [Can't this be automated?](#cant-this-be-automated%3F)
5. [What Assistive Technologies are in scope?](#what-assistive-technologies-are-in-scope%3F)
6. [Who runs this?](#who-runs-this%3F)
7. [What are the levels of support?](#what-are-the-levels-of-support%3F)
8. [What are expectations?](#what-are-expectations%3F)

## What is this?

This is a community-driven website that aims to help inform developers about what is [accessibility supported](https://www.w3.org/TR/WCAG). In order to conform to WCAG, you must write code in ways that are supported by assistive technologies (such as screen readers).

Our goal is not to tell you what you can or cannot use, but to help you make informed decisions. For example, you may be able to use unsupported features in a way that does not negatively affect AT interaction.

We also hope to help developers learn how to test with assistive technologies. To accomplish this, we will provide introductory materials on how to use different assistive technologies and provide detailed instructions about how to perform tests. We also hope to run workshops at developer conferences.

There are some other projects that are similar to this, however, most of them:

- Are closed sourced (no contributions)
- Do not cover all the common AT
- Do not disclose exactly how tests should be performed
- Only tests a specific technology (or a subset of that technology)
- Only tests the accessibility API layer, not the end result of the AT

## How should I interpret results?

Interpreting results can be fairly complex, so here are some general suggestions:

- Just because a feature is marked as supported in this project doesn't mean that it will be supported in all situations. Remember that we are testing against specific implementations. While we try to keep the tests as representative as possible, they might not match your specific implementation, and the context in which a code feature is used can mean the difference between good support and a blocker. Be sure to test your specific implementations.
- Just because something is marked as not having any known support does not necessarily mean there will be negative consequences for using it. It might be okay to use a feature that has poor accessibility support if doing so will not result in any barriers, or if a work-around is used.
- Be careful when using features that are listed as having partial support. Partial support might mean that specific aspects of a feature are not supported or that certain assistive technology commands do not work as expected.
- Understand that this is a project of user-contributed data. As such it may not always be the most up to date resource and may not always be accurate. We do our best to validate contributions and ensure a high level of quality, but mistakes do happen, and technology rapidly changes.
- The best way to determine how well your code works for people with disabilities is to test your code with people with disabilities.
- Be sure you conform to [WCAG 2.1 level AA](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1) and strive to meet the [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

## What is the status of this project?

This project is active and contributions are welcome. That being said, I still consider the project to be a work-in-progress. Additionally, I am co-chairing the [W3C ARIA-AT Community group](https://www.w3.org/community/aria-at/) that has a goal to create a similar project but with a slightly different approach and reduced scope. The ARIA-AT group is still in the planning phase, and I don't expect it to be mature enough to fully overtake this project any time soon. At some point in the future, the ARIA-AT project might nullify this project.

## Can't this be automated?

There are many ways that Assistive Technology (AT) interacts with a browser and your code.

1. Accessibility APIs (most common). In this method, a browser will create an accessibility tree (a subset of the DOM) and expose it to a system Accessibility API. The AT will then consume that API. This mapping is being standardized for many technologies via the [Accessibility API Mapping standards](https://www.w3.org/TR/core-aam-1.1/).
2. The AT will directly interface with the browser and read the DOM.
3. A mixture of 1 and 2.

It is possible to automatically test the Accessibility APIs and DOM, but the AT itself might have bugs or not fully implement certain features.

Unfortunately, it is not yet possible to fully drive AT in an automated way, so we are left with having to do manual tests.

## What Assistive Technologies are in scope?

**The Accessibility Supported conformance requirement in WCAG does not specify what technologies must be supported.** Our core support list may not match the list of technologies that you choose to support for any given project.

**Our goal is to test against a manageable list of common and widely available AT.**

We list Assistive Technologies that must interact with code in order to be operable. This boils down to two main categories of AT:

1.  Screen reader software
2.  Voice control software

Testing every possible combination of AT and Browser is simply unrealistic. We organize both AT and Browsers into two categories:

1. Core
2. Extended

### Core AT + Browser combinations

Core AT and Browsers are commonly used or widely available. We try to keep the list to a minimum in order to make testing easier. The following rules determine what should be considered 'core':

For each category of AT that is within the scope:

1. AT that is built into the operating system + the native browser on that operating system.
2. Free or Open source AT (eg. NVDA) that are widely adopted + browser combinations that are widely adopted for that AT.
3. AT that requires a paid license that are widely adopted + browser combinations that are widely adopted for that AT.
4. AT that is widely adopted and has published documentation of supported combinations.

The phrase 'widely adopted' for core AT means that greater than or equal to 10% of respondents use it as their primary AT.

### Extended Combinations

Extended combinations include rarer AT/Browser combinations but is limited to major AT and major browsers.

Major AT is defined as AT that is either built into operating systems or survey data shows at least 10% usage. Major browsers are defined as Google Chrome, Edge, Firefox, Internet Explorer, and Safari.

### Survey Sources

For now, we base our data on the results of the latest

- [WebAim Screen Reader Survey](https://webaim.org/projects/screenreadersurvey8/).
- [UK.gov AT Survey](https://accessibility.blog.gov.uk/2016/11/01/results-of-the-2016-gov-uk-assistive-technology-survey/)

## Who runs this?

The community both runs and owns this project. The original idea and prototype was developed by Michael Fairchild with encouragement from the web development community at the University of Nebraska - Lincoln. The data and software are open sourced under the [GPL 3.0 license](https://github.com/accessibilitysupported/a11ysupport.io/blob/master/LICENSE).

## What are the levels of support?

There are several levels of support.

For a given support point (specific to a test):

- u = unknown
- n = no support
- y = full support
- p = partial support (unusual)
- na = not applicable

For a test or feature:

- Full support (all core support points are fully supported across all tests)
- Some support (some core support points are fully supported across all tests)
- No support (no core support points are fully supported across all tests)
- Unknown (all core support points are unknown)

## What are expectations?

Expectations are conditions that must be met for the feature to be considered as "supported". Only "MUST" expectations need to be met for minimal "support". "SHOULD" and "MAY" expectations indicates support which goes above and beyond. Note that there is not an explicit standard which dictates these expectations, and as such, they are likely opinionated. As such, a feature might not meet all "MUST" expectations but still be usable (potentially frustratingly so). Additionally, the assistive technology may provide many commands to read, navigate, or otherwise interact with a feature. Only one command is required to pass for the expectation to be minimally supported in some situations.
