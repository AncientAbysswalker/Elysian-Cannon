# Elysian Cannon
> Screen Overlay Software

![Example Functionality](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/header.gif)

## Setup and Usage
A working demo can be found at the following for download:

https://github.com/AncientAbysswalker/Elysian-Cannon/tree/master/dist

The demo is an installer that will set up the base implementation of the overlay. The demo includes several of the functional components used for testing.

## Purpose
The purpose of this project is to implement a screen overlay tool utilizing modern web technologies. In a manner similar to what Rainmeter achieves, the goal is to be able to implement any number of various "applets" (functional components) on the screen. The primary difference, is to allow development of functional components utilizing the full suite of modern web tools.

## Criteria

In order for the tool to be successful and useful, the tool must allow the user to interface with the program, while not interfering with standard screen functionality. The following are requirements for this to be true:

* It should be possible to render the application as something other than a standard rectangular window
* The application must be able to pass-through clicks and dragging of files (and possibly other things) to not interfere with native screen activities
* It should be possible to drag parts of the application around - to rearrange the applets
* It should be possible to support multiple copies of an applet
* It should be possible to lock the location of an applet and to identify an applet (in case there are multiples)

## Implementation

>> Overview?

The backend is designed

The following video walks through the current functionality of the  at the moment is an implementation of React running on top of an Electron Application.

>> Settings storage and modification

>> Settings storage and modification

Most recent progress has been made in the implementation of loading an unspecified number of applets along with their states.

The following are points of current active testing and development:

* Dynamically load components depending on user preferences
* Dynamically load modules containing methods for each component definition
* Implement settings dialog table to control applets

## Status

The current build is still very early in development, but the standard requirements above are able to be met.

This is an active development project for me, and I will be continually updating this.

The following are videos showing example functionality as development progresses:

* [Video 1](https://github.com/AncientAbysswalker/Elysian-Cannon/blob/master/md/react-electron-menu.mp4)
* [Video 2](https://github.com/AncientAbysswalker/Elysian-Cannon/blob/master/md/2020-04-19.mkv)

The most recent build appears as follows:

![](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/2020-05-14.png)

## Planned Features

The following are planned features moving forward into the next stages of development.

* Add handling so that the application main can detect if an applet would like to handle its settings dialog box itself
* Implement ability to load user-defined applets. This will allow users to write or download custom applets outside the standard applets offered by default
