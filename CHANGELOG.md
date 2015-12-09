## [Unreleased][unreleased]
- Nothing!

## [2.0.8] - 2015-12-04
### Headline changes
- accessibility hotfix, remove iOS select fix
- accessibility hotfix, improved onFocusCapture to find next focusable component if cannot find any other.

## [2.0.7] - 2015-12-03
### Headline changes
- accessibility hotfix, missing variable declararation ios

## [2.0.6] - 2015-12-02
### Headline changes

- for very slow loading with courses that have cached images in IE9 ABU-1147
- device:resize events not having accurate screen size info
- navigation click events not working unless the item clicked is a button element

## [2.0.5] - 2015-11-30
### Headline changes:

- when there is only one item in the 'drawer', open that item by default
- added support in IE10 and above (and all other supported browsers) for cross domain requests, allowing course content to be loaded - from a CDN by adding <base href="/*CDN URL HERE*/"> to a locally hosted index.html
- many accessibility fixes
- accessibility state now remembered across sessions (except on touch devices where it's always switched on)
- better error on component not being installed (#721)
- various fixes to the default .json that is provided with the framework
- improvements to the 'inview' library
- fixes & improvements to router

## [2.0.4] - 2015-10-30
### Headline changes
- added support for tracking user's responses to SCORM's cmi.interactions
- update LESS variables to new v2 style
- various fixes for screenreader, keyboard & ios accessibility
- performance improvements
- allow partly correct feedback to be optional in question screens
- fixes to ensure text labels are pulled through from 'globals' in course.json
- server-build: add the option to create sourcemaps (https://github.com/adaptlearning/adapt_authoring/issues/811)
- improvements to the property locking system

## [2.0.3] - 2015-10-02
### Fixed
- fixed popup tab index save/restore [ABU-1075](https://adaptlearning.atlassian.net/browse/ABU-1075)

## [2.0.2] - 2015-09-28
### Added
- add new button styles to base.less (#732, [ABU-1069](https://adaptlearning.atlassian.net/browse/ABU-1069))
- add new `_spoor` property `_shouldStoreResponses` to config.json (#701)

### Changed
- allow arrows keys to pass into input/select/textareas in a scroll-locked region (#738, [ABU-1071](https://adaptlearning.atlassian.net/browse/ABU-1071))
- update licence in package.json (#724, #727)
- ensure loading animation shown before views removed (#719)
- amend Notify to use `.outerHeight` for more accurate vertical alignment (#716)
- amend answer to c-140 (#705)
- updates to the a11y and onscreen libraries (#696, #697)

### Removed
- remove redundant labels from course.json

### Fixed
- fix to ensure the `remainingAttemptsText` and `remainingAttemptText` get pulled through from `_globals` (#745, #746)
- restored the `navigateToHomeRoute` function (#743, #744)
- fix aimed at keeping content centralised on screen to give context to surroundings (#742)
- fix for Notify focus bug (#740)
- fix hyperlink to the community site in README.md
- add missing Page Level Progress, Menu, Visited labels into course.json
- bug fix for no/touch so the focus guard functions (#710)
- IE8 responsiveness hotfix (#703)

## [2.0.1] - 2015-08-04
### Fixed
- Added file .bowerrc back in; it is needed for the plugin registry system.

## [2.0.0] - 2015-08-03

This release is by far the biggest we’ve ever done; with the help of 17 contributors, the adapt_framework repository alone has seen over 420 commits, more than 6,400 additions and in excess of 13,400 deletions since we put out version 1.1.1.

As such, the changes are too numerous to mention here, but below are the highlights.

### Added
- Adapt is now fully keyboard *and* screenreader accessible, and conforms to WAI level AA web content accessibility guidelines.
- Adapt now supports right-to-left languages such as Arabic and Hebrew.
- Page level progress now has the option of adding progress bars for each item.
- Support added for `_isOptional`, which allows developers to exclude elements from course progress calculations. This option also integrates with spoor for highly-customisable component tracking.
- Improvements to code syntax
- In addition to SCORM-compliant LMS support, spoor now also allows for offline tracking.
- Accordion items can now contain images.
- The narrative navigation buttons can be configured to show in the display text box.
- Text input now allows for more flexible answer combinations; in addition to the option-specific answers, there is now the ability to specify generic answers which can be submitted in any order.
- The media component now has an in-line (HTML) transcript.
- adapt-cli now supports tags, to allow for installing of specific versions of plugins.
- **New components!**
  - Assessment results
- **New extensions!**
  - Bookmarking

### Changed
- Question component improvements:
  - Question interactions have been enhanced to allow for more control over how they are reset.
  - The ability to review previously viewed feedback.
  - The ability to display an overall mark (tick or cross) in addition to individual option marking.
  - The ability to toggle between ‘my answer’ and ‘model answer’
  - Randomisation of the order in which options are presented
- jQuery v2 is now used for IE9 and above.
- Complete rewrite of the inview library.
- Trickle has been completely overhauled with a number of bug-fixes and performance enhancements.
- All core libraries included with Adapt have been updated to their latest versions.
- The old assessment extension has been re-written, and now includes the following:
  - Multiple question banks offering configuration options such as:
    - Number of questions to be taken from a given bank.
    - Randomisation of presentation sequence.
  - Improved results feature providing configurable scoring bands, each with accompanying feedback text.
  - Scoring based on either a percentage or points based system.
- Complete restructure of the vanilla theme:
  - There is now a much more exhaustive list of self-descriptive variables to make it quicker and easier for those new to theming.
  - A theme-extras.less file containing more classes.
  - New attributes allow you to do more, for example:
    - _classes allows you to target specific menu items and page elements and apply styles.
    - `_backgroundColor` makes it easier to style individual block backgrounds.
  - Improvements to font management.

### Removed
- All repositories have been given a good spring clean, removing a lot redundant code and files.

### Fixed
- There are many performance improvements bundled in this release. The most significant being:
  - The removal of `_lockedAttributes`, which dealt a bit performance hit in older browsers.
  - More careful use of Underscore convenience methods, such as `forEach()`.
- Many bug fixes in the adapt-cli’s install utility.


## [1.1.3] - 2015-06-23

### Changed
- Slighty re-factored `getChildren()` to use comparator

### Fixed
- **636**: Corrects component `_layout` attribute issue.
- **628**: Added missing ‘id’ attribute to index.html


## [1.1.2] - 2015-06-02

### Added
- Added new `navigation:homeButton` event
- Grunt `build` process now allows for the use of a single menu/theme, rather than building all in `src`.
- Grunt process now allow for a custom output folder (for use with the authoring tool).

### Changed
- Velocity.js updated.

### Removed
- test folder removed.

### Fixed
- Various JSON amends.
- Check for `_canNavigate` on `navigateToHomeRoute`.
- **573**: bug in router navigateToParent() function when using nested pages.
- Added defensive programming to ensure `findDescendants()` and `getChildren()` fail silently.
- Bug with MCQ/GMCQ feedback to ensure correct type of feedback is returned.


## [1.1.1] - 2014-06-05

### Fixed
- **380**: Fixed location classes on the wrapper.
- **379**: Fixes issue with questionView not displaying marking properly.
- **377**: Fixes notFinal feedback not showing properly accross question components.
- **376**: Fixes issue with feedback title not showing on incorrect and partly correct answers.
- **374**: Fixes to model methods setting `_isReady` and `_isComplete`; now checks agains `_isAvailable`.


## [1.1.0] - 2014-05-28

### Added
- Drawer: a slide out panel for plugins like resources and pageLevelProgress to place their data.
- Notify: a core notification system that allows plugins to display four types of notifications (popups, prompts, alerts and push).
- PopupManager: a simple manager that tracks the user’s scroll position when a popup is triggered.
- Handlebars partials templates have been added for buttons and components.
- Menu progress bars.
- **New components!**
  - Slider
  - Confidence slider
  - Linked confidence slider
- **New extensions!**
  - Resources
  - Page-level progress

### Changed
- Updated all question components with the following:
  - Every core bundled question component now triggers a visual validation when a user interacts in the wrong way.
  - Feedback object in the JSON has been cleared up.
  - Triggers feedback event based upon lockedAttribute `_canShowFeedback` being true.
  - QuestionView now triggers an event even if `_canShowFeedback` is false.
  - QuestionModel now has `_isQuestionType:true` attached to the model to determine if the component is a question type.
- JSON notation standardised:
  - All JSON data now ‘_’ notation
  - Added instruction text and display title attributes.
- Navigation icons/buttons have been updated to work on smaller devices by increasing the hit area.
- The global `Adapt` object has been updated:
  - `Adapt.device` has been updated.
  - `Adapt.location` has been updated.
  - `Adapt.scrollTo` enables the page to scroll to an element.
  - `Adapt.navigateToElement` enables Adapt to route and then scroll to an element.
  - `lockedAttribute`s are used to mediate between plugins setting attributes on models.
  - `AdaptModel.getSiblings()` now allows a boolean argument to pass back the model who called this method.
- Router has been rewritten:
  - Now allows plugins to use the core router without having to create their own.
  - The ‘back’ button now works similar to the browser back
button.
- Performance enhancements:
  - Added velocity.js for animations.
  - Cleaned up model methods.
- Media component now has multiple completion criteria.
- Added component LESS classes to allow for better customisation.
- Tutor updates:
  - Now sits across the middle of the page ­ this is now easier to close.
  - Triggers popup manager and resizes based upon device
width and height.
- The vanilla theme now includes an extended list of variables.
- Functional LESS has been moved from the theme into core.

### Removed 
- Mediator has been replaced with `lockedAttributes`.


## [1.0.0] - 2014-02-18

The initial version of the Adapt framework.

### Added 
- Everything!


[unreleased]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.8...HEAD
[2.0.7]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.7...v2.0.8
[2.0.7]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.6...v2.0.7
[2.0.6]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/adaptlearning/adapt_framework/compare/v1.1.3...v2.0.0
[1.1.3]: https://github.com/adaptlearning/adapt_framework/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/adaptlearning/adapt_framework/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/adaptlearning/adapt_framework/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/adaptlearning/adapt_framework/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/adaptlearning/adapt_framework/tree/v1.0.0
