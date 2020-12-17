import Adapt from 'core/js/adapt';
import Bowser from 'bowser';

class Device extends Backbone.Controller {

  initialize() {
    this.$html = $('html');
    this.$window = $(window);
    this.touch = Modernizr.touchevents;
    this.screenWidth = this.getScreenWidth();
    this.screenHeight = this.getScreenHeight();
    this.browser = (Bowser.name || '').toLowerCase();
    this.version = (Bowser.version || '').toLowerCase();
    this.OS = this.getOperatingSystem().toLowerCase();
    this.osVersion = Bowser.osversion || '';
    this.renderingEngine = this.getRenderingEngine();
    this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 100);
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady
    });
    const browser = this.browser.toLowerCase();
    // Convert 'msie' and 'internet explorer' to 'ie'.
    let browserString = browser.replace(/msie|internet explorer/, 'ie');
    browserString += ` version-${this.version} OS-${this.OS} ${this.getAppleDeviceType()}`;
    browserString += browserString.replace('.', '-').toLowerCase();
    browserString += ` pixel-density-${this.pixelDensity()}`;
    this.$html.addClass(browserString);
  }

  get orientation() {
    return (this.screenWidth >= this.screenHeight) ? 'landscape' : 'portrait';
  }

  get aspectRatio() {
    return this.screenWidth / this.screenHeight;
  }

  onDataReady() {
    this.screenSize = this.checkScreenSize();
    this.$html.addClass('size-' + this.screenSize);
    if (this.orientation) {
      this.$html.addClass('orientation-' + this.orientation);
    }
    // As Adapt.config is available it's ok to bind the 'resize'.
    this.$window.on('resize orientationchange', this.onWindowResize);
  }

  /**
   * Compares the calculated screen width to the breakpoints defined in config.json.
   *
   * @returns {string} 'large', 'medium' or 'small'
   */
  checkScreenSize() {
    var screenSizeConfig = Adapt.config.get('screenSize');
    var screenSize;

    var screensizeEmThreshold = 300;
    var baseFontSize = 16;

    // Check to see if the screen size value is larger than the em threshold
    // If value is larger than em threshold, convert value (assumed px) to ems
    // Otherwise assume value is in ems
    var mediumEmBreakpoint = screenSizeConfig.medium > screensizeEmThreshold
      ? screenSizeConfig.medium / baseFontSize
      : screenSizeConfig.medium;
    var smallEmBreakpoint = screenSizeConfig.small > screensizeEmThreshold
      ? screenSizeConfig.small / baseFontSize
      : screenSizeConfig.small;

    var fontSize = parseFloat($('html').css('font-size'));
    var screenSizeEmWidth = (this.screenWidth / fontSize);

    // Check to see if client screen width is larger than medium em breakpoint
    // If so apply large, otherwise check to see if client screen width is
    // larger than small em breakpoint. If so apply medium, otherwise apply small
    if (screenSizeEmWidth >= mediumEmBreakpoint) {
      screenSize = 'large';
    } else if (screenSizeEmWidth >= smallEmBreakpoint) {
      screenSize = 'medium';
    } else {
      screenSize = 'small';
    }

    return screenSize;
  }

  getScreenWidth() {
    return this.isAppleDevice()
      ? this.getAppleScreenWidth()
      : window.innerWidth || this.$window.width();
  }

  getScreenHeight() {
    return this.isAppleDevice()
      ? this.getAppleScreenHeight()
      : window.innerHeight || this.$window.height();
  }

  getOperatingSystem() {
    var os = '';
    var flags = ['windows', 'mac', 'linux', 'windowsphone', 'chromeos', 'android',
      'ios', 'blackberry', 'firefoxos', 'webos', 'bada', 'tizen', 'sailfish'];

    for (var i = 0; i < flags.length; i++) {
      if (Bowser[flags[i]]) {
        os = flags[i];
        break;
      }
    }

    if (os === '') {
      // Fall back to using navigator.platform in case Bowser can't detect the OS.
      var platform = navigator.platform;
      var platforms = ['Win', 'Mac', 'Linux'];
      os = 'PlatformUnknown';

      for (var j = 0; j < platforms.length; j++) {
        if (platform.indexOf(platforms[j]) !== -1) {
          os = platforms[j].toLowerCase();
          break;
        }
      }

      // Set consistency with the Bowser flags.
      if (os === 'win') {
        os = 'windows';
      }
    }

    return os;
  }

  getRenderingEngine() {
    var engine = '';
    var flags = ['webkit', 'blink', 'gecko', 'msie', 'msedge'];

    for (var i = 0; i < flags.length; i++) {
      if (Bowser[flags[i]]) {
        engine = flags[i];
        break;
      }
    }

    return engine;
  }

  onWindowResize() {
    // Calculate the screen properties.
    var previousWidth = this.screenWidth;
    var previousHeight = this.screenHeight;

    this.screenWidth = this.getScreenWidth();
    this.screenHeight = this.getScreenHeight();

    if (previousWidth === this.screenWidth && previousHeight === this.screenHeight) {
      // Do not trigger a change if the viewport hasn't actually changed.  Scrolling on iOS will trigger a resize.
      return;
    }

    var newScreenSize = this.checkScreenSize();

    if (newScreenSize !== this.screenSize) {
      this.screenSize = newScreenSize;

      this.$html.removeClass('size-small size-medium size-large').addClass('size-' + this.screenSize);

      if (this.orientation) {
        this.$html.removeClass('orientation-landscape orientation-portrait').addClass('orientation-' + this.orientation);
      }

      Adapt.trigger('device:changed', this.screenSize);
    }

    Adapt.trigger('device:preResize device:resize device:postResize', this.screenWidth);

  }

  isAppleDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  getAppleScreenWidth() {
    return (Math.abs(window.orientation) === 90) ? window.screen.height : window.screen.width;
  }

  getAppleScreenHeight() {
    return (Math.abs(window.orientation) === 90) ? window.screen.width : window.screen.height;
  }

  getAppleDeviceType() {
    var type = '';

    var flags = ['iphone', 'ipad', 'ipod'];

    for (var i = 0; i < flags.length; i++) {
      if (Bowser[flags[i]]) {
        type = flags[i];
        break;
      }
    }

    return type;
  }

  pixelDensity() {
    var pixelDensity = (window.devicePixelRatio || 1);

    if (pixelDensity >= 3) {
      return 'ultra-high';
    } else if (pixelDensity >= 2) {
      return 'high';
    } else if (pixelDensity >= 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

}

export default (Adapt.device = new Device());
