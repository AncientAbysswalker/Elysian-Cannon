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

The implementation at the moment is an implementation of React running on top of an Electron Application.

The current build is still very early in development, but the standard requirements above are able to be met.

Most recent progress has been made in the implementation of loading an unspecified number of applets along with their states.

The following are points of current active testing and development:

* Dynamically load components depending on user preferences
* Dynamically load modules containing methods for each component definition
* Implement settings dialog table to control applets

## Status

This is an active development project for me, and I will be continually updating this.

The following are videos showing example functionality as development progresses:

* [Video 1](https://github.com/AncientAbysswalker/Elysian-Cannon/blob/master/md/react-electron-menu.mp4)
* [Video 2](https://github.com/AncientAbysswalker/Elysian-Cannon/blob/master/md/2020-04-19.mkv)

The most recent build appears as follows:

![](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/2020-05-14.png)
