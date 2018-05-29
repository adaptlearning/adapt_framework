define([
    'core/js/adapt'
], function(Adapt) {

    Adapt.on('popup:opened', function($element) {

        //capture currently active element or element specified
        var $activeElement = $element || $(document.activeElement);

        //save tab indexes
        $activeElement.a11y_popup();
    });

    Adapt.on('popup:closed', function($toElement) {

        //restore tab indexes
        var $launchedElement = $.a11y_popdown();
        var $activeElement = $toElement || $launchedElement;

        if ($activeElement) {
            return $activeElement.focusOrNext();
        }

        // focus on the first readable element
        $.a11y_focus();

    });

});
