/*
* AdaptView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt');

    var AdaptView = Backbone.View.extend({
        
        initialize: function() {
            this.model.set('_isReady', false);
            this.listenTo(Adapt, 'remove', this.remove);
            this.preRender();
            this.render();
        },
        
        preRender: function() {},
        
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
                    var $ParentContainer = this.$(this.constructor.childContainer);
                    $ParentContainer.append(new ChildView({model:model, $parent:$ParentContainer}).$el);
                }
            }, this);
        },
      
        setReadyStatus: function() {
            this.model.set('_isReady', true);
        },
      
        setCompletionStatus: function() {
            this.model.set('_isComplete', true);
        }
        
    });
    
    return AdaptView;
    
});