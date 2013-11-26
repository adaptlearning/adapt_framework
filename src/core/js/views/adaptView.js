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
        },
        
        init: function() {},
        
        postRender: function() {
            this.addChildren();
        },
        
        render: function() {
            Adapt.trigger(this.model.get('_type') + 'View:preRender', this);
          
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
            
            Adapt.trigger(this.model.get('_type') + 'View:postRender', this);
            this.postRender();

            return this;
        },
      
        addChildren: function() {
            this.model.getChildren().each(function(model) {
                if (model.get('_isAvailable')) {
                    var ChildView = this.constructor.childView || Adapt.componentStore[model.get("_component")];
                    this.$(this.constructor.childContainer).append(new ChildView({model:model}).render().$el);
                }
            }, this);
        },
      
        setReadyStatus: function() {
            this.model.set('_isReady', true);
        },
      
        setCompletionStatus: function() {
            this.model.set('_complete', true);
        }
        
    });
    
    return AdaptView;
    
});