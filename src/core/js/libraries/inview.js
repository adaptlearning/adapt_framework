/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 */
(function($){function getViewportHeight(){var height=window.innerHeight;var mode=document.compatMode;if(mode||!$.support.boxModel)height=mode=="CSS1Compat"?document.documentElement.clientHeight:document.body.clientHeight;return height}$(window).scroll(function(){var vpH=getViewportHeight(),scrolltop=document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop,elems=[];$.each($.cache,function(){if(this.events&&this.events.inview)elems.push(this.handle.elem)});if(elems.length)$(elems).each(function(){var $el=
$(this),top=$el.offset().top,height=$el.height(),inview=$el.data("inview")||false;if(scrolltop>top+height||scrolltop+vpH<top){if(inview){$el.data("inview",false);$el.trigger("inview",[false])}}else if(scrolltop<top+height)if(!inview){$el.data("inview",true);$el.trigger("inview",[true])}})});$(function(){$(window).scroll()})})(jQuery);