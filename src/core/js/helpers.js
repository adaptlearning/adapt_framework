/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Alan Bourne, Chris Jones
*/
define(function(require){

    var Handlebars = require('handlebars'),
        helpers = {
            lowerCase: function(text) {
                return text.toLowerCase();
            },
            numbers: function(index) {
                return index +1;
            },
            capitalise:  function(text) {
                return text.charAt(0).toUpperCase() + str.slice(1);
            },
            odd: function (index) {
                return (index +1) % 2 === 0  ? 'even' : 'odd';
            }
        };

    for(var name in helpers) {
       if(helpers.hasOwnProperty(name)) {
             Handlebars.registerHelper(name, helpers[name]);
        }
    }
    return helpers;
});