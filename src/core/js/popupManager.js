define(function(require) {

    var Adapt = require('coreJS/adapt');
    var scrollTop = 0;
    var $activeElement;

    Adapt.on('popup:opened', function() {
    	scrollTop = $(window).scrollTop();
    	$activeElement = $(document.activeElement);
        $('a, button, input').attr('tabindex', -1);
    });

    Adapt.on('popup:closed', function() {
        $(window).scrollTop(scrollTop);
        $('a, button, input').attr('tabindex', 0);
        if ($activeElement) {
        	$activeElement.focus();
    	}
    });

});