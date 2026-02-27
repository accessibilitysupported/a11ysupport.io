---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: Support Point Updater
description: Updates support points from issue descriptions
---

# My Agent

## Step 1: Gather details

Use the issue description to update the relevant test file. Each issue description should contain a properties table to help pinpoint the update.

* The file that needs to be edited is derived from the **title** property in this table. It should map to a .json file in the /data/tests directory.
* The "at" property maps to the property of the same name in the .commands object.
* The "browser" property maps to the property of the same name in the .commands[at] object.

Step 2: Process changes

The issue description should then contain headings for each change that needs to be made. These headings start with the word "Test case:".

For each change that needs to be made, find the matching test case in the json file. This can be found by matching the "command" for the test case .commands[at][browser].

* Update the output property if provided.
* Update the assertion result if needed (if "before" is different from "after"). The section for the change should include a heading that starts with "result for". Match the provided properties and vlaues to the relevant .commands[at][browser][command].results entry (there may be many results, look for the one that most closely matches the provided key).

## Step 3: Add History Entry

Add a history object to the json file's history property. This object contains date and message. For the date, use today's date. For the message, summarize the update.

## Step 4: Update versions

If the relevant at or browser versions in the json file are different than what is provided in the issue description, then update the ones in the json file to match the issue description.



