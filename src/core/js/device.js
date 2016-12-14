define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Bowser = require('coreJS/libraries/bowser');
    var $window = $(window);

    Adapt.device = {};
    Adapt.device.touch = Modernizr.touch;
    Adapt.device.screenWidth = getScreenWidth();
    Adapt.device.screenHeight = getScreenHeight();
    Adapt.device.orientation = getScreenOrientation();
    Adapt.device.aspectRatio = getScreenAspectRatio();

    Adapt.once('app:dataReady', function() {
        Adapt.device.screenSize = checkScreenSize();

        $('html').addClass("size-" + Adapt.device.screenSize);

        // As Adapt.config is available it's ok to bind the 'resize'.
        $window.on('resize', onWindowResize);
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

    function getScreenOrientation() {
        return (Adapt.device.screenWidth >= Adapt.device.screenHeight) ? 'landscape' : 'portrait';
    }

    function getScreenAspectRatio() {
        return Adapt.device.screenWidth / Adapt.device.screenHeight;
    }

    var onWindowResize = _.debounce(function onScreenSizeChanged() {
        // Calculate the screen properties:
        Adapt.device.screenWidth = getScreenWidth();
        Adapt.device.screenHeight = getScreenHeight();
        Adapt.device.orientation = getScreenOrientation();
        Adapt.device.aspectRatio = getScreenAspectRatio();

        var newScreenSize = checkScreenSize();

        if (newScreenSize !== Adapt.device.screenSize) {
            Adapt.device.screenSize = newScreenSize;

            $('html').removeClass("size-small size-medium size-large").addClass("size-" + Adapt.device.screenSize);

            Adapt.trigger('device:changed', Adapt.device.screenSize);
        }

        Adapt.trigger('device:resize', Adapt.device.screenWidth);

    }, 100);

    var browser = Bowser.name;
    var version = Bowser.version;
    var OS = Bowser.osversion;

    // Bowser only checks against navigator.userAgent so if the OS is undefined, do a check on the navigator.platform
    if (OS == undefined) OS = getPlatform();

    function isAppleDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function getAppleScreenWidth() {
        return (Math.abs(window.orientation) === 90) ? screen.height : screen.width;
    }

    function getAppleScreenHeight() {
        return (Math.abs(window.orientation) === 90) ? screen.width : screen.height;
    }

    function getPlatform() {

        var platform = navigator.platform;

        if (platform.indexOf("Win") != -1) {
            return "Windows";
        } else if (platform.indexOf("Mac") != -1) {
            return "Mac";
        } else if (platform.indexOf("Linux") != -1) {
            return "Linux";
        }

        return "PlatformUnknown";
    }

    function pixelDensity() {
        var fltPixelDensity = ( window.devicePixelRatio || 1 );

        if( fltPixelDensity >= 3 ) {
            return 'ultra-high';
        } else if( fltPixelDensity >= 2 ) {
            return 'high';
        } else if( fltPixelDensity >= 1.5 ) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    var browserString = browser + " version-" + version + " OS-" + OS;
	/* MAKE DEVICE IDENTIFICATION UNIFORM CASE */
    Adapt.device.browser = browser ? browser.toLowerCase() : "";
    Adapt.device.version = version ? version.toLowerCase() : "";
    Adapt.device.OS = OS ? OS.toLowerCase() : "";
    browserString = browserString.replace("Internet Explorer", "ie");

    $("html").addClass(browserString + ' pixel-density-' + pixelDensity());

});
