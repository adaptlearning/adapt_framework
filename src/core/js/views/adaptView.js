/*
* AdaptView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["backbone", "handlebars", "coreJS/adapt"], function(Backbone, Handlebars, Adapt) {
    
    var AdaptView = Backbone.View.extend({
        
        initialize: function() {
            this.model.set('_ready', false);
            this.listenTo(Adapt, 'remove', this.remove);
            this.init();
            Adapt.trigger(this.model.get('_type') + 'View:preRender', this);
            this.render();
            Adapt.trigger(this.model.get('_type') + 'View:postRender', this);
            this.postRender();
        },
        
        init: function() {},
        
        postRender: function() {},
        
        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.template];
            this.$el.html(template(data)).appendTo(this.$parent);
            return this;
        }
        
    });
    
    return AdaptView;
    
});