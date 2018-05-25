## [Unreleased][unreleased]

## [3.1.0] - 2018-05-14

### Added
- `any` and `all` Handlebars helper functions ([#2021](https://github.com/adaptlearning/adapt_framework/issues/2021))
- `dir-rtl` and `dir-ltr` class gets added to index.html and updated when language changes ([#2033](https://github.com/adaptlearning/adapt_framework/issues/2033))
- `completed` class  added to menuView ([#2031](https://github.com/adaptlearning/adapt_framework/issues/2031))
- `Adapt.offlineStorage` can now store data when no handler has been defined ([#1981](https://github.com/adaptlearning/adapt_framework/issues/1981))

### Fixed
- Bad path separators in Grunt command ([#2025](https://github.com/adaptlearning/adapt_framework/issues/2025))
- `grunt help` now lists all the translate tasks ([#2057](https://github.com/adaptlearning/adapt_framework/issues/2057))
- Bug in `setActiveItem()` when no active item exists ([#2035](https://github.com/adaptlearning/adapt_framework/issues/2035))
- Tracking tasks now respect `--outputdir` ([#2006](https://github.com/adaptlearning/adapt_framework/issues/2006))

### Changed
- Unified LESS and JavaScript source maps ([#2009](https://github.com/adaptlearning/adapt_framework/issues/2009))
- Added `_completionCriteria` to sample course config.json (#2003)

### Removed
- `_isHiddenFromMenu` in favour of using pre-existing property `_isHidden` instead

## [3.0.0] - 2018-03-06

### Removed
- Support for legacy versions (8, 9, & 10) of Internet Explorer - as well as various settings, hacks, defensive code, libraries, font files & styling related to support for those browsers
- Some hacks related to backwards-compatibility with Adapt v1 ([#1708](https://github.com/adaptlearning/adapt_framework/issues/1708))

### Added
- An 'items collection' to provide a shared data model for components like Accordion or Narrative ([#1637](https://github.com/adaptlearning/adapt_framework/issues/1637))
- A 'build model' to show what was used to build the course when debugging ([#1683](https://github.com/adaptlearning/adapt_framework/issues/1683))
- Various functions to the core models in preparation for adding xAPI support ([#1523](https://github.com/adaptlearning/adapt_framework/issues/1523) & [#1710](https://github.com/adaptlearning/adapt_framework/issues/1710))
- New `Adapt.wait` API ([#1814](https://github.com/adaptlearning/adapt_framework/issues/1814))
- Support for 'subviews' of Notify ([#1840](https://github.com/adaptlearning/adapt_framework/issues/1840) & [#1892](https://github.com/adaptlearning/adapt_framework/issues/1892))
- A `completed` class to completed page/article/block/component elements ([#1888](https://github.com/adaptlearning/adapt_framework/issues/1888))
- Ability for question components to be able set a title for feedback (rather than displaying the question title) ([#1876](https://github.com/adaptlearning/adapt_framework/issues/1876))
- `preResize` and `postResize` events ([#1890](https://github.com/adaptlearning/adapt_framework/issues/1890))
- Access to all course data for handlebars templates ([#1906](https://github.com/adaptlearning/adapt_framework/issues/1906))
- Error output for the `grunt translate` task ([#1989](https://github.com/adaptlearning/adapt_framework/pull/1989))

### Changed
- Updates to the Grunt tasks - for a complete list of changes see the [GruntFile v3 Milestone](https://github.com/adaptlearning/adapt_framework/milestone/14?closed=1)
- Updates to Accessibility - for a complete list of changes see the [Accessibility v3 Milestone](https://github.com/adaptlearning/adapt_framework/milestone/15?closed=1)
- Various amends to the authoring tool schema files ([#1435](https://github.com/adaptlearning/adapt_framework/issues/1435), [#1694](https://github.com/adaptlearning/adapt_framework/issues/1694), [#1732](https://github.com/adaptlearning/adapt_framework/issues/1732), [#1984](https://github.com/adaptlearning/adapt_framework/issues/1984), [#1991](https://github.com/adaptlearning/adapt_framework/issues/1991), [#1993](https://github.com/adaptlearning/adapt_framework/issues/1993), [#1995](https://github.com/adaptlearning/adapt_framework/issues/1995))
- Updated JQuery from v2.2.3 to v3.3.1 ([#1303](https://github.com/adaptlearning/adapt_framework/issues/1303))
- Moved trickle's `jquery.resize` plugin and model functions into core ([#1576](https://github.com/adaptlearning/adapt_framework/issues/1576))
- Amended `offlineStorage` in preparation for the addition of xAPI support ([#1699](https://github.com/adaptlearning/adapt_framework/issues/1699))
- Moved course completion settings and logic out of the spoor plugin and into core in preparation for the addition of xAPI support ([#1700](https://github.com/adaptlearning/adapt_framework/issues/1700))
- Tidy up of router.js ([#1757](https://github.com/adaptlearning/adapt_framework/issues/1757))
- Amended `startController` to allow a class name as well as a selector ([#1843](https://github.com/adaptlearning/adapt_framework/issues/1843))
- Updated Modernizr to v3.5.0 ([#1934](https://github.com/adaptlearning/adapt_framework/issues/1934))


### Fixed
- In-course links in Notify content disable scrolling ([#1675](https://github.com/adaptlearning/adapt_framework/issues/1675))
- Issue with Drawer button sometimes being displayed when it shouldn't be ([#1817](https://github.com/adaptlearning/adapt_framework/issues/1817))
- `requireCompletionOf` functionality broken ([#1845](https://github.com/adaptlearning/adapt_framework/issues/1845))
- Issue with inview library not checking component visibility properly ([#1873](https://github.com/adaptlearning/adapt_framework/issues/1873))
- Issue with inview library's 'out of bounds' check ([#1881](https://github.com/adaptlearning/adapt_framework/issues/1881))
- `jquery.resize` overwriting `$(window).resize()` unnecessarily ([#1884](https://github.com/adaptlearning/adapt_framework/issues/1884))
- Empty title tag in index.html ([#1886](https://github.com/adaptlearning/adapt_framework/issues/1886))
- Standard Adapt event queue not firing on language change ([#1909](https://github.com/adaptlearning/adapt_framework/issues/1909))
- Issue with Drawer button disappearing when changing language ([#1917](https://github.com/adaptlearning/adapt_framework/issues/1917))

## [2.2.0] - 2017-08-02

Last version to include new features for legacy browsers, i.e. Internet Explorer 8, 9 and 10.   See [here](https://community.adaptlearning.org/mod/forum/discuss.php?d=1946) for more information.

### Added
- Added support for swipe events via JQuery Mobile (#1633)
- Added `_isHidden` property as a way of hiding views (#1605)
- Added support for ordering of Drawer items ([#1393](https://github.com/adaptlearning/adapt_framework/issues/1393))

### Changed
- Updated to latest `jquery.onscreen` library (#1594)
- Updated to latest `jquery.imageready` library (#1641)
- Changed Boolean inputs to Checkbox for authoring too ([#1380](https://github.com/adaptlearning/adapt_authoring/issues/1380))
- JSON and JavaScript files now minified via Grunt build process (#1634)

### Fixed
- `_isSubmitted` property added to QuestionModel defaults ([#1661](https://github.com/adaptlearning/adapt_framework/pull/1661))
- Issue introduced with circular routing fix (#1582) for circular routing control reset ([#1688](https://github.com/adaptlearning/adapt_framework/pull/1688))
- Grunt build process now follows symlinks (#1610)
- RTL courses now respect the vertical alignment of components (#1670)
- Tidy-up of Backbone.Collection to avoid stale binding and potential memory leaks (#1607)

## [2.1.3] - 2017-06-16

### Fixed
- circular routing control reset ([#1582](https://github.com/adaptlearning/adapt_framework/issues/1582))

## [2.1.2] - 2017-05-31

### Fixed
- grunt handlebars wasn't filtering correctly on Windows ([#1577](https://github.com/adaptlearning/adapt_framework/issues/1577))

## [2.1.1] - 2017-05-26

### Fixed
- `helpers.compile` wasn't passing through the correct context ([#1572](https://github.com/adaptlearning/adapt_framework/issues/1572))

## [2.1.0] - 2017-05-24

### Added
- allow json to include handlebars-style expressions; amend course description as a demonstration of how this works ([#1040](https://github.com/adaptlearning/adapt_framework/issues/1040))
- added new `itemsModel` to core code as part of the work to separate model code from the view code ([#1179](https://github.com/adaptlearning/adapt_framework/issues/1179))
- allow handlebars to reference view functions directly ([#1514](https://github.com/adaptlearning/adapt_framework/issues/1514))
- latest version of the imageReady library ([#1534](https://github.com/adaptlearning/adapt_framework/pull/1534))
  - refactored code to make it easier to read
  - adds speed improvements
  - fixes cache issues in Firefox and Chrome
  - stops it from waiting for missing images
  - now correctly reports timed-out images
  - fetches background images when no `<img>` tags are present 

### Fixed
- `adapt:initialize` being called before plugins have chance to complete aysnc ops during `app:dataReady` ([#1536](https://github.com/adaptlearning/adapt_framework/issues/1536))
- Accessibility JQuery plugin was stopping the [Select2 library](http://select2.github.io/) used in the [adapt-contrib-matching component](https://github.com/adaptlearning/adapt-contrib-matching) from making sure only one `<select>` control could be open at once ([#1541](https://github.com/adaptlearning/adapt_framework/issues/1541))
- Handlerbars `compile` helper wasn't able to handle String objects ([#1545](https://github.com/adaptlearning/adapt_framework/issues/1545))
- The Grunt handlebars compile task wasn't configured to follow 'symlinked' directories when expanding `**` patterns ([#1556](https://github.com/adaptlearning/adapt_framework/pull/1556))
- The properties of the `Adapt.device` object should be lowercase ([#1560](https://github.com/adaptlearning/adapt_framework/issues/1560))
- Problem with Grunt copy task for core fonts and assets ([#1564](https://github.com/adaptlearning/adapt_framework/issues/1564))
- Removed duplicate call to `app:dataLoaded` ([#1532](https://github.com/adaptlearning/adapt_framework/issues/1532))
- Scrolling on mobile iOS triggering `device:resize` events ([#1561](https://github.com/adaptlearning/adapt_framework/issues/1561))


### Changed
- Moved navigation bar outside of the `.wrapper` div in preparation for improvements to behaviour of Adapt inside iframes/framesets on iOS ([#1521](https://github.com/adaptlearning/adapt_framework/issues/1521))
- Link in course body so that it reads 'Find out more here' instead of showing the underlying URL ([#1477](https://github.com/adaptlearning/adapt_framework/issues/1477)) 
- Amended `adaptModel.setupChildListeners` to listen only to immediate children ([#695](https://github.com/adaptlearning/adapt_framework/issues/695))
- Set accessibility to be disabled on 'touch' devices by default; added a new config setting - `_accessibility._isEnabledOnTouchDevices` - to allow it to be enabled when required ([#1519](https://github.com/adaptlearning/adapt_framework/issues/1519)) 

## [2.0.19] - 2017-04-10

### Added
- 'ie' class for Internet Explorer 10 and 11  ([#1504](https://github.com/adaptlearning/adapt_framework/issues/1504))

### Fixed
- Adapt.offlineStorage not setting ready without Spoor ([#1510](https://github.com/adaptlearning/adapt_framework/issues/1510))
- Bad references corrected in JavaScript files ([#1517](https://github.com/adaptlearning/adapt_framework/issues/1517))

### Changed
- devDependencies to dependencies in package.json ([#1507](https://github.com/adaptlearning/adapt_framework/pull/1507))

## [2.0.18] - 2017-03-31

### Added
- new `diff` Grunt task to allow for a very quick, developer-friendly, rebuild ([#1233](https://github.com/adaptlearning/adapt_framework/issues/1233))
- new `Backbone.Controller` API ([#1438](https://github.com/adaptlearning/adapt_framework/issues/1438))
- ability to add attributes to the Notify popup ([#1453](https://github.com/adaptlearning/adapt_framework/pull/1453)) as part of work to indicate which plugin invoked Tutor ([#1427](https://github.com/adaptlearning/adapt_framework/issues/1427))
- various amends to add support for the new 'suppress marking/feedback' feature in a future release of [adapt-contrib-assessment](https://github.com/adaptlearning/adapt-contrib-assessment) ([#1291](https://github.com/adaptlearning/adapt_framework/issues/1291))
- `_requireAssessmentPassed` setting to the `_assessment` configuration in articles.json ([#1446](https://github.com/adaptlearning/adapt_framework/issues/1446))
- a `notify` class to the `<html>` element whenever a Notify popup is open ([#1489](https://github.com/adaptlearning/adapt_framework/issues/1489))
- 17 new icons to the vanilla font ([#1498](https://github.com/adaptlearning/adapt_framework/issues/1498))
- support for passing CSS classes into Notify 'Push' popups ([#1496](https://github.com/adaptlearning/adapt_framework/issues/1496))

### Fixed
- course.model.schema used old names for `accessibilityToggleTextOn` and `accessibilityToggleTextOff` ([#1450](https://github.com/adaptlearning/adapt_framework/issues/1450))
- version classes being added to the `<html>` element didn't use valid CSS class names ([#1402](https://github.com/adaptlearning/adapt_framework/issues/1402))
- accessibility library was preventing the use of the spacebar in `<div>`s with the `contenteditable` attribute ([#1470](https://github.com/adaptlearning/adapt_framework/issues/1470))
- various issues in the router module ([#1458](https://github.com/adaptlearning/adapt_framework/issues/1458), [#1472](https://github.com/adaptlearning/adapt_framework/issues/1472))
- Grunt tasks flattening structure of plugin assets folder ([#1463](https://github.com/adaptlearning/adapt_framework/issues/1463))
- prevent start controller from adding the the browser history when redirecting to the start page ([#1484](https://github.com/adaptlearning/adapt_framework/issues/1484))

### Changed
- Converted instances of 'magic strings' over to the new `ENUM` type added in [2.0.17] ([#1440](https://github.com/adaptlearning/adapt_framework/issues/1440), [#1483](https://github.com/adaptlearning/adapt_framework/pull/1483))
- Stopped the Grunt tasks from minifying config.json and course.json ([#1461](https://github.com/adaptlearning/adapt_framework/issues/1461))
- Better segregation of the `copy` and `watch` Grunt tasks ([#1000](https://github.com/adaptlearning/adapt_framework/pull/1000))

## [2.0.17] - 2017-02-28

### Added
- a button that, when accessibility is active, gives the user the ability to skip over navigation elements and straight into the content [#1388](https://github.com/adaptlearning/adapt_framework/issues/1388)
- logging module to allow for logging via `Adapt.log` (rather than `console.log`), this allows for several different levels of logging (debug/info/warn/error/fatal) as well as allowing for control over level of logging via config.json as well as allowing for creation of error reporting plugins that can hook into the logging module. Started using new logging module in app.js [#1399](https://github.com/adaptlearning/adapt_framework/issues/1399)
- support for enumeration (ENUMs) so that we can stop using 'magic strings' and 'magic numbers' within the code and use proper datatypes instead [#1429](https://github.com/adaptlearning/adapt_framework/issues/1429)

### Fixed
- The `$ grunt server` command sometimes wouldn't open the course in the browser on Windows [#1227](https://github.com/adaptlearning/adapt_framework/issues/1227)
- sporadic issue with scrolling to components (via Page Level Progress, for example) where the component would be scrolled to the vertical centre of the viewport as opposed to the top [#1400](https://github.com/adaptlearning/adapt_framework/pull/1400)

### Changed
- formatting & syntax tidy up of some of the core code [#1436](https://github.com/adaptlearning/adapt_framework/pull/1436)
- various amends to the default course content that is contained in the framework .json following feedback from our QA team [#1411](https://github.com/adaptlearning/adapt_framework/pull/1411)

## [2.0.16] - 2017-01-20

### Added
- functionality to add CSS classes to elements when they are in the viewport ([#1100](https://github.com/adaptlearning/adapt_framework/issues/1100))
- `screenHeight`, `orientation` and `aspectRatio` properties to `Adapt.device` ([#1331](https://github.com/adaptlearning/adapt_framework/issues/1331))
- option to disable automatic switching-on of accessibility on touch devices ([#1370](https://github.com/adaptlearning/adapt_framework/issues/1370))
- ES5 shim for IE8 ([#1346](https://github.com/adaptlearning/adapt_framework/pull/1346))
- `getAvailableChildren` to adaptModel ([#1373](https://github.com/adaptlearning/adapt_framework/issues/1373))
- `text-to-speech` class to the `html` when `_isTextProcessorEnabled` is `true` ([#1384](https://github.com/adaptlearning/adapt_framework/issues/1384))
- a `data-adapt-id` attribute to the HTML for pages, menus, articles, blocks + components ([#1380](https://github.com/adaptlearning/adapt_framework/issues/1380))
- allow plugins to interrupt course initialisation/routing, allowing for better performance in IE8 ([#1107](https://github.com/adaptlearning/adapt_framework/issues/1107))

### Updated
- inview/jquery.onscreen library ([#1302](https://github.com/adaptlearning/adapt_framework/issues/1302)); full list of changes [here](https://github.com/adaptlearning/jquery.onscreen/issues/6).
- Bowser library to v1.5.0 ([#1337](https://github.com/adaptlearning/adapt_framework/issues/1337))
- device.js to take advantage of new Bowser features ([#1349](https://github.com/adaptlearning/adapt_framework/pull/1349))
- Handlebars compile helpers to allow them to take `undefined` and to allow specified context ([#1347](https://github.com/adaptlearning/adapt_framework/issues/1347))

### Fixed
- Hide the 'home' button in the navigation when at the top level of the course structure ([#1315](https://github.com/adaptlearning/adapt_framework/issues/1315))
- XML substitutions are not replaced when building an xAPI course from the Adapt Authoring Tool ([#1324](https://github.com/adaptlearning/adapt_framework/issues/1324))
- Locking not taking into account availability of children ([#1373](https://github.com/adaptlearning/adapt_framework/issues/1373))

## [2.0.15] - 2016-11-14
### Added
- `preRemove` and `postRemove` events

### Fixed
- Inview not accounting for visibility and display none in change comparisons (#1299)
- Resources drawer appearing when changing language (#1295)
- Performance issue in authoring tool with Grunt copyMain task(#1312)

## [2.0.14] - 2016-10-18
### Added
- support for multilanguage/course localisation.

## [2.0.13] - 2016-10-17
### Added
- accessibility icon (part of [#1182](https://github.com/adaptlearning/adapt_framework/issues/1182))

### Changed
- removed underscore from accessibility toggle button labels ([#1139](https://github.com/adaptlearning/adapt_framework/issues/1139))
- removed `durationLabel` from contentObjects.json as it hasn't been required since v2.0.3 of boxmenu ([#1148](https://github.com/adaptlearning/adapt_framework/issues/1148))
- amends to JavaScript compilation to make it faster ([#1228](https://github.com/adaptlearning/adapt_framework/issues/1228))

### Fixed
- accessibility toggle button has no state ([#1172](https://github.com/adaptlearning/adapt_framework/issues/1172))
- tracking ids grunt task only working in 'en' folders ([#370](https://github.com/adaptlearning/adapt_framework/issues/370))
- accessibility causing PLP scroll to jump down the page after scrolling to component ([#1241](https://github.com/adaptlearning/adapt_framework/issues/1241))
- changing screen sizes in theme.json not persisted when running watch ([#752](https://github.com/adaptlearning/adapt_framework/issues/752))

## [2.0.12] - 2016-08-22
### Added
- Accessibility-specific handlebars helpers ([#1051](https://github.com/adaptlearning/adapt_framework/issues/1051))

### Changed
- Various changes relating to ongoing work to allow Adapt to load and function even when no theme is installed ([#953](https://github.com/adaptlearning/adapt_framework/issues/953))

### Fixed
- Issue with partially correct feedback not showing for adapt-contrib-matching component ([#1187](https://github.com/adaptlearning/adapt_framework/issues/1187))
- Ongoing issue with correctly detecting screen width on iOS devices ([#1096](https://github.com/adaptlearning/adapt_framework/issues/1096))

## [2.0.11] - 2016-07-26
### Added
- global text support ([#1049](https://github.com/adaptlearning/adapt_framework/issues/1049))
- abstract implementation of `onSubmitted` to allow question component plugins to extend this in the same way they can for `onCannotSubmit` ([#1124](https://github.com/adaptlearning/adapt_framework/issues/1124))
- ability to completely hide the feedback button ([#1073](https://github.com/adaptlearning/adapt_framework/issues/1073))

### Changed
- standardised handlebars helper names ([#1049](https://github.com/adaptlearning/adapt_framework/issues/1049))
- updated core libraries and npm modules to more recent versions ([#1061](https://github.com/adaptlearning/adapt_framework/pull/1061))
- allow Drawer to be closed by Esc keypress when accessibility is not active ([#938](https://github.com/adaptlearning/adapt_framework/issues/938))
- different method of calculating screen width for better compatibility with iOS ([#1096](https://github.com/adaptlearning/adapt_framework/issues/1096))
- various changes in preparation for the language picker functionality ([#1120](https://github.com/adaptlearning/adapt_framework/issues/1120))
- various changes in preparation for moving `_canShowMarking` into core code ([#1046](https://github.com/adaptlearning/adapt_framework/issues/1046))
- Allow user to be prevented from navigating to the menu using the browser's back button when the start controller is active ([#1037](https://github.com/adaptlearning/adapt_framework/issues/1037) & [#1152](https://github.com/adaptlearning/adapt_framework/issues/1152))

### Fixed
- accessibility library occasionally throwing error 'Could not find the next focusable element' ([#1015](https://github.com/adaptlearning/adapt_framework/issues/1015))
- using the `navigateToHomeRoute` function causing the page to jump to the top ([#1079](https://github.com/adaptlearning/adapt_framework/issues/1079))
- tabindex being incorrectly applied to a11y-hideable elements ([#1093](https://github.com/adaptlearning/adapt_framework/issues/1093))
- default values not being copied into course.json from schema files ([#991](https://github.com/adaptlearning/adapt_framework/issues/991))
- global properties in course.json out-of-date/inconsistent ([#1136](https://github.com/adaptlearning/adapt_framework/pull/1136))
- bug with question marking introduced in v2.0.10 ([#1114](https://github.com/adaptlearning/adapt_framework/issues/1114))

## [2.0.10] - 2016-05-09

### Changed
- enhancement-967: questionView model code > questionModel ([#981](https://github.com/adaptlearning/adapt_framework/pull/981))
- change issues link from Jira to Github 

### Fixed
- issue-1047: downgrade less library ([#1047](https://github.com/adaptlearning/adapt_framework/pull/1047))


## [2.0.9] - 2016-03-27

### Added
- new 'locking' feature enables course authors to lock parts of the course until other parts have been completed ([#905](https://github.com/adaptlearning/adapt_framework/issues/905)). Documentation for this feature can be found [here](https://github.com/adaptlearning/adapt_framework/wiki/Locking-objects-with-'_isLocked'-and-'_lockType'). Note that locking needs to be supported in the menu plugin you are using - support for this has been added to adapt-contrib-boxmenu in [v2.0.4](https://github.com/adaptlearning/adapt-contrib-boxmenu/releases/tag/v2.0.4) 
- new 'notify:cancelled' event added ([#1009](https://github.com/adaptlearning/adapt_framework/issues/1009))

### Changed
- various amends to the default content that bring it in line with changes to some of the core plugins, such as:
  - added `_isEnabled` property to `_resources` object in course.json
  - added `_useClosedCaptions`, `_allowFullscreen` and `cc` to the media component in components.json
  - added an example .vtt captions file to the video folder
  - removed `instruction` from the `_globals` object in course.json ([#1031](https://github.com/adaptlearning/adapt_framework/issues/1031))

### Fixed
- Leaving out the `_classes` property would cause a class of "undefined" to be added to the class list ([#804](https://github.com/adaptlearning/adapt_framework/issues/804))
- Intermittent error in the Grunt 'replace' tasks for authoring tool users ([#1021](https://github.com/adaptlearning/adapt_framework/issues/1021))
- Temporary workaround for some LESS variables not being defined in the core theme ([#1006](https://github.com/adaptlearning/adapt_framework/issues/1006)) 

## [2.0.8] - 2016-03-21

### Added
- New documentation for [config.json](https://github.com/adaptlearning/adapt_framework/wiki/Configure-your-project-with-config.json) and [course.json](https://github.com/adaptlearning/adapt_framework/wiki/Content-starts-with-course.json)
- New 'start controller' functionality to allow for single page courses and start pages ([#906](https://github.com/adaptlearning/adapt_framework/issues/906))
- New property 'requireCompletionOf' to allow for author to specify how many components in a block need to be completed in order for the block to be completed ([#910](https://github.com/adaptlearning/adapt_framework/issues/910))
- Added support to for string substitution in XML files for the `grunt dev`, `build` and `server-build` tasks ([#939](https://github.com/adaptlearning/adapt_framework/issues/939))
- Added questionModel and component models, move model behaviour from views into relevant models([#925](https://github.com/adaptlearning/adapt_framework/issues/925))

### Changed
- Updates to index.html to remove invalid/unnecessary markup ([#997](https://github.com/adaptlearning/adapt_framework/issues/997))
- Better error message for when components.json references a component that isn't installed ([#974](https://github.com/adaptlearning/adapt_framework/issues/974))
- port number can now be passed as an optional parameter to the `grunt server` task ([#917](https://github.com/adaptlearning/adapt_framework/issues/917))
- remove requirejs `coreJS` and `coreViews` mappings ([#929](https://github.com/adaptlearning/adapt_framework/issues/929))


### Fixed
- JQuery not always loading fast enough ([#579](https://github.com/adaptlearning/adapt_framework/issues/579))
- Component "left" and "right" layout getting ignored on mobile when JSON does not match order ([#636](https://github.com/adaptlearning/adapt_framework/issues/636) and [#985](https://github.com/adaptlearning/adapt_framework/issues/985))
- Issues with the inview library that would sometimes prevent components with 'inview' completion from being marked as completed ([#956](https://github.com/adaptlearning/adapt_framework/pull/956))
- function `navigateToParent` in router.js wasn't checking `_canNavigate` ([#961](https://github.com/adaptlearning/adapt_framework/issues/961))
- ordered list items weren't included in reset.less ([#960](https://github.com/adaptlearning/adapt_framework/pull/960))
- completion cascade not happening the right order ([#927](https://github.com/adaptlearning/adapt_framework/issues/927))

## [2.0.7] - 2016-02-08

### Added
- New `getParents` helper function (returns an array where [0] = first parent and [x] = last parent)
- New `getPath` helper function (returns an array from [0] = current model and [x] = last parent)
- `esc` button now closes Notify popup (when a11y is off)

### Changed
- Lots of improvements to the grunt build process:
  - All configs has been split into separate files per task (see [`grunt/config`](https://github.com/adaptlearning/adapt_framework/tree/master/grunt/config) - uses [load-grunt-config](https://github.com/firstandthird/load-grunt-config))
  - All Tasks have been split into separate files (see [`grunt/tasks`](https://github.com/adaptlearning/adapt_framework/tree/master/grunt/tasks))
  - Everything is now loaded asynchronously as and when it's needed (using [jit-grunt](https://www.npmjs.com/package/jit-grunt))
  - New custom Javascript compiler:
    - No more bundle files (i.e. `components.js`/`extensions.js`/`menu.js`/`theme.js`)
    - Uses requirejs node module directly (no more grunt-contrib-requirejs)
  - New custom LESS compiler...**with sourcemaps!**
  - Removed a number of dependencies on grunt/npm plugins:
    - `adapt-grunt-tracking-ids` is now implemented directly in [tracking-insert](https://github.com/adaptlearning/adapt_framework/blob/master/grunt/tasks/tracking-insert.js), [tracking-remove](https://github.com/adaptlearning/adapt_framework/blob/master/grunt/tasks/tracking-remove.js) and [tracking-reset](https://github.com/adaptlearning/adapt_framework/blob/master/grunt/tasks/tracking-reset.js)
    - assemble-less
    - bower
    - grunt-bower-requirejs
    - grunt-contrib-concat
    - grunt-contrib-less
    - grunt-contrib-requirejs
    - grunt-requirejs-bundle
    - lodash
    - matchdep
  - Added ability to include/exclude specific plugins (#723)
    - If **excludes** are specified, all plugins are included **excluding** those listed
    - If **includes** are specified, **only** those plugins listed will be included
    - If no includes/excludes are specified, all plugins are built, as before
  - Build folder cleaned before a new build to remove any lingering files
  - Added code style checking/enforcement using [jshint](https://github.com/gruntjs/grunt-contrib-jshint)/[jscs](https://github.com/jscs-dev/grunt-jscs)
  - Added ['time-grunt'](https://github.com/sindresorhus/time-grunt) to show execution time for tasks
- Minor course `.json` amends

### Fixed
- Accessibility:
  - Remove iOS select fix
  - Improved `onFocusCapture` to find next focusable component if cannot find any other.
  - Missing variable declararation, iOS
- `imageReady`: fixed background image checks
- We now defer any errors with bad plugins until after Adapt has loaded
- `_isOptional` setting no longer cascades to children (#923)


## [2.0.6] - 2015-12-02

### Fixed
- Cached images causing slow loading in IE9 (ABU-1147)
- Issue with `device:resize` events not having accurate screen size info
- Navigation click events not working unless the item clicked is a button element


## [2.0.5] - 2015-11-30

### Added
- Support for cross-domain requests (**in supported browsers** - for IE, this is only supported in 10+).
- Accessibility state now remembered across sessions (except on touch devices where it's always switched on)

### Changed
- If there's only one item in the drawer, it's now opened by default
- More descriptive error thrown when attempting to render a missing component (#721)
- Various amends to the default course `.json` files provided with the framework
- Improvements to the 'inview' library

### Fixed
- Lots of minor accessibility fixes
- Various router fixes


## [2.0.4] - 2015-10-30

### Added
- Support for tracking user's responses to SCORM's cmi.interactions
- `server-build`: add the option to create sourcemaps (https://github.com/adaptlearning/adapt_authoring/issues/811)

### Changed
- Update LESS variables to new v2 style
- Performance improvements
- Allow partly correct feedback to be optional in question screens
- Property locking system improved

### Fixed
- Various fixes for screenreader, keyboard & ios accessibility
- Ensure text labels are pulled through from 'globals' in course.json


## [2.0.3] - 2015-10-02
### Fixed
- Popup tab index save/restore [ABU-1075](https://adaptlearning.atlassian.net/browse/ABU-1075)


## [2.0.2] - 2015-09-28
### Added
- New button styles to base.less (#732, [ABU-1069](https://adaptlearning.atlassian.net/browse/ABU-1069))
- New `_spoor` property `_shouldStoreResponses` to config.json (#701)

### Changed
- Allow arrows keys to pass into input/select/textareas in a scroll-locked region (#738, [ABU-1071](https://adaptlearning.atlassian.net/browse/ABU-1071))
- Update licence in package.json (#724, #727)
- Ensure loading animation shown before views removed (#719)
- Amend Notify to use `.outerHeight` for more accurate vertical alignment (#716)
- Amend answer to c-140 (#705)
- Updates to the a11y and onscreen libraries (#696, #697)

### Removed
- Redundant labels from course.json

### Fixed
- Ensure the `remainingAttemptsText` and `remainingAttemptText` get pulled through from `_globals` (#745, #746)
- Restored the `navigateToHomeRoute` function (#743, #744)
- Fix aimed at keeping content centralised on screen to give context to surroundings (#742)
- Notify focus bug (#740)
- Hyperlink to the community site in README.md
- Missing Page Level Progress, Menu, Visited labels into course.json
- Bug fix for no/touch so the focus guard functions (#710)
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


[unreleased]: https://github.com/adaptlearning/adapt_framework/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/adaptlearning/adapt_framework/compare/v2.2.0...v3.0.0
[2.2.0]: https://github.com/adaptlearning/adapt_framework/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/adaptlearning/adapt_framework/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/adaptlearning/adapt_framework/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/adaptlearning/adapt_framework/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.19...v2.1.0
[2.0.19]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.18...v2.0.19
[2.0.18]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.17...v2.0.18
[2.0.17]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.16...v2.0.17
[2.0.16]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.15...v2.0.16
[2.0.15]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.14...v2.0.15
[2.0.14]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.13...v2.0.14
[2.0.13]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.12...v2.0.13
[2.0.12]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.11...v2.0.12
[2.0.11]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.10...v2.0.11
[2.0.10]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.9...v2.0.10
[2.0.9]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.8...v2.0.9
[2.0.8]: https://github.com/adaptlearning/adapt_framework/compare/v2.0.7...v2.0.8
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
