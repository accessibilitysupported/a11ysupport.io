# FAQ

* [What is this?](#what-is-this%3F)
* [How should I interpret results? How do I know if it's okay to use a feature?](#how-should-i-interpret-results%3F-how-do-i-know-if-it's-okay-to-use-a-feature%3F)
* [How do I get bugs fixed?](#how-do-i-get-bugs-fixed%3F)
* [What is the status of this project?](#what-is-the-status-of-this-project%3F)
* [Can't this be automated?](#cant-this-be-automated%3F)
* [What Assistive Technologies are in scope?](#what-assistive-technologies-are-in-scope%3F)
* [Who runs this?](#who-runs-this%3F)
* [What are the levels of support?](#what-are-the-levels-of-support%3F)
* [What are expectations?](#what-are-expectations%3F)

## What is this?

This is a community-driven website that aims to help inform developers about what is [accessibility supported](https://www.w3.org/TR/WCAG/#cc4). In order to conform to WCAG, you must write code in ways that are supported by assistive technologies (such as screen readers).

Our goal is not to tell you what you can or cannot use, but to help you make informed decisions. For example, you may be able to use unsupported features in a way that does not negatively affect AT interaction.

We also hope to help developers learn how to test with assistive technologies. To accomplish this, we will provide introductory materials on how to use different assistive technologies and provide detailed instructions about how to perform tests. We also hope to run workshops at developer conferences.

There are some other projects that are similar to this, however, most of them:

- Are closed sourced (no contributions)
- Do not cover all the common AT
- Do not disclose exactly how tests should be performed
- Only tests a specific technology (or a subset of that technology)
- Only tests the accessibility API layer, not the end result of the AT

## How should I interpret results? How do I know if it's okay to use a feature?

Interpreting results can be fairly complex, so here are some general suggestions:

- In short, the goal of this site isn't to say 'use this', 'don't use this', or 'use a hack here'. Instead, it's here to help folks make informed decisions and reduce the amount of manual research that needs to happen to make good decisions.
- Just because a feature is marked as supported in this project doesn't mean that it will be supported in all situations. Remember that we are testing against specific implementations. While we try to keep the tests as representative as possible, they might not match your specific implementation, and the context in which a code feature is used can mean the difference between good support and a blocker. Be sure to test your specific implementations.
- Just because something is marked as not having any known support does not necessarily mean there will be negative consequences for using it. It might be okay to use a feature that has poor accessibility support if doing so will not result in any barriers, or if a work-around is used.
- Be careful when using features that are listed as having partial support. Partial support might mean that specific aspects of a feature are not supported or that certain assistive technology commands do not work as expected.
- Understand that this is a project of user-contributed data. As such it may not always be the most up to date resource and may not always be accurate. We do our best to validate contributions and ensure a high level of quality, but mistakes do happen, and technology rapidly changes.
- The best way to determine how well your code works for people with disabilities is to test your code with people with disabilities.
- Be sure you conform to [WCAG 2.x level AA](https://www.w3.org/WAI/WCAG21/quickref/) and strive to meet the [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- It's not always clear who is responsible for fixing a support bug. This might be you, as a developer. Or it might be an issue with the browser, the assistive technology, the operating system, or another part of the technology stack.
- WCAG has a [normative accessibility supported conformance requirement]((https://www.w3.org/TR/WCAG/#cc4)). It basically says that if a feature is relied upon to meet a given SC, that feature must be supported by AT. WCAG makes this very unclear by purposefully not defining exactly which AT need to be supported or at what level the support needs to be at. Instead, this decision needs to be made on a case by case basis and within the context of your project and who will be using it.
- It might be helpful to look at this from the perspective of an end user. If something isn't working, end users are not likely to think "oh, that's an issue with my screen reader or browser and not the site that I'm using. I'm fine with it not working."
- The question of whether or not a developer should address the support gap needs to be decided on a case-by-case basis. There are a lot of factors at play here. For example:
  - It might be possible to change the design slightly so that the feature isn't relied upon to meet any specific WCAG SC.
  - It might be possible to use a pre-written polyfill to fix the issue.
  - The context in which the feature is used on a site might make the issue more or less severe.
  - It might be possible to use a different feature to accomplish the same task in a different way that yields more robust support without affecting the design.
  - It might be reasonable to use the feature as is and wait for better support if there are no sufficient alternatives.
  - If the site is used in a closed environment, such as a corporate network, AT/browsers might be restricted and issues with other AT/browsers might not be relevant.

## How do I get bugs fixed?

It's not always easy to tell who is responsible for fixing a bug. If you can find the root cause and, please report it to the appropriate assistive technology or browser. To do this:

1. Find the root cause and who is responsible for fixing it (assistive technology or browser). If you can't tell, [open an issue in this project](https://github.com/accessibilitysupported/a11ysupport.io/issues) for help.
2. Find out if the bug has already been reported. Where to look:
   * Search for the feature in this project. We try to list links to known bugs for each feature. These can be found under the "Related issues, discussions, and bugs" heading on each feature page.
   * Look in relevant bug trackers and look at the relevant feature pages in this project.
3. If you can't find an existing bug report, go ahead and report it.
4. If you have a URL to the bug report, [open an issue in this project](https://github.com/accessibilitysupported/a11ysupport.io/issues) and let us know about the bug report. We can link to it from the relevant feature page to make it easier for people to find the bug report in the future.

### Report issues with assistive technologies: 

- Apple products (VoiceOver and Voice Control):
  - Apple doesn't have a public issue tracker, but you can report issues by sending an email to [accessibility@apple.com](mailto:accessibility@apple.com).
- Dragon Naturally Speaking:
  - Dragon does not have a public issue tracker, but you can report issues by contacting [Dragon support](https://nuance.com/support.html?source=support#dr_support_contact).
- JAWS:
  - [JAWS issue tracker](https://github.com/FreedomScientific/VFO-standards-support)
  - [JAWS support](https://support.freedomscientific.com/support)
- Narrator:
  - Press Narrator key + Alt + F with Narrator running to open a Narrator issue. Press Windows key + F to open the Feedback Hub, and search for "narrator" to see existing issues.
- [NVDA issue tracker](https://github.com/nvaccess/nvda/issues)
- [Orca issue tracker](https://gitlab.gnome.org/GNOME/orca/-/issues)
- TalkBack:
  - Talkback does not have a public issue tracker, but you can report issues by sending [feedback to Google](https://www.google.com/accessibility/get-in-touch.html).

### Report issues with browsers:

- [Edge issue tracker](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/)
- [Firefox issue tracker](https://bugzilla.mozilla.org/)
- [Google Chrome issue tracker](https://www.chromium.org/for-testers/bug-reporting-guidelines)
- [Safari issue tracker](https://bugreport.apple.com/web/)
  
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

For specific commands:

- unknown
- pass
- fail
- partial
- not applicable

For expectations:

- unknown
- supported/yes
- none
- partial
- not applicable


**Important**: Failing results such as "fail" or "none" just means that there is no known/documented support. There may still be support for this expectation, but it is undocumented. If this is the case, please report this issue.

There are also two grading methods:

- Any: Any command listed must pass for the expectation to be met. This is the default grading method and used for most expectations.
- All: All commands listed must pass for the expectation to be met.

## What are expectations?

Expectations are conditions that must be met for the feature to be considered as "supported". Only "MUST" expectations need to be met for minimal "support". "SHOULD" and "MAY" expectations indicates support which goes above and beyond. Note that there is not an explicit standard which dictates these expectations, and as such, they are likely opinionated. As such, a feature might not meet all "MUST" expectations but still be usable (potentially frustratingly so). Additionally, the assistive technology may provide many commands to read, navigate, or otherwise interact with a feature. Only one command is usually required to pass for the expectation to be minimally supported.

**Important**: This website is not normative and does not attempt to establish a standard for how assistive technologies (such as screen readers) must behave or dictate how assistive technologies must provide support (no such standard exists). It should not be used as the only source for determining if something is supported. Instead, it is meant to help visitors get a head start in understanding behaviors, general expectations, and support.

## What about expectations that are not directly testable by users?

There may be expectations for features that are not listed on this site. Some of these expectations are not directly testable by end-users. Wherever possible, we try to highlight which features have these expectations in our support listings. As a general rule of thumb, if the specification for the language being used requires the use of a feature, then use it (even if it appears to have poor support in our listings).

Take [aria-controls](https://www.w3.org/TR/wai-aria-1.2/#aria-controls) as an example. As of writing, the attribute generally has poor support for user-facing expectations. However, it is still a required attribute for the [combobox role](https://www.w3.org/TR/wai-aria-1.2/#combobox) and [scrollbar](https://www.w3.org/TR/wai-aria-1.2/#combobox) role. The attribute creates a programmatic relationship between the controlling element and the controlled element. This programmatic relationship helps assistive technologies correctly support the role as a whole. Without the explicit relationship defined by aria-controls, the assistive technology might have to guess what the proper relationship is. Most of the time, it will guess correctly and end-users won't notice anything is wrong. But this guessing comes at the potential cost of reliability and performance.
