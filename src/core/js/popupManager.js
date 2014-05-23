define(function(require) {

    var Adapt = require('coreJS/adapt');
    var scrollTop = 0;

    Adapt.on('popup:opened', function() {
        scrollTop = $(window).scrollTop();
    });

    Adapt.on('popup:closed', function() {
        $(window).scrollTop(scrollTop);
    });

});