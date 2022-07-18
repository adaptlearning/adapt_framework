## [5.20.2] - 2022-07-18
### Changed
* Core branch updated to v6.12.0

## [5.20.1] - 2022-07-06
### Changed
* Core branch updated to v6.11.0

### fixed
* Updated and added libraries (https://github.com/adaptlearning/adapt_framework/issues/3307)

## [5.20.0] - 2022-06-21
### Changed
* Core branch updated to v6.10.0

### Removed
* IE11 support (https://github.com/adaptlearning/adapt_framework/issues/3309)

### Added
* Ability to specify "course" directory (https://github.com/adaptlearning/adapt_framework/issues/3305)

## [5.19.6] - 2022-06-08
### Changed
* Core branch updated

## [5.19.5] - 2022-05-30
### Changed
* Core branch updated
* node modules updated (https://github.com/adaptlearning/adapt_framework/issues/3290)
* Bump grunt from 1.5.2 to 1.5.3 (https://github.com/adaptlearning/adapt_framework/pull/3304)

## [5.19.4] - 2022-05-23
### Changed
* Core branch updated
* Added missing assessment configurations (https://github.com/adaptlearning/adapt_framework/issues/3287)

## [5.19.3] - 2022-05-09
### Changed
* Core branch updated

## [5.19.2] - 2022-04-26
### Changed
* Core branch updated

## [5.19.1] - 2022-04-06
### Changed
* Core branch updated
* Highlight the Node requirements of the framework in the documentation (https://github.com/adaptlearning/adapt_framework/issues/3288)
* Bump minimist from 1.2.5 to 1.2.6 (https://github.com/adaptlearning/adapt_framework/pull/3286)
* Upgrade csv from 5.4.0 to 5.5.3 (https://github.com/adaptlearning/adapt_framework/pull/3272)

## [5.19.0] - 2022-03-14
### Changed
* Core branch updated
* Added --cachepath to grunt (Part of https://github.com/adaptlearning/adapt_framework/issues/3277)
* Fix for build.cachepath = null (Part of https://github.com/adaptlearning/adapt_framework/issues/3277)

## [5.18.8] - 2022-03-07
### Changed
* Core branch updated

## [5.18.7] - 2022-02-16
### Changed
* Core branch updated

## [5.18.6] - 2022-02-07
### Changed
* Core branch updated

## [5.18.5] - 2022-02-01
### Changed
* Core branch updated

## [5.18.4] - 2022-01-25
### Changed
* Core branch updated

## [5.18.3] - 2022-01-21
### Changed
* Core branch updated
* Default alt text updated (Part of https://github.com/adaptlearning/adapt_framework/issues/3171)
* Updated libraries (https://github.com/adaptlearning/adapt_framework/issues/3268)

## [5.18.2] - 2022-01-10
### Changed
* Core branch updated

## [5.18.1] - 2021-12-16
### Changed
* Core branch updated

## [5.18.0] - 2021-12-07
### Changed
* Core branch updated
* npm install on non-git src/core breaks (https://github.com/adaptlearning/adapt_framework/issues/3259)
* Better dev mode identification for client side (https://github.com/adaptlearning/adapt_framework/issues/3256)

## [5.17.7] - 2021-11-09
### Changed
* Core branch updated

## [5.17.6] - 2021-11-01
### Changed
* Issue with gitmodules.js path and branch (https://github.com/adaptlearning/adapt_framework/issues/3252)

## [5.17.5] - 2021-11-01
### Changed
* Core branch updated

## [5.17.4] - 2021-10-26
### Changed
* babel/core updated to 7.15.8 (https://github.com/adaptlearning/adapt_framework/issues/3251)
* Caniuse-lite out of date (https://github.com/adaptlearning/adapt_framework/issues/3251)
* Inherit link font size (https://github.com/adaptlearning/adapt_framework/issues/3243)

## [5.17.3] - 2021-10-22
### Changed
* Core branch updated (https://github.com/adaptlearning/adapt-contrib-core/issues/24)

## [5.17.2] - 2021-10-19
### Changed
* Core branch updated

## [5.17.1] - 2021-10-13
### Changed
* Core branch updated

## [5.17.0] - 2021-09-16
### Changed
* Move src/core to adapt-contrib-core (https://github.com/adaptlearning/adapt_framework/issues/3169)
* Allow ES to be published without support for IE11 (https://github.com/adaptlearning/adapt_framework/issues/3236)

### Fixed
* gitmodules.js fix for adapt-cli and adapt-contrib-core (https://github.com/adaptlearning/adapt_framework/issues/3232)

## [5.16.0] - 2021-08-23
### Added
* Support for authoring tool 1 (https://github.com/adaptlearning/adapt_framework/issues/2704)

## [5.15.5] - 2021-08-12
### Fixed
* Course would not load unless LanguagePicker extension was enabled ([#3224](https://github.com/adaptlearning/adapt_framework/issues/3224))

## [5.15.4] - 2021-08-09
### Fixed
* Bad `lang` param was loading course data twice ([#3220](https://github.com/adaptlearning/adapt_framework/issues/3220))

## [5.15.3] - 2021-08-06
### Fixed
* Libraries compilation bug ([#3208](https://github.com/adaptlearning/adapt_framework/issues/3208))
* Scroll on reset click ([#3211](https://github.com/adaptlearning/adapt_framework/issues/3211))
* `lang` param not bypassing Language Picker selection view ([#3218](https://github.com/adaptlearning/adapt_framework/issues/3218))

## [5.15.2] - 2021-07-07
### Fixed
* Scoring API missing `.model` on line 465 creating error ([#3195](https://github.com/adaptlearning/adapt_framework/issues/3195))

## [5.15.1] - 2021-07-06
### Fixed
* UMD module fixes broke nested require statements ([#3188](https://github.com/adaptlearning/adapt_framework/issues/3188))

## [5.15.0] - 2021-07-05
### Added
* Partly correct answer options and any correct answer option ([#3148](https://github.com/adaptlearning/adapt_framework/issues/3148))
* Scoring API ([#3163](https://github.com/adaptlearning/adapt_framework/issues/3163))
* Allow parse of @menu @page @article without offsets ([#3175](https://github.com/adaptlearning/adapt_framework/pull/3175))

### Changed
* Grunt: better cache invalidation on remove files ([#3184](https://github.com/adaptlearning/adapt_framework/issues/3184))

### Fixed
* Locking doesn't account for optional models ([#1486](https://github.com/adaptlearning/adapt_framework/issues/1486))
* Grunt: JavaScript newer config ignores JSX files ([#3173](https://github.com/adaptlearning/adapt_framework/issues/3173))
* Touch events broken ([#3178](https://github.com/adaptlearning/adapt_framework/issues/3178))
* typeof undefined with UMD modules ([#3180](https://github.com/adaptlearning/adapt_framework/issues/3180))

## [5.14.0] - 2021-06-15
### Added
* Libraries: allow switching between development and production versions ([#3151](https://github.com/adaptlearning/adapt_framework/issues/3151))

### Fixed
* Allow pure React components as Adapt components ([#3105](https://github.com/adaptlearning/adapt_framework/issues/3105))
* Headings lose focus if completed with focus ([#3132](https://github.com/adaptlearning/adapt_framework/issues/3132))
* Grunt doesn't warn of empty parents ([#3134](https://github.com/adaptlearning/adapt_framework/issues/3134))
* Underscore security warning ([#3141](https://github.com/adaptlearning/adapt_framework/issues/3141))
* Field inputs not associated with question ([#3142](https://github.com/adaptlearning/adapt_framework/issues/3142))

## [5.13.0] - 2021-04-22
### Added
* Option to set the course language and text direction using query string parameters `lang` and `dir` ([#3086](https://github.com/adaptlearning/adapt_framework/pull/3086))
* API for Framework & Plugin version detection ([#3121](https://github.com/adaptlearning/adapt_framework/issues/3121))

### Fixed
* Device size and orientation classes could be set incorrectly in multilanguage courses ([#3116](https://github.com/adaptlearning/adapt_framework/issues/3116))
* The Grunt JavaScript task not exiting properly on error ([#3123](https://github.com/adaptlearning/adapt_framework/issues/3123))
* The Grunt task to import translated JSON files not working ([#3126](https://github.com/adaptlearning/adapt_framework/issues/3126))

## [5.12.2] - 2021-04-08
### Changed
* Switched from (deprecated) Babel polyfill to [core-js@3](https://github.com/zloirock/core-js) ([#3113](https://github.com/adaptlearning/adapt_framework/issues/3113))

### Fixed
* Drawer animation duration couldn't be set to `0` ([#3108](https://github.com/adaptlearning/adapt_framework/issues/3108))
* Switching languages causing the start page to be redisplayed ([#3111](https://github.com/adaptlearning/adapt_framework/issues/3111))

## [5.12.1] - 2021-03-24
### Fixed
* Poor wording of Narrative mobile instruction in the 'default course' content ([#3077](https://github.com/adaptlearning/adapt_framework/issues/3077))
* Various issues caused by including the React libraries from `node_modules` rather than loading them as standard libraries ([#3080](https://github.com/adaptlearning/adapt_framework/issues/3080))
* AAT preview hanging due to unhandled `promise` rejections in the Grunt tasks ([#3084](https://github.com/adaptlearning/adapt_framework/issues/3084))
* `ItemsQuestionModel` triggering a Handlebars error if the new 'ARIA answer' globals weren't defined for components (such as MCQ & GMCQ) that used/extended that model ([#3089](https://github.com/adaptlearning/adapt_framework/issues/3089))
* The marking icon in `buttons.hbs` receiving focus when the course was accessed with a screen reader ([#3092](https://github.com/adaptlearning/adapt_framework/issues/3092))
* `u-clearfix` being read out as 'blank blank' by screen readers ([#3094](https://github.com/adaptlearning/adapt_framework/issues/3094))
* Some buttons with `aria-disabled` attribute could still be clicked ([#3097](https://github.com/adaptlearning/adapt_framework/issues/3097))
* `inview` not measuring out-of-bounds correctly ([#3098](https://github.com/adaptlearning/adapt_framework/issues/3098))
* In multilanguage courses, the accessibility API wasn't starting until after the learner had selected a language ([#3097](https://github.com/adaptlearning/adapt_framework/issues/3097) & [#3101](https://github.com/adaptlearning/adapt_framework/issues/3101))

## [5.12.0] - 2021-03-17
### Added
* Support for keyboard/screen reader accessibility for the correct answer toggle button (Part of [#2942](https://github.com/adaptlearning/adapt_framework/issues/2942))
* Support for React JSX templates (Part of [#2944](https://github.com/adaptlearning/adapt_framework/issues/2944))

### Changed
* The 'skip navigation' button now becomes visible when it has focus ([#3040](https://github.com/adaptlearning/adapt_framework/issues/3040))
* Less errors are now written to `stderr` to enable reliable error handling in the AAT ([#3066](https://github.com/adaptlearning/adapt_framework/issues/3066))

### Fixed
* Screen readers reading out 'blank' at the top of the screen after nagivating through the page ([#3057](https://github.com/adaptlearning/adapt_framework/issues/3057))
* History state issue when routing is prevented by plugins like [pageIncompletePrompt](https://github.com/cgkineo/adapt-pageIncompletePrompt) ([#3061](https://github.com/adaptlearning/adapt_framework/issues/3061))
* Error 'exception thrown but not caught' in IE11 whenever clicking on the page ([#3064](https://github.com/adaptlearning/adapt_framework/issues/3064))
* The `tracking-remove` task wouldn't run if the [Spoor plugin](https://github.com/adaptlearning/adapt-contrib-spoor) was not installed ([#3068](https://github.com/adaptlearning/adapt_framework/issues/3068))
* Odd scrolling behaviour when clicking on any Drawer item that caused Adapt to scroll to an element ([#3074](https://github.com/adaptlearning/adapt_framework/issues/3074))

## [5.11.0] - 2021-02-26
### Added
* A method of identifying models based upon the course's `_trackingId` properties, regardless of whether they are located on blocks or components (Part of [#2805](https://github.com/adaptlearning/adapt_framework/issues/2805))

### Changed
* ESLint configuration amended to allow for ES2020 features such as [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) and [nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator); implemented these new features where useful ([#3035](https://github.com/adaptlearning/adapt_framework/issues/3035))

### Fixed
* Overzealous filter in `Adapt.findRelativeModel` ([#3031](https://github.com/adaptlearning/adapt_framework/issues/3031))
* Focus on click was focusing on last parent not first parent ([#3038](https://github.com/adaptlearning/adapt_framework/issues/3038))
* The `"postRender"` event of each view was being triggered before the view's children had been rendered ([#3045](https://github.com/adaptlearning/adapt_framework/issues/3045))

## [5.10.1] - 2021-02-03
### Fixed
* Accessibility focus bug ([#3022](https://github.com/adaptlearning/adapt_framework/issues/3022))

## [5.10.0] - 2021-01-18
### Changed
* Converted core code from AMD-style module defintions to ES6 modules and (where appropriate) classes ([#2999](https://github.com/adaptlearning/adapt_framework/issues/2999))
* Javascript was being run in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) with no way to turn that off should it cause issues with 3rd party plugins. For AAT courses 'strict mode' is no longer enabled; for Framework courses it is now enabled only when `build.strictMode:true` in *config.json*. ([#3017](https://github.com/adaptlearning/adapt_framework/issues/3017))
### Fixed
* Reset on revisit wasn't able to complete before page render ([#3014](https://github.com/adaptlearning/adapt_framework/issues/3014))

## [5.9.0] - 2021-01-07
### Changed
* The `grunt compress` command now operates on images in `src/course/` by default ([#3004](https://github.com/adaptlearning/adapt_framework/issues/3004))
### Fixed
* Disabled buttons were still clickable if accessibility support had been switched off ([#3007](https://github.com/adaptlearning/adapt_framework/issues/3007))
* Failure to install dependencies of `imagemin-jpegtran` / `imagemin-pngquant` on some platforms was causing the entire `npm install` process to halt ([#3002](https://github.com/adaptlearning/adapt_framework/issues/3002))

## [5.8.1] - 2020-12-18
### Fixed
* CommonJS `require` calls not working ([#2997](https://github.com/adaptlearning/adapt_framework/issues/2997))

## [5.8.0] - 2020-12-08
### Added
* Rollup as the module bundler (replacing requirejs) ([#2824](https://github.com/adaptlearning/adapt_framework/issues/2824) & [#2923](https://github.com/adaptlearning/adapt_framework/pull/2923))

### Changed
* The `grunt build` command now deletes the `.cache` file from the build folder ([#2975](https://github.com/adaptlearning/adapt_framework/issues/2975))
* Improved Authoring Tool 'help text' for content object graphic alt text ([#2939](https://github.com/adaptlearning/adapt_framework/issues/2939))

### Fixed
* Value of `_isResetOnRevisit` not being converted from `String` to `Boolean` ([#2825](https://github.com/adaptlearning/adapt_framework/issues/2825) - originally thought fixed in release [5.6.1] but turns out it wasn't)
* HotGraphic component duplicated after window resize ([#2938](https://github.com/adaptlearning/adapt_framework/issues/2938))
* Disabled submit button not visible to assistive technology ([#2950](https://github.com/adaptlearning/adapt_framework/issues/2950))
* The `--port` switch for the `grunt server` command not working ([#2954](https://github.com/adaptlearning/adapt_framework/issues/2954))
* Typo in icons.less ([#2959](https://github.com/adaptlearning/adapt_framework/issues/2959))
* Adapt not restoring learners' answers to questions following a change of language ([#2977](https://github.com/adaptlearning/adapt_framework/issues/2977))

### Removed
* `Adapt.mapById` ([#2908](https://github.com/adaptlearning/adapt_framework/issues/2908))
* The `Adapt.wait` flush that was added in [#2439](https://github.com/adaptlearning/adapt_framework/issues/2439) ([#2743](https://github.com/adaptlearning/adapt_framework/issues/2743))
* Entry for `_isTextProcessorEnabled` from config.model.schema ([#2952](https://github.com/adaptlearning/adapt_framework/issues/2952))
* All instances of "Placeholder graphic" alt text from the 'out of the box' course content ([#2939](https://github.com/adaptlearning/adapt_framework/issues/2939))

## [5.7.1] - 2020-10-09

### Fixed
* Page Level Progress indicators disrupting container outlines in Firefox - now fixed for article/block/page level indicators as well ([#2619](https://github.com/adaptlearning/adapt_framework/issues/2619))
* `Adapt.navigateToElement('.pageId')` errors ([#2901](https://github.com/adaptlearning/adapt_framework/issues/2901))
* `"view:requestChild"` event life-cycle never closes ([#2903](https://github.com/adaptlearning/adapt_framework/issues/2903))
* Switching language forces the 'start page' config to be enabled ([#2907](https://github.com/adaptlearning/adapt_framework/issues/2907))
* Firefox display of `*-title-inner` elements when using outline ([#2912](https://github.com/adaptlearning/adapt_framework/issues/2912))
* IE11 broken display of .svg in `<img>` ([#2916](https://github.com/adaptlearning/adapt_framework/issues/2916))
* `Adapt.scrollTo` assumes the selector parameter will always refer to an 'Adapt Element' ([#2928](https://github.com/adaptlearning/adapt_framework/issues/2928))

### Changed
* General clean up of Less code ([#2891](https://github.com/adaptlearning/adapt_framework/issues/2891))

## [5.7.0] - 2020-08-25
### Added
* New `AttemptStates` API ([#2747](https://github.com/adaptlearning/adapt_framework/issues/2747))
* A `save` method to the `offlineStorage` API ([#2754](https://github.com/adaptlearning/adapt_framework/issues/2754))
* New `DeepClone` API ([#2758](https://github.com/adaptlearning/adapt_framework/issues/2758))
* New `ChildViews` API for rendering control ([#2760](https://github.com/adaptlearning/adapt_framework/issues/2760))
* Option to track content at component level instead of block level ([#2805](https://github.com/adaptlearning/adapt_framework/issues/2805)). Note: requires [v3.5.0 of the Spoor plugin](https://github.com/adaptlearning/adapt-contrib-spoor/releases/tag/v3.5.0).
* Ability to exclude plugins from a 'production' build ([#2836](https://github.com/adaptlearning/adapt_framework/issues/2836))
* Image compression via new `grunt compress` command ([#2866](https://github.com/adaptlearning/adapt_framework/issues/2866))
* Ability to have the state of presentation components saved between sessions ([#2845](https://github.com/adaptlearning/adapt_framework/issues/2845)). Note: requires [v3.5.0 of the Spoor plugin](https://github.com/adaptlearning/adapt-contrib-spoor/releases/tag/v3.5.0).

### Changed
* Underscore library updated to v1.10.2 ([#2773](https://github.com/adaptlearning/adapt_framework/issues/2773))
* Submit button is now disabled until the learner makes a selection ([#2812](https://github.com/adaptlearning/adapt_framework/issues/2812)). Note: If you prefer the old behaviour, you can use the [instructionError plugin](https://github.com/adaptlearning/adapt-contrib-instructionError) to restore it.
* Amended authoring tool schema defaults so that articles and blocks have no display title set automatically ([#2833](https://github.com/adaptlearning/adapt_framework/issues/2833))
* Lodash dependency changed to v4.17.19 ([#2838](https://github.com/adaptlearning/adapt_framework/pull/2838))
* Amended `setupInviewCompletion` to use default parameter ([2839](https://github.com/adaptlearning/adapt_framework/issues/2839))
* Improvements to Notify's `subview` handling ([#2847](https://github.com/adaptlearning/adapt_framework/issues/2847))
* Load Underscore as a UMD module ([#2861](https://github.com/adaptlearning/adapt_framework/issues/2861))
* Turn off deprecation for the `contentObjects`, `articles`, `blocks` and `components` collections ([#2859](https://github.com/adaptlearning/adapt_framework/issues/2859))

### Fixed
* Ensure that in the 'default course' all components have `_pageLevelProgress._isCompletionIndicatorEnabled` set ([#2841](https://github.com/adaptlearning/adapt_framework/issues/2841))
* `JQuery.offset` returning incorrect values when `_scrollingContainer` enabled ([#2849](https://github.com/adaptlearning/adapt_framework/issues/2849))
* Bug in `DrawerView` that was causing a runtime error for some plugins ([#2851](https://github.com/adaptlearning/adapt_framework/issues/2851))
* `grunt build` failing when used with the `languages` switch ([#2875](https://github.com/adaptlearning/adapt_framework/issues/2875))
* Issue with CSV delimiter detection when using `grunt translate:import` ([#2853](https://github.com/adaptlearning/adapt_framework/issues/2853))
* `Notify` popup causing scroll to jump to top of page in Firefox ([#2886](https://github.com/adaptlearning/adapt_framework/issues/2886))
* View-only question components defaulting to `ComponentModel` not `QuestionModel` ([#2884](https://github.com/adaptlearning/adapt_framework/issues/2884))

## [5.6.1] - 2020-07-07
#### Fixed
* Further issues found on [#2796](https://github.com/adaptlearning/adapt_framework/issues/2796)
* Zoom not working on Chrome for Android ([#2800](https://github.com/adaptlearning/adapt_framework/issues/2800))
* Default course assessment page trickle button labels not well labelled ([#2803](https://github.com/adaptlearning/adapt_framework/issues/2803))
* Graphic and pageLevelProgress templates not allowing for HTML entities in `aria-label` attribute ([#2807](https://github.com/adaptlearning/adapt_framework/issues/2807))
* Babel fast-async causing very slow compilation ([#2816](https://github.com/adaptlearning/adapt_framework/issues/2816))
* Value of `_isResetOnRevisit` not being converted from `String` to `Boolean` ([#2825](https://github.com/adaptlearning/adapt_framework/issues/2825))

## [5.6.0] - 2020-06-17
#### Fixed
* Decontaminated `toJSON` functions  ([#2745](https://github.com/adaptlearning/adapt_framework/issues/2745))
* Display marking only on final question attempts  ([#2796](https://github.com/adaptlearning/adapt_framework/issues/2796))
* Allow notify view to accept DOM attributes ([#2785](https://github.com/adaptlearning/adapt_framework/issues/2785))
* jQuery `resize` timeout bug ([#2782](https://github.com/adaptlearning/adapt_framework/issues/2782))

#### Added
* Menu group ARIA level (Part of [#2702](https://github.com/adaptlearning/adapt_framework/issues/2702))
* AdaptModel `setChildren` and `setParent` functions ([#2745](https://github.com/adaptlearning/adapt_framework/issues/2745))


## [5.5.1] - 2020-06-08
### Fixed
* Backward compatibility for view-only components ([#2787](https://github.com/adaptlearning/adapt_framework/issues/2787))


## [5.5.0] - 2020-05-18
#### Added
* `none` helper ([#2764](https://github.com/adaptlearning/adapt_framework/issues/2764))
* Data manifests ([#2645](https://github.com/adaptlearning/adapt_framework/issues/2645))
* `Adapt.store` to decouple the core models and views ([#2714](https://github.com/adaptlearning/adapt_framework/issues/2714))

#### Changed
* Simplified router ([#2712](https://github.com/adaptlearning/adapt_framework/issues/2712))
* Converted a lot more of the core to ES6-8 ([#2709](https://github.com/adaptlearning/adapt_framework/issues/2709))

For a more detailed overview of the changes see ([#2711](https://github.com/adaptlearning/adapt_framework/pull/2711))


## [5.4.0] - 2020-05-12
### Added
- Adapt events `template:preRender`, `template:postRender`, `partial:preRender`, `partial:postRender` ([#2734](https://github.com/adaptlearning/adapt_framework/issues/2734))
- Img tag loading fix ([#2734](https://github.com/adaptlearning/adapt_framework/issues/2734))

### Changed
- Updated jQuery to v3.5.0 ([#2725](https://github.com/adaptlearning/adapt_framework/issues/2725))
- Improved `grunt translate:import` task ([#2736](https://github.com/adaptlearning/adapt_framework/issues/2736))

### Fixed
- The settings `_isResetOnRevisit` and `_requireCompletionOf` were not available in the AAT ([#1912](https://github.com/adaptlearning/adapt_framework/issues/1912) & [#2639](https://github.com/adaptlearning/adapt_framework/issues/2639))
- Arrow function and async/await debugging ([#2733](https://github.com/adaptlearning/adapt_framework/issues/2733))
- Not all course content being exported by the `grunt translate` task ([#2721](https://github.com/adaptlearning/adapt_framework/issues/2721))


## [5.3.0] - 2020-03-26
### Added
- `Adapt.log.removed` and `Adapt.log.deprecated` ([#2678](https://github.com/adaptlearning/adapt_framework/issues/2678))
- ES6-8 support ([#2647](https://github.com/adaptlearning/adapt_framework/issues/2647))
- ES6 class static inheritance to `Backbone` ([#2697](https://github.com/adaptlearning/adapt_framework/issues/2697))

### Changed
- Exposed router controller at `Adapt.router` ([#2677](https://github.com/adaptlearning/adapt_framework/issues/2677))
- Moved navigation button event handlers to `NavigationView` ([#2669](https://github.com/adaptlearning/adapt_framework/issues/2669))
- Converted some models, views and controllers to ES6 ([#2647](https://github.com/adaptlearning/adapt_framework/issues/2647))
- `CourseModel` now inherits from `MenuModel` ([#2647](https://github.com/adaptlearning/adapt_framework/pull/2648#issuecomment-595824424))
- Formalized plugin, data, schema and translate API ([#2662](https://github.com/adaptlearning/adapt_framework/issues/2662))
- Refreshed existing and added new icons to the vanilla font set ([#2688](https://github.com/adaptlearning/adapt_framework/issues/2688))


## [5.2.0] - 2020-03-09
### Added
- Code 'linting' support via ESLint ([#2377](https://github.com/adaptlearning/adapt_framework/issues/2377))
- 'Return to start location' feature to Start Controller ([#2541](https://github.com/adaptlearning/adapt_framework/issues/2541))
- Event bubbling for the `change:_isActive` event ([#2649](https://github.com/adaptlearning/adapt_framework/issues/2649))
- Component padding LESS variable ([#2676](https://github.com/adaptlearning/adapt_framework/issues/2676))

### Changed
- Drawer scrolling behaviour for better support for long lists of items ([#2498](https://github.com/adaptlearning/adapt_framework/issues/2498))

### Fixed
- Locking checks were not being performed on contentObjects that are descendants of contentObjects ([#2469](https://github.com/adaptlearning/adapt_framework/issues/2469))
- Page Level Progress indicators disrupting container outlines in Firefox ([#2619](https://github.com/adaptlearning/adapt_framework/issues/2619))
- `imageReady` error in IE 11 when SVG images used ([#2625](https://github.com/adaptlearning/adapt_framework/issues/2625))
- visual bug with questions with marking but no feedback ([#2627](https://github.com/adaptlearning/adapt_framework/issues/2627))
- Notify 'push' styles missing ([#2640](https://github.com/adaptlearning/adapt_framework/issues/2640))
- Error 'tslib not found' preventing LESS from being compiled ([#2642](https://github.com/adaptlearning/adapt_framework/issues/2642))
- Menu item titles not being read out by assistive technology ([#2680](https://github.com/adaptlearning/adapt_framework/issues/2680))

### Removed
- Grunt task `create-json-config` - it isn't needed any more ([#2660](https://github.com/adaptlearning/adapt_framework/issues/2660))


## [5.1.0] - 2019-12-11
### Added
- Classes to question components to indicate when the settings 'show model answer', 'show feedback' or 'show marking' are enabled ([#2606](https://github.com/adaptlearning/adapt_framework/issues/2606))

### Changed
- Framework 'example course' content now set to:
  * Always show media player controls (for better accessibility)
  * Toggle captions on/off (rather than show language popup) when the 'cc' button in the media component is selected
  * show 'native controls' for the media component on iOS/iPadOS/Android ([#2477](https://github.com/adaptlearning/adapt_framework/issues/2477))

### Fixed
- Media component showing two sets of controls and captions when exiting full-screen mode on iOS ([#2477](https://github.com/adaptlearning/adapt_framework/issues/2477))
- Hot graphic popup not re-centering vertically when 'paging' between items ([#2580](https://github.com/adaptlearning/adapt_framework/issues/2580))
- Blank component not triggering `inview` ([#2595](https://github.com/adaptlearning/adapt_framework/issues/2595))

## [5.0.0] - 2019-11-21
### Added
- Added `normalize.css`
- Added subtitle property to page (and menu) hbs and schema
- Utilised `_onScreen` property to set up standard animation that can be added to components, blocks, articles, and contentObjects
- Added instruction field to course schema
- Added `screenSize` support for rem's and px's - required for conversion to REM when upgrading the Authoring Tool
- Added wait queue to `menuView` and `pageView` render
- Added `.is-optional` class to all views

### Changed
- Updated HTML naming convention to adhere to BEM
- Adopted relative unit measurement (rem) instead of fixed (px)
- Updated CSS to use a SMACSS approach
- All components will render their classes in lowercase
- Articles, blocks, and components all render into their respective containers
- Changed how icons are applied to elements
- `.navigation` class changed to `.nav`
- Loading changed to CSS animation
- Split `menuItemView` into new file
- Split `drawerItemView` into new file
- Changed LESS folder structure
- Updated heading aria label to use title property
- Changed `_htmlClassName` to `_htmlClasses` ([#2392](https://github.com/adaptlearning/adapt_framework/issues/2392))
- Amended viewport meta tag (https://github.com/adaptlearning/adapt_framework/pull/2569)
- Indentation amended to use 2 spaces instead of 4

### Fixed
- Drawer no longer renders two `role='list'` attributes

### Removed
- Deprecated functionality ([#2329](https://github.com/adaptlearning/adapt_framework/issues/2329))

## [4.4.1] - 2019-11-06
### Fixed
- Course not loading in IE11 due to missing `function` keyword in accessibility library ([#2570](https://github.com/adaptlearning/adapt_framework/issues/2570))

## [4.4.0] - 2019-10-30
### Added
- new accessibility API ([#2449](https://github.com/adaptlearning/adapt_framework/issues/2449))
- new Notify API ([#2532](https://github.com/adaptlearning/adapt_framework/issues/2532))
- Loading enhancements to allow extensions to halt execution until loaded and to stop `inview` from processing until page ready ([#2558](https://github.com/adaptlearning/adapt_framework/issues/2558))
- Handlebars helper (`a11y_alt_text`) to allow the screenreader to read out a 'screen reader friendly' alternative to the on-screen text ([#2553](https://github.com/adaptlearning/adapt_framework/issues/2553))

### Changed
- Re-write and tidy up of Adapt's 'entry point' code ([#2436](https://github.com/adaptlearning/adapt_framework/issues/2436))
- The browser's 'focus outline' is now hidden by default, unless the learner presses a key associated with keyboard/screen reader accessibility (part of [#2449](https://github.com/adaptlearning/adapt_framework/issues/2449))
- Re-organise some core files to align with the structure used by plugins ([#2472](https://github.com/adaptlearning/adapt_framework/issues/2472))
- Improvements to help text ([#2552](https://github.com/adaptlearning/adapt_framework/pull/2552))

### Fixed
- Handlebars npm module v4.3.x update prevented newly-created Adapt courses from running ([#2524](https://github.com/adaptlearning/adapt_framework/issues/2524))
- Adapt could fail to load if a question component didn't have any items defined ([#2546](https://github.com/adaptlearning/adapt_framework/issues/2546))
- HTML formatting in titles being read out by screen readers ([#2549](https://github.com/adaptlearning/adapt_framework/issues/2549))
- `AdaptModel.findRelativeModel` not working correctly when searching for descendants ([#2563](https://github.com/adaptlearning/adapt_framework/issues/2563))

## [4.3.0] - 2019-08-14
### Added
- Ability for pages/menus to define a class that will be applied to the `<html>` element whenver that page/menu is active ([#2392](https://github.com/adaptlearning/adapt_framework/issues/2392))
- Store for the page's View references, along with functions `Adapt.findViewByModelId`, `View.findDescendantViews` & `View.getChildViews` ([#2395](https://github.com/adaptlearning/adapt_framework/issues/2395))
- A timeout to the `Adapt.wait` API ([#2439](https://github.com/adaptlearning/adapt_framework/issues/2439))
- Notify heading aria-level can now be set via config.json ([#2486](https://github.com/adaptlearning/adapt_framework/issues/2486))

### Fixed
- RTL layout issues ([#2389](https://github.com/adaptlearning/adapt_framework/issues/2389))
- Inheritance bug broke `ItemsComponentModel` chain ([#2415](https://github.com/adaptlearning/adapt_framework/issues/2415))
- Trickle flicker in IE11 ([#2423](https://github.com/adaptlearning/adapt_framework/issues/2423))
- Bug in Chrome where the page could still be scrolled whilst a popup or the drawer were open ([#2440](https://github.com/adaptlearning/adapt_framework/issues/2440))
- Grunt build/dev not picking up on changes to some files & was copying files that hadn't been changed ([#2441](https://github.com/adaptlearning/adapt_framework/issues/2441))
- Setting `_isResetOnRevisit` to `'soft'` prevented questions from being answered ([#2474](https://github.com/adaptlearning/adapt_framework/issues/2474))
- JQuery `offset` override wasn't allowing coordinates to be set ([#2484](https://github.com/adaptlearning/adapt_framework/issues/2484))
- Including an Accordion component with no items prevented the course from rendering ([#2480](https://github.com/adaptlearning/adapt_framework/issues/2480))
- Less files were not being imported in the correct order ([#2487](https://github.com/adaptlearning/adapt_framework/issues/2487))

### Removed
- Class `a11y-ignore` from the 'skip navigation' button ([#2420](https://github.com/adaptlearning/adapt_framework/issues/2420))

## [4.2.0] - 2019-05-02
### Added
- Support for sharing courses with specific users ([#2345](https://github.com/adaptlearning/adapt_framework/issues/2345))
- Support for authoring tool theme editor ([#2360](https://github.com/adaptlearning/adapt_framework/issues/2360))

**Note: if using the authoring tool, this release requires you to be running version 0.8 or higher**

## [4.1.1] - 2019-04-09
### Fixed
- Incorrect "Unknown" lesson status when completing assessment and course in different attempts ([#2398](https://github.com/adaptlearning/adapt_framework/issues/2398))

## [4.1.0] - 2019-03-21
### Added
- Model event bubbling system ([#2314](https://github.com/adaptlearning/adapt_framework/issues/2314))

### Fixed
- Use of the Language Picker extension prevented the course completion criteria from being read in ([#2386](https://github.com/adaptlearning/adapt_framework/issues/2386))
- Question components that used `ItemsQuestionModel` weren't correctly restoring user answers or marking ([#2379](https://github.com/adaptlearning/adapt_framework/issues/2379))

### Changed
- default value of `_accessibility._isEnabled` amended to `true` in config.model.schema ([#2374](https://github.com/adaptlearning/adapt_framework/issues/2374))

## [4.0.1] - 2019-01-31
### Fixed
- Helper expecting missing object ([#2339](https://github.com/adaptlearning/adapt_framework/pull/2339))
- Support for custom 'manifest identifier' in Spoor ([#2232](https://github.com/adaptlearning/adapt_framework/pull/2332))

## [4.0.0] - 2019-01-22
### Added
- Shim to ensure the new 'manifest identifier' property is set even if not defined in config.json ([#2232](https://github.com/adaptlearning/adapt_framework/pull/2332) and [#2247](https://github.com/adaptlearning/adapt_framework/issues/2247))
- new `_scrollingContainer` setting to allow for better rendering/scrolling of Adapt when loaded into an `iframe` ([#505](https://github.com/adaptlearning/adapt_framework/issues/585) & [#751](https://github.com/adaptlearning/adapt_framework/issues/751))

### Changed
- Updates to Accessibility - for a complete list of changes see the [Accessibility v4 Milestone](https://github.com/adaptlearning/adapt_framework/milestone/17?closed=1)

### Fixed
- Notify styling issue ([#2308](https://github.com/adaptlearning/adapt_framework/issues/2308))
- Framework schemas not aligned with authoring tool versions ([#2306](https://github.com/adaptlearning/adapt_framework/issues/2306))

## [3.4.0] - 2019-01-18
### Added
- Support for translatable content in config.json to the `translate:import` task ([#2300](https://github.com/adaptlearning/adapt_framework/issues/2300))
- Ability to insert variables into HTML files during build/dev process ([#2317](https://github.com/adaptlearning/adapt_framework/pull/2317))

### Changed
- Future-proof schema files for Authoring Tool compatibility ([#2306](https://github.com/adaptlearning/adapt_framework/issues/2306))

### Fixed
- Typo in accessibility instructions ([#2320](https://github.com/adaptlearning/adapt_framework/issues/2320))
- Reference to 'Version 2.0 core bundle' in the default course content

## [3.3.0] - 2018-11-30

### Added
- Implemented 'complete on inview' functionality in ComponentView so that plugins can use this rather than having to have their own implementations ([#2269](https://github.com/adaptlearning/adapt_framework/issues/2269))

### Changed
- Amended NotifyView to get it to pass a reference to itself when triggering `notify:*` events ([#2279](https://github.com/adaptlearning/adapt_framework/issues/2279))

### Fixed
- AdaptModel's `findAncestor` triggered a `TypeError` if no ancestor of the specified type was found ([#2240](https://github.com/adaptlearning/adapt_framework/issues/2240))
- Schema defaults were not being written to `build/{lang}/course/course.json` ([#2248](https://github.com/adaptlearning/adapt_framework/issues/2248))

## [3.2.2] - 2018-10-15

### Fixed
- The 'component not found' error can be quite misleading ([#2142](https://github.com/adaptlearning/adapt_framework/issues/2142))
- On feedback popup open, background content is scrollable on Android ([#2154](https://github.com/adaptlearning/adapt_framework/issues/2154))
- The `findDescendantModels` function throwing error when there's no defined `_children` type ([#2180](https://github.com/adaptlearning/adapt_framework/issues/2180))
- Unnecessary Grunt process ([#2224](https://github.com/adaptlearning/adapt_framework/issues/2224))
- Accessibility library causing elements to scroll into view unnecessarily ([#2228](https://github.com/adaptlearning/adapt_framework/issues/2228))

### Changed
- Refactor of feedback code in questionModel ([#2208](https://github.com/adaptlearning/adapt_framework/pull/2208))

## [3.2.1] - 2018-08-23

### Fixed
- Corrected issue with drawer button when the drawer only contains one item ([#2217](https://github.com/adaptlearning/adapt_framework/issues/2217))
- Bug where `pageBody` was only output in Handlebars template if `body` was also set ([#2178](https://github.com/adaptlearning/adapt_framework/issues/2178))
- Corrected bug in Grunt scripts.js task: Added `process.cwd()` to correct an issue with running post build scripts, e.g. as used in adapt-contrib-xapi. ([#2212](https://github.com/adaptlearning/adapt_framework/issues/2212))
- Corrected issue with Grunt task reverting device size defaults ([#2153](https://github.com/adaptlearning/adapt_framework/issues/2153))

### Changed
- Updated Underscore JS library to v1.9.1 ([#2047](https://github.com/adaptlearning/adapt_framework/issues/2047))
- Removed the list of contributors from package.json ([#2214](https://github.com/adaptlearning/adapt_framework/issues/2214))

## [3.2.0] - 2018-06-28

### Added
- Framework version is now exposed in the DOM as a `data` attribute of the `<html>` element ([#2143](https://github.com/adaptlearning/adapt_framework/issues/2143))
- New `Adapt.getViewClass` function to allow a component view to be fetched from the `componentStore` in a consistent manner ([#2073](https://github.com/adaptlearning/adapt_framework/issues/2073))
- Ability to easily filter the results of `findDescendantModels` ([#2058](https://github.com/adaptlearning/adapt_framework/issues/2058))

### Fixed
- A backwards-compatibility issue with `ItemsComponentModel` ([#2071](https://github.com/adaptlearning/adapt_framework/issues/2071))
- Components that implement `mobileInstruction` wouldn't display it if the standard `instruction` was left blank ([#2069](https://github.com/adaptlearning/adapt_framework/issues/2069))
- The `notify:closeNotify` event could be invoked multiple times ([#1659](https://github.com/adaptlearning/adapt_framework/issues/1659))

### Removed
- Page 'tab wrapping' ([#2076](https://github.com/adaptlearning/adapt_framework/issues/2076))
- Legacy `_allowScrollOver` setting and related code that allowed `inview` to work with those (old) versions of Safari for iOS that would pause JavaScript execution whilst the user was scrolling ([#2054](https://github.com/adaptlearning/adapt_framework/pull/2054))

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
- Moved course completion settings and logic out of the Spoor plugin and into core in preparation for the addition of xAPI support ([#1700](https://github.com/adaptlearning/adapt_framework/issues/1700))
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

[5.17.7]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.6...v5.17.7
[5.17.6]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.5...v5.17.6
[5.17.5]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.4...v5.17.5
[5.17.4]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.3...v5.17.4
[5.17.3]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.2...v5.17.3
[5.17.2]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.1...v5.17.2
[5.17.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.17.0...v5.17.1
[5.17.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.16.0...v5.17.0
[5.16.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.5...v5.16.0
[5.15.5]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.4...v5.15.5
[5.15.4]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.3...v5.15.4
[5.15.3]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.2...v5.15.3
[5.15.2]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.1...v5.15.2
[5.15.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.15.0...v5.15.1
[5.15.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.14.0...v5.15.0
[5.14.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.13.0...v5.14.0
[5.13.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.12.2...v5.13.0
[5.12.2]: https://github.com/adaptlearning/adapt_framework/compare/v5.12.1...v5.12.2
[5.12.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.12.0...v5.12.1
[5.12.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.11.0...v5.12.0
[5.11.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.10.1...v5.11.0
[5.10.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.10.0...v5.10.1
[5.10.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.9.0...v5.10.0
[5.9.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.8.1...v5.9.0
[5.8.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.8.0...v5.8.1
[5.8.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.7.1...v5.8.0
[5.7.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.6.1...v5.7.0
[5.6.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.6.0...v5.6.1
[5.6.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.5.1...v5.6.0
[5.5.1]: https://github.com/adaptlearning/adapt_framework/compare/v5.5.0...v5.5.1
[5.5.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.4.0...v5.5.0
[5.4.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.3.0...v5.4.0
[5.3.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.2.0...v5.3.0
[5.2.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/adaptlearning/adapt_framework/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/adaptlearning/adapt_framework/compare/v4.4.1...v5.0.0
[4.4.1]: https://github.com/adaptlearning/adapt_framework/compare/v4.4.0...v4.4.1
[4.4.0]: https://github.com/adaptlearning/adapt_framework/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/adaptlearning/adapt_framework/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/adaptlearning/adapt_framework/compare/v4.1.1...v4.2.0
[4.1.1]: https://github.com/adaptlearning/adapt_framework/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/adaptlearning/adapt_framework/compare/v4.0.1...v4.1.0
[4.0.1]: https://github.com/adaptlearning/adapt_framework/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.5.0...v4.0.0
[3.5.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.2.2...v3.3.0
[3.2.2]: https://github.com/adaptlearning/adapt_framework/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/adaptlearning/adapt_framework/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/adaptlearning/adapt_framework/compare/v3.1.0...v3.2.0
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
