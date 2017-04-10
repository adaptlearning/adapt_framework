define([
    'core/js/adapt'
], function(Adapt) {

    Adapt.on('popup:opened', function($element) {

		//capture currently active element or element specified
        var $activeElement = $element || $(document.activeElement);

        //save tab indexes
        $activeElement.a11y_popup();
    });

    Adapt.on('popup:closed', function() {

        //restore tab indexes
        $.a11y_popdown();

    });

});
