define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Bowser = require('coreJS/libraries/bowser');
    var $window = $(window);

    Adapt.device = {
        touch: Modernizr.touch,
        screenWidth: getScreenWidth(),
        screenHeight: getScreenHeight(),
        browser: Bowser.name,
        version: Bowser.version,
        OS: getOperatingSystem(),
        osVersion: Bowser.osversion || '',
        renderingEngine: getRenderingEngine()
    };

    // Define 'orientation' and 'aspectRatio' here once 'screenWidth' and 'screenHeight' have been set,
    // as both these functions are getters, essentially.
    Object.defineProperties(Adapt.device, {
        "orientation": {
            get: function () {
                return (this.screenWidth >= this.screenHeight) ? 'landscape' : 'portrait';
            }
        },
        "aspectRatio": {
            get: function () {
                return this.screenWidth / this.screenHeight;
            }
        }
    });

    Adapt.once('app:dataReady', function() {
        Adapt.device.screenSize = checkScreenSize();

        $('html').addClass('size-' + Adapt.device.screenSize);
        
        if (Adapt.device.orientation) {
            $('html').addClass('orientation-' + Adapt.device.orientation);
        }

        // As Adapt.config is available it's ok to bind the 'resize'.
        $window.on('resize orientationchange', onWindowResize);
    });

    /**
     * Compares the calculated screen width to the breakpoints defined in config.json.
     * 
     * @returns {string} 'large', 'medium' or 'small'
     */
    function checkScreenSize() {
        var screenSizeConfig = Adapt.config.get('screenSize');
        var screenSize;

        if (Adapt.device.screenWidth > screenSizeConfig.medium) {
            screenSize = 'large';
        } else if (Adapt.device.screenWidth > screenSizeConfig.small) {
            screenSize = 'medium';
        } else {
            screenSize = 'small';
        }

        return screenSize;
    }

    function getScreenWidth() {
        return isAppleDevice()
            ? getAppleScreenWidth()
            : window.innerWidth || $window.width();
    }

    function getScreenHeight() {
        return isAppleDevice()
            ? getAppleScreenHeight()
            : window.innerHeight || $window.height();
    }

    function getOperatingSystem() {
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

            for (var i = 0; i < platforms.length; i++) {
                if (platform.indexOf(platforms[i]) != -1) {
                    os = platforms[i].toLowerCase();
                    break;
                }
            }

            // Set consistency with the Bowser flags.
            if (os == 'win') {
                os = 'windows';
            }
        }

        return os;
    }

    function getRenderingEngine() {
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

    var onWindowResize = _.debounce(function onScreenSizeChanged() {
        // Calculate the screen properties.
        Adapt.device.screenWidth = getScreenWidth();
        Adapt.device.screenHeight = getScreenHeight();

        var newScreenSize = checkScreenSize();

        if (newScreenSize !== Adapt.device.screenSize) {
            Adapt.device.screenSize = newScreenSize;

            $('html').removeClass('size-small size-medium size-large').addClass('size-' + Adapt.device.screenSize);

            if (Adapt.device.orientation) {
                $('html').removeClass('orientation-landscape orientation-portrait').addClass('orientation-' + Adapt.device.orientation);
            }

            Adapt.trigger('device:changed', Adapt.device.screenSize);
        }

        Adapt.trigger('device:resize', Adapt.device.screenWidth);

    }, 100);

    function isAppleDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function getAppleScreenWidth() {
        return (Math.abs(window.orientation) === 90) ? screen.height : screen.width;
    }

    function getAppleScreenHeight() {
        return (Math.abs(window.orientation) === 90) ? screen.width : screen.height;
    }

    function getAppleDeviceType() {
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

    function pixelDensity() {
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

    // Convert 'msie' to 'ie' for backwards compatibility
    var browserString = (Adapt.device.browser.toLowerCase() === 'msie') ? 'ie' : Adapt.device.browser.toLowerCase();
    browserString = browserString + ' version-' + Adapt.device.version + ' OS-' + Adapt.device.OS + ' ' + getAppleDeviceType();

    $("html").addClass(browserString + ' pixel-density-' + pixelDensity());
});
