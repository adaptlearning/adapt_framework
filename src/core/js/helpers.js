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
                return text.charAt(0).toUpperCase() + text.slice(1);
            },
            odd: function (index) {
                return (index +1) % 2 === 0  ? 'even' : 'odd';
            },
            if_value_equals: function(value, text, block) {
                if (value === text) {
                    return block.fn(this);
                } else {
                    return block.inverse(this);
                }
            },
            math: function(lvalue, operator, rvalue, options) {
                lvalue = parseFloat(lvalue);
                rvalue = parseFloat(rvalue);
                switch (operator) {
                case "+": return lvalue + rvalue;
                case "-": return lvalue - rvalue;
                case "*": return lvalue * rvalue;
                case "/": return lvalue / rvalue;
                case "%": return lvalue % rvalue;
                }
            }
        };

    for(var name in helpers) {
       if(helpers.hasOwnProperty(name)) {
             Handlebars.registerHelper(name, helpers[name]);
        }
    }
    return helpers;
});
