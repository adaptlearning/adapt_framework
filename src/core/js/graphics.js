define([
  'core/js/adapt',
  'handlebars',
  'inview'
],function(Adapt, Handlebars) {

  var Graphics = Backbone.Controller.extend({

    initialize: function() {
      _.bindAll(this, "_onScroll", "_delayedThreholdIncrease", "_checkImage");
      this._onScroll = _.throttle(this._onScroll, 100);
      this._delayedThreholdIncrease = _.debounce(this._delayedThreholdIncrease, 500);
      this._offscreenPixelThreshold = 0;
      this._registerHelpers();
      this.listenTo(Adapt, "app:dataReady", this._onDataReady);
    },

    _registerHelpers: function() {

      var helpers = {

        "graphic": function(options) {

          var noArgs = (arguments.length === 1);
          // if no options were passed and no local _graphic object is defined, return
          if (noArgs && typeof this._graphic !== "object") return "";
          // if no options were passed and the _graphic object is defined, use it
          if (noArgs && this._graphic) options = this._graphic;
          // if options were passed but were not an object, return
          if (!options || typeof options !== "object") return "";

          var imageWidth = Adapt.graphics.getImageSize();

          // 'small' or 'large' or 'src' or '_src'
          var rtn = options[imageWidth] || options.src || options._src || "";

          if (!Adapt.graphics.isActive() || options._canLazyLoad === false) {
            return new Handlebars.SafeString('src="'+rtn+'"');
          }

          // produce a dummy image of the right size or ratio to put in place
          var width = options._width || 16;
          var height = options._height || 9;
          var canvas = $('<canvas width="'+width+'" height="'+height+'" >')[0];
          var context = canvas.getContext("2d");
          context.fillStyle = options._color || "#ffffff";
          context.fillRect(0, 0, width, height);
          var data = canvas.toDataURL("image/jpeg", 0.1);
          return new Handlebars.SafeString('src="'+data+'" data-adapt-graphics="'+rtn+'"');

        }

      };

      for (var name in helpers) {
        Handlebars.registerHelper(name, helpers[name]);
      }

    },

    getImageSize: function() {
      var screenWidth = Adapt.device.screenSize;
      return screenWidth === 'medium' ? 'small' : screenWidth;
    },

    _onDataReady: function() {
      if (!this.isActive()) return;
      this._setUpEventListeners();
    },

    isActive: function() {
      if (!this.isEnabled()) return false;
      var graphics = Adapt.config.get("_graphics");
      var className = graphics._className;
      var $html = $("html");
      if (!className || $html.is(className) || $html.hasClass(className)) return true;
      return false;
    },

    isEnabled: function() {
      var graphics = Adapt.config.get("_graphics");
      if (!graphics || !graphics._isEnabled) return false;
      return true;
    },

    _setUpEventListeners() {
      this.listenTo(Adapt, {
        "pageView:postRender menuView:postRender": this._onPostRender,
        "remove": this._onRemove
      });
    },

    _onPostRender: function(view) {
      // wait for page / menu to be ready
      if (view.model.get("_isReady")) return this._startScrollListener ();
      this.listenToOnce(view.model, "change:_isReady", this._startScrollListener );
    },

    _startScrollListener: function() {
      this._offscreenPixelThreshold = 0;
      $(window).on("scroll", this._onScroll);
      this._onScroll();
    },

    _onScroll: function() {
      var $progImages = $("img[data-adapt-graphics], video[data-adapt-graphics-poster]");
      if (!$progImages.length) return this._stopScrollListener();
      $progImages.each(this._checkImage);
      if (!this._offscreenPixelThreshold) this._delayedThreholdIncrease();
    },

    _stopScrollListener: function() {
      $(window).off("scroll", this._onScroll);
    },

    _checkImage: function(index, img) {
      var $img = $(img);

      var measurements = this._getElementMeasurements($img);

      var percentInview = measurements.percentInview;
      var bottom = measurements.bottom;
      var top = measurements.top;

      var isFarOffscreenBottom = (bottom < this._offscreenPixelThreshold);
      var isFarOffscreenTop = (top < this._offscreenPixelThreshold);
      var isFarOffscreen = (isFarOffscreenBottom || isFarOffscreenTop);

      var isNotInview = (!percentInview);

      if (isNotInview && isFarOffscreen) return;

      // replace dummy image with image for video tag
      if ($img.is("video")) {
        img.poster = $img.attr("data-adapt-graphics-poster");
        $img.removeAttr("data-adapt-graphics-poster");
        return;
      }

      // replace dummy image with image for img tag
      img.src = $img.attr("data-adapt-graphics");
      $img.removeAttr("data-adapt-graphics");

    },

    _getElementMeasurements: function($img) {
      var hasSpace = this._isElementOccupyingSpace($img[0]);
      if (hasSpace) return $img.onscreen();

      // the image is currently hidden
      var $parent = $(this._findSpaciousParent($img[0]));
      if (!$parent.length) return;
      // use spacious parent measurements
      return $parent.onscreen();
    },

    _isElementOccupyingSpace: function(el) {
      return Boolean(el.clientHeight || el.clientWidth)
    },

    _findSpaciousParent: function(el) {
      while (el = el.parentNode) {
        if (this._isElementOccupyingSpace(el)) return el;
      }
    },

    _delayedThreholdIncrease: function() {
      // increase the offscreen threshold for loading images
      this._offscreenPixelThreshold = -window.innerHeight*2;
      this._onScroll();
    },

    _onRemove: function() {
      this._stopScrollListener();
    }

  });

  return Adapt.graphics = new Graphics();

});
