//https://github.com/cgkineo/jquery.imageready 2015-08-28

;(function( $ ) {

	if ($.fn.imageready) return;
	
	var stripCSSURL = /url\(([^)]*)\)/g;
	var stripCSSQuotes = /[\"\']/g;

	$.fn.imageready = function(callback, options) {
		//setup options
		options = options || {};
		if (options.allowTimeout === undefined) {
			options.allowTimeout = $.fn.imageready.allowTimeout;
			options.timeoutDuration = $.fn.imageready.timeoutDuration;
		}

		//get all child images
		var $images = this.find("img").add( this.filter("img") );
		if ($images.length === 0) return callback();
		$images.loaded = 0;

		//get all background images
		this.each(function() {
			var $backgroundImageElements = $(getElementsByCSSAttributeName.call(this, "background-image"));
			$backgroundImageElements.each(function() {
				var $backgroundImage = $(new Image());
				var backgroundImageValue = $(this).css("background-image");
				var matches = stripCSSURL.exec(backgroundImageValue);
				if (matches === null) return;
				var url = matches[1];
				url = url.replace(stripCSSQuotes, "");
				$backgroundImage.attr("src", url);
				$images.add($backgroundImage);
				$images = $images.add($backgroundImage);
				$images.loaded = 0;
			});
		});

		//attach load event listeners
		$images.each(function() {
			var $this = $(this);
			if (!$this.attr("src") || this.complete || this.readyState === 4 || $this.height() > 0 ) {
				$images.loaded++;
				return;
			}
			$this.one("load", complete);
			
			// hack for onload event not firing for cached images in IE9 http://garage.socialisten.at/2013/06/how-to-fix-the-ie9-image-onload-bug/
			if(document.documentMode && document.documentMode === 9) {
				$this.attr("src", $this.attr("src"));
			}
		});

		//check if all images have been loaded already
		if ($images.length <= $images.loaded) {
			return complete();
		}

		//setup timeout event
		var timeoutHandle;
		if (options.allowTimeout) {
			timeoutHandle = setTimeout(check, options.timeoutDuration)
		}

		//callback timeout event
		function check() {
			clearTimeout(timeoutHandle);
			var notLoaded = [];
			$images.each(function() {
				var $this = $(this);
				if (!$this.attr("src") || this.complete || this.readyState === 4 || $this.height() > 0 ) {
					console.error("failed to hear load of image", $this.attr("src"));
					return;
				} else {
					notLoaded.push(this);
				}
			});
			return callback($(notLoaded));
		}

		//callback load event
		function complete(event) {
			clearTimeout(timeoutHandle);
			if (event && event.target) {
				$images.loaded++;
			}
			if ($images.length <= $images.loaded) {
				return callback();
			}
			if (options.allowTimeout) {
				timeoutHandle = setTimeout(check, options.timeoutDuration);
			}
		}

	}
	$.fn.imageready.timeoutDuration = 10000;
	$.fn.imageready.allowTimeout = true;


	function getElementsByCSSAttributeName(name) {
		if (name === undefined) throw "Must specify a css attribute name";

		var tags = this.getElementsByTagName('*'), el;

		var rtn = [];
		for (var i = 0, len = tags.length; i < len; i++) {
		    el = tags[i];
		    if (el.currentStyle) { //ie

		    	var scriptName = changeCSSAttributeNameFormat(name);
		        if( el.currentStyle[scriptName] !== 'none' ) {
		        	rtn.push(el);
		        }

		    } else if (window.getComputedStyle) { //other
		    	
		        if( document.defaultView.getComputedStyle(el, null).getPropertyValue(name) !== 'none' ) {
		        	rtn.push(el);
		        }

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


}) ( jQuery );
