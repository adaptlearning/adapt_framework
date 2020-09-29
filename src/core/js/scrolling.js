define([
  'core/js/adapt',
  'core/js/models/contentObjectModel'
], function(Adapt, ContentObjectModel) {

  class Scrolling extends Backbone.Controller {

    initialize() {
      this.$html = null;
      this.$app = null;
      this.isLegacyScrolling = true;
      this._checkApp();
      Adapt.once('configModel:dataLoaded', this._loadConfig.bind(this));
    }

    _checkApp() {
      this.$html = $('html');
      this.$app = $('#app');
      if (this.$app.length) return;
      this.$app = $('<div id="app">');
      $('body').append(this.$app);
      this.$app.append($('#wrapper'));
      Adapt.log.warn('UPDATE - Your html file needs to have #app adding. See https://github.com/adaptlearning/adapt_framework/issues/2168');
    }

    _loadConfig() {
      const config = Adapt.config.get('_scrollingContainer');
      if (!config || !config._isEnabled) return;
      const limitTo = config._limitToSelector;
      const isIncluded = !limitTo || (this.$html.is(limitTo) || this.$html.hasClass(limitTo));
      if (!isIncluded) return;
      this.isLegacyScrolling = false;
      this._addStyling();
      this._fixJQuery();
      this._fixScrollTo();
      this._fixBrowser();
    }

    _addStyling() {
      this.$html.addClass('adapt-scrolling');
    }

    _fixJQuery() {
      const selectorScrollTop = $.fn.scrollTop;
      const $app = Adapt.scrolling.$app;
      $.fn.scrollTop = function() {
        if (this[0] === window || this[0] === document.body) {
          return selectorScrollTop.apply($app, arguments);
        }
        return selectorScrollTop.apply(this, arguments);
      };
      const selectorOffset = $.fn.offset;
      $.fn.offset = function(coordinates) {
        if (coordinates) {
          return selectorOffset.apply(this, arguments);
        }
        const $app = Adapt.scrolling.$app;
        const $element = this;
        const elementOffset = selectorOffset.call($element);
        const isCorrectedContainer = $element.is('html, body, #app') ||
          $element.parents().is('#app');
        if (!isCorrectedContainer) {
          // Do not adjust the offset measurement as not in $app container and isn't html or body
          return elementOffset;
        }
        // Adjust measurement by scrolling and offset of $app container
        const scrollTop = parseInt($app.scrollTop());
        const scrollLeft = parseInt($app.scrollLeft());
        const appOffset = selectorOffset.call($app);
        elementOffset.top += (scrollTop - appOffset.top);
        elementOffset.left += (scrollLeft - appOffset.left);
        return elementOffset;
      };
    }

    _fixScrollTo() {
      const selectorScrollTo = $.fn.scrollTo;
      const scrollTo = $.scrollTo;
      const $app = Adapt.scrolling.$app;
      $.fn.scrollTo = function(target, duration, settings) {
        if (this[0] === window || this[0] === document.body) {
          return selectorScrollTo.apply($app, arguments);
        }
        return selectorScrollTo.apply(this, arguments);
      };
      $.scrollTo = function(target, duration, settings) {
        return selectorScrollTo.apply($app, arguments);
      };
      Object.assign($.scrollTo, scrollTo);
    }

    _fixBrowser() {
      const app = Adapt.scrolling.$app[0];
      window.scrollTo = function(x, y) {
        app.scrollTop = y || 0;
        app.scrollLeft = x || 0;
      };
      const $window = $(window);
      this.$app.on('scroll', () => {
        $window.scroll();
      });
    }

    /**
     * Allows a selector to be passed in and Adapt will scroll to this element. Resolves
     * asynchronously when the element has been navigated/scrolled to.
     * Backend for Adapt.scrollTo
     * @param {string} selector CSS selector of the Adapt element you want to navigate to e.g. `".co-05"`
     * @param {Object} [settings={}] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
     * @param {Object} [settings.replace=false] Set to `true` if you want to update the URL without creating an entry in the browser's history.
     */
    async scrollTo(selector, settings = {}) {
      Adapt.log.deprecated('Adapt.scrollTo and Adapt.scrolling.scrollTo, use Adapt.navigateToElement instead.');
      return Adapt.router.navigateToElement(selector, settings);
    }

  }

  Adapt.scrolling = new Scrolling();

  Adapt.scrollTo = Adapt.scrolling.scrollTo.bind(Adapt.scrolling);

  return Adapt.scrolling;

});
