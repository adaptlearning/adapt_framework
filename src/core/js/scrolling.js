define([
    'core/js/adapt'
], function(Adapt) {

    var Scrolling = Backbone.Controller.extend({

        $html: null,
        $app: null,
        isLegacyScrolling : true,

        initialize: function() {
            this._checkApp();
            Adapt.once('configModel:dataLoaded', this._loadConfig.bind(this));
        },

        _checkApp: function() {
            this.$html = $('html');
            this.$app = $('#app');
            if (this.$app.length) return;
            this.$app = $('<div id="app">');
            $('body').append(this.$app);
            this.$app.append($('#wrapper'));
            Adapt.log.warn("UPDATE - Your html file needs to have #app adding. See https://github.com/adaptlearning/adapt_framework/issues/2168");
        },

        _loadConfig: function() {
            var config = Adapt.config.get("_scrollingContainer");
            if (!config || !config._isEnabled) return;
            var limitTo = config._limitToSelector;
            var isIncluded = !limitTo || (this.$html.is(limitTo) || this.$html.hasClass(limitTo));
            if (!isIncluded) return;
            this.isLegacyScrolling = false;
            this._addStyling();
            this._fixJQuery();
            this._fixScrollTo();
            this._fixBrowser();
        },

        _addStyling: function() {
            this.$html.addClass("adapt-scrolling");
        },

        _fixJQuery: function() {
            var selectorScrollTop = $.fn.scrollTop;
            var $app = Adapt.scrolling.$app;
            $.fn.scrollTop = function() {
                if (this[0] === window || this[0] === document.body) {
                    return selectorScrollTop.apply($app, arguments);
                }
                return selectorScrollTop.apply(this, arguments);
            };
            var selectorOffset = $.fn.offset;
            $.fn.offset = function() {
                var $app = Adapt.scrolling.$app;
                var $element = this;
                var elementOffset = selectorOffset.call($element);
                var isCorrectedContainer = $element.parents().add($element).filter('html,body,#app').length;
                if (!isCorrectedContainer) {
                    // Do not adjust the offset measurement as not in $app container and isn't html or body
                    return elementOffset;
                }
                // Adjust measurement by scrolling and offset of $app container
                var scrollTop = parseInt($app.scrollTop());
                var scrollLeft = parseInt($app.scrollLeft());
                var appOffset = selectorOffset.call($app);
                elementOffset.top += (scrollTop - appOffset.top);
                elementOffset.left += (scrollLeft - appOffset.left);
                return elementOffset;
            };
        },

        _fixScrollTo: function() {
            var selectorScrollTo = $.fn.scrollTo;
            var scrollTo = $.scrollTo;
            var $app = Adapt.scrolling.$app;
            $.fn.scrollTo = function(target, duration, settings) {
                if (this[0] === window || this[0] === document.body) {
                    return selectorScrollTo.apply($app, arguments);
                }
                return selectorScrollTo.apply(this, arguments);
            };
            $.scrollTo = function(target, duration, settings) {
                return selectorScrollTo.apply($app, arguments);
            };
            _.extend($.scrollTo, scrollTo);
        },

        _fixBrowser: function() {
            var app = Adapt.scrolling.$app[0];
            window.scrollTo = function(x, y) {
                app.scrollTop = y || 0;
                app.scrollLeft = x || 0;
            };
            var $window = $(window);
            this.$app.on("scroll", function() {
                $window.scroll();
            });
        }

    });

    Adapt.scrolling = new Scrolling();

    Adapt.scrollTo = function(selector, settings) {
        // Get the current location - this is set in the router
        var location = (Adapt.location._contentType) ?
            Adapt.location._contentType : Adapt.location._currentLocation;
        // Trigger initial scrollTo event
        Adapt.trigger(location+':scrollTo', selector);
        //Setup duration variable passed upon arguments
        var settings = (settings || {});
        var disableScrollToAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
        if (disableScrollToAnimation) {
            settings.duration = 0;
        }
        else if (!settings.duration) {
            settings.duration = $.scrollTo.defaults.duration;
        }

        var offsetTop = 0;
        if (Adapt.scrolling.isLegacyScrolling) {
            offsetTop = -$(".navigation").outerHeight();
            // prevent scroll issue when component description aria-label coincident with top of component
            if ($(selector).hasClass('component')) {
                offsetTop -= $(selector).find('.aria-label').height() || 0;
            }
        }

        if (!settings.offset) settings.offset = { top: offsetTop, left: 0 };
        if (settings.offset.top === undefined) settings.offset.top = offsetTop;
        if (settings.offset.left === undefined) settings.offset.left = 0;

        if (settings.offset.left === 0) settings.axis = "y";

        if (Adapt.get("_canScroll") !== false) {
            // Trigger scrollTo plugin
            $.scrollTo(selector, settings);
        }

        // Trigger an event after animation
        // 300 milliseconds added to make sure queue has finished
        _.delay(function() {
            $(selector).focusNext();
            Adapt.trigger(location+':scrolledTo', selector);
        }, settings.duration+300);
    };
    
});
