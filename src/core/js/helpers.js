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
         * Equivalent to:
         *  if (conditionA || conditionB)
         * @example
         * {{#any displayTitle body instruction}}
         * <div class="component__header {{_component}}__header"></div>
         * {{/any}}
         */
        any: function() {
            var args = Array.prototype.slice.call(arguments, 0, -1);
            var block = Array.prototype.slice.call(arguments, -1)[0];

            return _.any(args) ? block.fn(this) : block.inverse(this);
        },

        /**
         * Equivalent to:
         *  if (conditionA && conditionB)
         * @example
         * {{#all displayTitle body instruction}}
         * <div class="component__header {{_component}}__header"></div>
         * {{/all}}
         */
        all: function() {
            var args = Array.prototype.slice.call(arguments, 0, -1);
            var block = Array.prototype.slice.call(arguments, -1)[0];

            return _.all(args) ? block.fn(this) : block.inverse(this);
        },

        /**
         * Allow JSON to be a template i.e. you can use handlebars {{expressions}} within your JSON
         */
        compile: function(template, context) {
            if (!template) return "";
            if (template instanceof Object) template = template.toString();
            var data = this;
            if (context) {
                // choose between a passed argument context or the default handlebars helper context
                data = (!context.data || !context.data.root ? context : context.data.root);
            }
            return Handlebars.compile(template)(data);
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
         * Remove all html tags except styling tags
         */
        compile_a11y_remove_breaks: function(template, context) {
            if (!template) return "";
            return Handlebars.helpers.a11y_remove_breaks.call(this, helpers.compile.call(this, template, context));
        },

        /**
         * makes the _globals object in course.json available to a template
         */
        import_globals: function(context) {
            if (context.data.root._globals) return "";
            context.data.root._globals = Adapt.course.get('_globals');
            return "";
        },

        /**
         * makes the Adapt module data available to a template
         */
        import_adapt: function(context) {

            if (context.data.root.Adapt) return;
            var adapt = context.data.root.Adapt = {};

            var i, l, name;

            var directImport = ['config','course'];
            for (i = 0, l = directImport.length; i < l; i++) {
                name = directImport[i];
                // convert the model to a json object and add to the current context
                adapt[name] = Adapt[name].toJSON();
            }

            var indexedImport = ['contentObjects','articles','blocks','components'];
            for (i = 0, l = indexedImport.length; i < l; i++) {
                name = indexedImport[i];
                // convert the collection of models to an array of json objects
                var importArray = Adapt[name].toJSON();
                // convert the array of json models to an object indexed by id
                var importIndex = {};
                for (var i1 = 0, l1 = importArray.length; i1 < l1; i1++) {
                    var item = importArray[i1];
                    importIndex[item._id] = item;
                }
                // add the indexed object to the current context
                adapt[name] = importIndex;
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
