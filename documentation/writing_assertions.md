# Writing Assertions

This document describes how to write assertions. What is described here is meant as a guideline to improve consistency with how assertions are written across features. However, exceptions might apply.

## The goal

Assertions should be as atomic as possible, yet be easy to read, understand, and test by someone who understands how a screen reader or voice control software works. There will always be a struggle between these different concerns, and the goal when writing assertions should be to optimize every factor. In some cases, it might be best to write an assertion so that it covers multiple aspects of support in order to increase testing efficiency.

When writing assertions, consider the following questions related to the audiences:

* Will the tester be able to efficiently perform tests and record results?
* Will a developer that is visiting a11ysupport.io be able to understand the results and which aspects of support are lacking support?
* Will an assistive technology developer be able to understand the problem and fix it?

## Common assertions

### convey_role_and_name

The name and role are two separate aspects of support, but must exist hand-in-hand for something to be considered supported. There may be some cases where one of the two aspects might be unsupported which would cause the assertion would fail. If output and/or good notes are taken, all audiences should be able to understand why the test failed.

Note that some roles don't require a name. In this situation, the role and name should be separate assertions.

### provide_shortcuts

Screen readers provide various keyboard shortcuts to list, jump, or otherwise navigate to different roles.

### convey_state

Because the state can change depending on user input, it should be listed as its own assertion.

### properties and states with enumerated values

Each possible value should be listed as its own assertion.

### properties and states with author defined values

A single assertion should be listed since it is impossible to list all possible values.
