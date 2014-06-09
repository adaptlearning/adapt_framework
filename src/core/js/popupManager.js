/*
* Device
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Kirsty Hames, Daryl Hedley
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');
    var scrollTop = 0;
    var $activeElement;
    var tabIndexElements = 'a, button, input, select, textarea';

    Adapt.on('popup:opened', function() {
    	scrollTop = $(window).scrollTop();
    	$activeElement = $(document.activeElement);
        $(tabIndexElements).attr('tabindex', -1);
    });

    Adapt.on('popup:closed', function() {
        $(window).scrollTop(scrollTop);
        $(tabIndexElements).attr('tabindex', 0);
        if ($activeElement) {
        	$activeElement.focus();
    	}
    });

});