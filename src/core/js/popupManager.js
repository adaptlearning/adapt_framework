/*
* popupManager
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
    	
    	//save tab indexes
        $(tabIndexElements).each(function(index, item) {
            var $item = $(item);
            $item.attr('ptabindex', $item.attr('tabindex') );
            $item.attr('tabindex', -1);
        });
    });

    Adapt.on('popup:closed', function() {
        $(window).scrollTop(scrollTop);

        //restore tab indexes
        $(tabIndexElements).each(function(index, item) {
            var $item = $(item);
           var pti = parseInt($item.attr('ptabindex'));
            if (pti === undefined || isNaN(pti)) {
                $item.attr('tabindex', 0);
                return;
            }
            $item.attr('ptabindex', "");
            $item.attr('tabindex', pti);
        });

        if ($activeElement) {
            if($activeElement.is(':visible')) {
                $activeElement.focus();
            } else {
                $activeElement.next().focus();
            }
        	
    	}
    });

});
