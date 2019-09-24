# Voice Control for iOS

Voice Control for iOS is a voice control system that can be found in iOS 13 and greater.

There are 3 types of overlays that you can turn on.

* "show names" will turn on an overlay that displays the accessible name of every element on the screen. Users can then say "tap <name>" to tap one of the names.
* "show numbers" will turn on an overlay that displays a number for every element on the page. This is helpful when an element is missing a name, or if the user does not know how to pronounce a name.
* "show grid" will turn on an overlay that displays a numbered grid over the screen that allows the user to interact with parts of the screen that don't have names or numbers. For example, a user can zoom in on grid a grid number until it is large enough to cover an incorrectly coded icon button without a name or role, then pan the screen so that the number is over the button, and then say "tap <number>" to activate the button.

## Differences between Dragon

Both Dragon and Voice Control perform similar functions and are operated in similar ways. Users can operate the device by speaking commands like "click <name>" or "choose <number>" and dictating text when in an input. Both also offer the concept of a grid overlay to interact with parts of the screen that are missing roles and names. Some differences include:

* Dragon will let users interact with content by role, while Voice Control will not. For example, in Dragon users can say "click button" to flag each element with the button role on the page with a number, and then say "choose <number>".
* Voice Control will flag each element with the same name for disambiguation while Dragon will not. Dragon will simply click (or otherwise interact with) the first element of that name. 
* Voice Control offers overlays for names, numbers, and grid, while Dragon only offers an overlay for grid.

Because Voice Control only supports names and not roles, all expectations for roles are marked as "not applicable".

## Install

Voice Control is built in to iOS and you can enable it from your Settings app.

## Guides, Documentation, and resources

* [Apple documentation](https://support.apple.com/guide/iphone/voice-control-iph2c21a3c88/ios)
