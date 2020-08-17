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

The application is built with the intent of supporting any number of applets, without caring about there implementation aside from a few common requirements. In order to do this, every applet instance and applet module is assigned an id in order to keep all of the data stored in an accessible manner.

Any given applet needs to have settings and memory of what the value of the settings are. While each applet may have internal settings variables there is also a number of variables that are common to all applets - such as position.

The application stores its memory regarding applet settings in a NeDB database. This memory is written to when changes are made to applet settings and read in at application startup, to restore the user's previous session.

#### Settings

All available settings for the current applets are available through the main settings dialog.

The current location of the applet is displayed on the main settings dialog, and the location can be updated directly.

![Position Settings](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/position.gif)

The current location of the applet can be highlighted in red, to assist in finding the applet.

![Highlight](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/highlight.gif)

Whether or not the applet can be dragged can be set, allowing the position of the applet to be locked.

![Draggable](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/draggable.gif)

An applet can be hidden. This retains the memory of the applet settings, but makes it so that the applet can no longer be seen.

![Hidden](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/ghost.gif)

When the applet has internal settings, they can be accessed and modified as part of a separate settings dialog.

![Unique Settings](https://raw.githubusercontent.com/AncientAbysswalker/Elysian-Cannon/master/md/unique_settings.gif)

## Status

The project is under active development

## Planned Features

The following are planned features moving forward into the next stages of development.

* Add handling so that the application main can detect if an applet would like to handle its settings dialog box itself
* Implement ability to load user-defined applets. This will allow users to write or download custom applets outside the standard applets offered by default
