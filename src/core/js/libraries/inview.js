/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/, http://remysharp.com/downloads/jquery.inview.js
 * Extended for Kineo to trigger inviewTop and inview events, to enable capture when all of an element has been in view on-screen.
 * Extended for Kineo by Gavin McMaster <gavin.mcmaster@kineo.com>
 */
(function ($) {
    var d = document, w = window, documentElement = d.documentElement;   
  
    function getViewportSize() {
        var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };
    
        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight/clientWidth (which has the wrong value).
        if (!size.height) {
          mode = d.compatMode;
          if (mode || !$.support.boxModel) { // IE, Gecko
            domObject = mode === 'CSS1Compat' ?
              documentElement : // Standards
              d.body; // Quirks
            size = {
              height: domObject.clientHeight,
              width:  domObject.clientWidth
            };
          }
        }
    
        return size;
      }
 
    $(window).scroll(function () {
        var vpH = getViewportSize().height,
            vpW = getViewportSize().width,
            scrolltop = (document.documentElement.scrollTop ?
                document.documentElement.scrollTop :
                document.body.scrollTop),
            wrapperWidth = $("#wrapper").width(),
            wrapperOffsetLeft = $("#wrapper").offset().left,
            navbarHeight,
            elems = [];
        
        // allow for elemnents being out of view behind top nav bar
        navbarHeight = ($('#navigation').height() === null) ? 0 : $('#navigation').height();
            
        // naughty, but this is how it knows which elements to check for
        $.each($.cache, function () {
            if (this.events && this.events.inview) {
                elems.push(this.handle.elem);
            }
        });
        
        //console.log("wrapper width: "+ wrapperWidth + ", offset left: "+ wrapperOffsetLeft);
        
        if (elems.length) {
            $(elems).each(function () {
                var $el = $(this),
                    top = $el.offset().top - navbarHeight,
                    offsetLeft = $el.offset().left,
                    posLeft = $el.position().left,
                    height = $el.height(),
                    width = $el.width(),
                    inview = $el.data('inview') || false,
                    inviewTop =  $el.data('inviewTop') || false
                  
                //console.log("scrolltop: " + scrolltop + ", top: " + top + ", height: " + height + ", vpH: " + vpH);
                //console.log("inview: " + inview + ", inviewTop: " + inviewTop);
                
                if(top > scrolltop && top < (scrolltop + vpH)) {
                    if(!inviewTop){
                        $el.data('inviewTop', true);
                        $el.trigger('inviewTop', [ true ]);
                    }                    
                }                
                          
                // we want to know when all of the component is in view and we only need to trigger this event once
                if (((scrolltop + vpH) > (top + height)) && (offsetLeft >= 0 && offsetLeft < (wrapperOffsetLeft + wrapperWidth) && (posLeft + width) <= wrapperWidth) ) {
                    if(!inview){
                        $el.data('inview', true);
                        $el.trigger('inview', [ true ]);
                    }
                } 
            });
        }
    });
    
    // kick the event to pick up any elements already in view.
    // note however, this only works if the plugin is included after the elements are bound to 'inview'
    $(function () {
        $(window).scroll();
    });
})(jQuery);