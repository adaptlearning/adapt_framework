define([
    'core/js/adapt'
], function(Adapt){

    var SubView = Backbone.View.extend({

        /**
         * Initialize, render and run stub function
         */
        initialize: function() {
            this.render();
            this.init();
        },

        /**
         * Stub for post initialization behaviour
         */
        init: function() {},

        /**
         * Render template and trigger events
         */
        render: function() {
            Adapt.trigger("subView:preRender", this);
            var templateName = this.constructor.template;
            var template = Handlebars.templates[templateName];
            var data = this.model.toJSON();
            this.$el.html(template(data));
            Adapt.trigger("subView:render", this);
            _.defer(function() {
                Adapt.trigger("subView:postRender", this);
            }.bind(this));
        },

        /**
         * Return string representation of parent element for use as
         * a placeholder in template rendering.
         * @return {String} Placeholder string
         */
        getOuterHTML: function() {
            var attributes = [];
            for (var i = 0, l = this.el.attributes.length; i < l; i++) {
                var attribute = this.el.attributes[i];
                attributes.push(attribute.name+'="'+attribute.value+'"');
            }
            var tagName = this.el.tagName;
            return '<'+tagName+' '+attributes.join(' ')+'></'+tagName+'>';
        },

        /**
         * Replace a placeholder with this view's parent element, trigger
         * attachment events and run stub function
         */
        replaceElement: function(element) {
            var $element = $(element);
            Adapt.trigger("subView:attach", this);
            $element.replaceWith(this.$el);
            this.attach();
            Adapt.trigger("subView:attached", this);
        },

        /**
         * Stub for post attachment behaviour
         */
        attach: function() {},

        /**
         * Clear up view and trigger removal events
         */
        remove: function() {
            Adapt.trigger("subView:remove", this);
            Backbone.View.prototype.remove.apply(this, arguments);
            Adapt.trigger("subView:removed", this);
        }

    });

    return SubView;

});
