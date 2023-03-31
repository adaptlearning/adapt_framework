export default {
  course: {
    get: jest.fn().mockReturnValue(
      {
        _accessibility: {
          skipNavigationText: 'Skip navigation',
          _accessibilityInstructions: {
            ipad: 'Usage instructions for touchscreens. Use swipe left for next. Use swipe right for previous. Use a double tab to select. Use a two finger slide up to go to the top of the page. Usage instructions for keyboard access. Use left for next. Use right for previous. Use up and down together to select.',
            notouch: 'Usage instructions. Use tab for next. Use shift tab for previous. Use enter to select. Use escape to go to the top of the page.',
            touch: 'Usage instructions. Use swipe left for next. Use swipe right for previous. Use a double tab to select. Use a two finger slide up to go to the top of the page.'
          },
          _accessibilityToggleTextOff: 'Turn accessibility off?',
          _accessibilityToggleTextOn: 'Turn accessibility on?',
          _ariaLabels: {
            accessibilityToggleButton: 'By selecting this button you can set whether accessibility is turned on or off',
            closeDrawer: 'Close drawer',
            closePopup: 'Close popup',
            closeResources: 'Close resources',
            complete: 'Complete',
            correct: 'Correct',
            done: 'Done',
            drawer: 'Side drawer',
            drawerBack: 'Back to drawer',
            exit: 'Exit',
            feedbackPopUp: 'Popup opened',
            home: 'Home',
            incomplete: 'Incomplete',
            incorrect: 'Incorrect',
            locked: 'Locked',
            menu: 'Menu',
            menuBack: 'Back to menu',
            menuIndicatorHeading: 'Menu item heading ',
            menuItem: 'Menu item',
            menuLoaded: 'Menu loaded',
            menuViewButton: 'Select here to enter',
            navigation: 'Course navigation bar',
            navigationBack: 'Navigate back',
            navigationDrawer: 'Open course resources and search',
            next: 'Next',
            page: 'Page',
            pageLoaded: 'Page loaded',
            previous: 'Back',
            skipNavigation: 'Skip navigation',
            visited: 'Visited'
          }
        },
        _components: {
          _text: {
            ariaRegion: 'Text Component Aria Text'
          }
        }
      }
    )
  }
};
