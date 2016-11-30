define([
    'handlebars'
], function(Handlebars){

    var helpers = {

        lowercase: function(text) {
            return text.toLowerCase();
        },
        
        capitalise:  function(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },

        inc: function(index) {
            return index+1;
        },

        dec: function(index) {
            return index-1;
        },

        odd: function (index) {
            return (index +1) % 2 === 0  ? 'even' : 'odd';
        },

        equals: function(value, text, block) {
            return helpers.compare.call(this, value, "==", text, block);
        },

        compare: function(value, operator, text, block) {
            // Comparison operators
            switch (operator) {
            case "===":
                if (value === text) return block.fn(this);
                break;
            case "=": case "==":
                if (value == text) return block.fn(this);
                break;
            case ">=":
                if (value >= text) return block.fn(this);
                break;
            case "<=":
                if (value <= text) return block.fn(this);
                break;
            case ">":
                if (value > text) return block.fn(this);
                break;
            case "<":
                if (value < text) return block.fn(this);
                break;
            }
            return block.inverse(this);
        },

        math: function(lvalue, operator, rvalue, options) {
            // Mathematical operators
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            switch (operator) {
            case "+": return lvalue + rvalue;
            case "-": return lvalue - rvalue;
            case "*": return lvalue * rvalue;
            case "/": return lvalue / rvalue;
            case "%": return lvalue % rvalue;
            }
        },

        compile: function(template, context) {
            // Allow JSON to be a template
            if (!template) return "";
            return Handlebars.compile(template)(context || this);
        },

        compile_a11y_text: function(template, context) {
            // Allow JSON to be a template and accessible text
            if (!template) return "";
            return Handlebars.helpers.a11y_text.call(this, helpers.compile.call(this, template, context));
        },

        compile_a11y_normalize: function(template, context) {
            // Allow JSON to be a template and normalized text
            if (!template) return "";
            return Handlebars.helpers.a11y_normalize.call(this, helpers.compile.call(this, template, context));
        }

    };

    // Compatibility references
    helpers['if_value_equals'] = helpers['equals'];
    helpers['numbers'] = helpers['inc'];
    helpers['lowerCase'] = helpers['lowercase'];

    for (var name in helpers) {
        if (helpers.hasOwnProperty(name)) {
             Handlebars.registerHelper(name, helpers[name]);
        }
    }

    return helpers;

});
