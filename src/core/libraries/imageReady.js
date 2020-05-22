//https://github.com/adaptlearning/jquery.imageready 2017-07-11

;(function( $ ) {

  if ($.fn.imageready) return;

  function isImageLoaded($img) {

    var img = $img[0];
    var hasNoSrc = !$img.attr("src");
    var isLazyLoading = ($img.attr('loading') === 'lazy');
    var isMarkedComplete = img.complete;
    var hasCorrectReadyState = img.readyState === 4;

    //has height reported by jquery
    var has$Height = ($img.height() > 0);
    //has height reported by image definition (ie9+)
    var hasNaturalHeight = (img.naturalHeight === undefined) ? true : (img.naturalHeight > 0);

    var hasValidHeight = has$Height && hasNaturalHeight;

    return hasNoSrc || isLazyLoading || isMarkedComplete || hasCorrectReadyState || hasValidHeight;

  }

  function getElementsByCSSAttributeName(name) {
    if (name === undefined) throw "Must specify a css attribute name";

    var tags = this.getElementsByTagName('*'), el;

    var rtn = [];

    var body = $("body")[0];

    if (body.currentStyle) { //ie

      var scriptName = changeCSSAttributeNameFormat(name);

      for (var i = 0, len = tags.length; i < len; i++) {

        el = tags[i];
        if (!el.currentStyle) continue;
        var hasNoValue = (el.currentStyle[scriptName] == 'none');
        if (hasNoValue) continue;

        rtn.push(el);

      }

    } else if (window.getComputedStyle) { //other

      for (var i = 0, len = tags.length; i < len; i++) {

        el = tags[i];

        var hasNoValue = (document.defaultView.getComputedStyle(el, null).getPropertyValue(name) == 'none');
        if (hasNoValue) continue;

        rtn.push(el);

      }

    }

    return rtn;
  }

  function changeCSSAttributeNameFormat(CSSName) {
    var noDash = CSSName.replace(/-/g," ");
    var titleCase = toTitleCase(noDash);
    var noSpace = titleCase.replace(/ /g, "");
    var lowerCaseStart = noSpace.substr(0,1).toLowerCase() + noSpace.substr(1);
    return lowerCaseStart;
  }

  function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  function getAllImages($set) {

    //get all child images
    var $images = $set.find("img").add( $set.filter("img") );

    //get all background images
    $set.each(function() {

      var $backgroundImageElements = $(getElementsByCSSAttributeName.call(this, "background-image"));
      $backgroundImageElements.each(function() {

        var $image = $(new Image());
        var backgroundImageValue = $(this).css("background-image");

        // stripCSSURL
        var matches = /url\(([^)]*)\)/g.exec(backgroundImageValue);
        if (matches === null) return;

        // stripCSSQuotes
        var url = matches[1].replace(/[\"\']/g, "");
        $image.attr('loading', 'eager');
        $image.attr("src", url);
        $images = $images.add($image);

      });

    });

    $images.loaded = 0;

    //return undefined if no images found
    if ($images.length === 0) return;
    return $images;

  }

  $.fn.imageready = function(callback, options) {
    //setup options
    options = options || {};
    if (options.allowTimeout === undefined) {
      options.allowTimeout = $.fn.imageready.allowTimeout;
      options.timeoutDuration = $.fn.imageready.timeoutDuration;
    }

    var $images = getAllImages(this);
    if (!$images) return callback();

    //callback timeout event
    var timeoutHandle;
    function check() {

      clearTimeout(timeoutHandle);
      var notLoadedImg = [];

      $images.each(function() {

        if (this._isImageReadyComplete) return;

        notLoadedImg.push(this);

        var $this = $(this);
        console.error("image not loaded in time", $this.attr("src"));

      });

      return callback($(notLoadedImg));
    }

    //callback load event
    function complete(event) {

      clearTimeout(timeoutHandle);

      var isAnEventCallback = (event && event.target);
      if (isAnEventCallback) {
        $images.loaded++;
        event.currentTarget._isImageReadyComplete = true;
      }

      var haveAllImagesLoaded = ($images.length <= $images.loaded);
      if (haveAllImagesLoaded) return callback();

      if (!options.allowTimeout) return;

      //set a new timeout as not all images have loaded
      timeoutHandle = setTimeout(check, options.timeoutDuration);

    }

    //attach load event listeners
    $images.each(function() {
      var $this = $(this);

      if (isImageLoaded($this)) return $images.loaded++;

      $this.one("load", complete);
      $this.one("error", complete);

      // hack for onload event not firing for cached images in IE9-11 http://garage.socialisten.at/2013/06/how-to-fix-the-ie9-image-onload-bug/
      // reset the src attribute
      $this.attr("src", $this.attr("src"));

    });

    //check if all images have been loaded already
    if ($images.length <= $images.loaded) return complete();

    //setup timeout event
    if (!options.allowTimeout) return;

    //set a timeout to callback on slow / missing image load
    timeoutHandle = setTimeout(check, options.timeoutDuration)

  }

  $.fn.imageready.timeoutDuration = 1;
  $.fn.imageready.allowTimeout = false;

}) ( jQuery );
