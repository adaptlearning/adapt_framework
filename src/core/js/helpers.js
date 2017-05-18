define([
    'handlebars',
    'core/js/adapt'
], function(Handlebars, Adapt){

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

        /**
         * Allow JSON to be a template i.e. you can use handlebars {{expressions}} within your JSON
         */
        compile: function(template, context) {
            if (!template) return "";
            if (template instanceof Object) template = template.toString();
            return Handlebars.compile(template)(context || this);
        },

        /**
         * Allow JSON to be a template and accessible text
         */
        compile_a11y_text: function(template, context) {
            if (!template) return "";
            if (template instanceof Object) template = template.toString();
            return Handlebars.helpers.a11y_text.call(this, helpers.compile.call(this, template, context));
        },

        /**
         * Allow JSON to be a template and normalized text
         */
        compile_a11y_normalize: function(template, context) {
            if (!template) return "";
            if (template instanceof Object) template = template.toString();
            return Handlebars.helpers.a11y_normalize.call(this, helpers.compile.call(this, template, context));
        },

        /**
         * makes the _globals object in course.json available to a template
         */ 
        import_globals: function(context) {
            if(!context.data.root._globals) {
                context.data.root._globals = Adapt.course.get('_globals');
            }
            return "";
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
