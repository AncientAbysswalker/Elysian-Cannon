# Elysian Cannon

## Working Demo
A working demo can be found at the following for download:

https://github.com/AncientAbysswalker/Elysian-Cannon/tree/master/dist

## Problem Statement
I used to play around with Rainmeter to make custom desktop skins and overlays. More recently I was considering the implementation of a similar desktop overlay with Electron JS.

The following are standard requirements for the project:

* It should be possible to render the application as something other than a standard rectangular window
* It should be possible to drag parts of the application around to rearrange the application(s)
* Parts of the application may need to be click-through enabled
* Application should not interfere with standard OS UI commands, like double or right clicking items on the desktop

## Implementation

The implementation at the moment is an implementation of React on top of the Electron Application.

The current build is still very early in development, but the standard requirements above are able to be met.

The following are points of current active testing and development:

* Persistent memory integration for states of loaded UI components using nedb
* Implement loading methods to inject intended state into components
* Dynamically load components depending on user preferences
* Dynamically load modules containing methods for each component definition

The following are videos showing example functionality as development progresses:

-
-
