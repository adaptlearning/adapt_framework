/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll
*/

define(function(require){

    var Handlebars = require('handlebars');
    
    Handlebars.registerHelper("lowerCase", function(text) {
	    return text.toLowerCase();
	});

	Handlebars.registerHelper("numbers", function(index) {
	    return index +1;
	});

	Handlebars.registerHelper("capitalise", function(text) {
		return text.charAt(0).toUpperCase() + str.slice(1);
	});

	Handlebars.registerHelper('odd',function (index) {
	    return (index +1) % 2 === 0  ? 'even' : 'odd';
	});
	    
    return Handlebars;
    
});
