There are few approaches to a schema for data collection

1. Group by assertions. This is where a user tests each assertion separately, even though there might be multiple assertions for the same element that is being tested.
    * Pros: We render data by assertion, not output. Different assertions for the same element might be tested with different commands. For example an assertion about the change of state being conveyed would likely be the result of a command to activate the element, but the name, role, and value should be conveyed when navigating to the element.
    * Cons: Results in the same output being manually recorded many times. More room for human error.
2. Group by output. This is where a user records the output of a command on a specific element, then marks the results for each applicable assertion.
    * Pros: More natural for a tester, perhaps quicker (although, output can be easily copied and pasted)
    * Cons: Would require a lot of refactoring in the build step, still need to manually associate applicable assertions, etc
3. Mix of the above
    * Pros: it might be possible to mix the approach above
    * Cons: more overhead in schema, testing, and build process to handle this approach
    
My current take away is that it isn't worth it to alter the schema. If we want to optimize the testing efficiency, we can do that in the UI, while maintaining the current schema.

