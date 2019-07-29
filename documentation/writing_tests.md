# Writing tests

Questions to be answered

1. [ ] What is the scope of a test? How many examples and assertions can be included?
2. [ ] What assertions should be included?
3. [ ] How do I set up a test?


## What is the scope of a test? How many examples and assertions can be included?

At a high level, there are two approaches for scoping tests (breadth and depth), which are discussed below.

1. A test that only assesses a single and highly specific example implementation (depth).
  * Pros: very granular, easy to tell exactly what went wrong and where, potentially easier to programmatically display results.
  * Cons: lots of overhead and potentially very time consuming, have to set up a new test case for each situation, and log results for each situation separately.
2. A test that includes many different examples and may include assertions from many different features (breadth).
  * Pros: quicker and easier to set up tests and collect high-level results, less tests to maintain.
  * Cons: harder for users to identify exactly which scenarios pass or fail

This project supports **both** approaches. Both might be appropriate in different situations.

**However, as a general rule of thumb, tests should be scoped to a single example**.

A single test SHOULD only include a single example implementation for each feature that is being tested. In other words, if a test is assessing the support of many different features, its okay to include those features in the same test. But if the test is assessing many different ways that a single feature could be coded, it is best to write different tests for those examples. This allows users to more easily identify which coding techniques for a given feature are supported and which are unsupported.