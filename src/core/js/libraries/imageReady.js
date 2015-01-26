// jquery.imageready.js
// @weblinc, @jsantell, (c) 2012

(function(e){e.fn.imageready=function(t,n){function o(){s--;!s&&t()}function u(){var e,t;this.one("load",o);t=navigator.appName.indexOf("Internet Explorer")!=-1?true:false;if(t){var n=this.attr("src"),i=n.match(/\?/)?"&":"?";i+=r.cachePrefix+"="+(new Date).getTime();this.attr("src",n+i)}}var r=e.extend({},e.fn.imageready.defaults,n),i=this.find("img").add(this.filter("img")),s=i.length;if(t==null){t=function(){}}return i.each(function(){var t=e(this);if(!t.attr("src")){o();return}this.complete||this.readyState===4?o():u.call(t)})};e.fn.imageready.defaults={cachePrefix:"random"}})(jQuery)
