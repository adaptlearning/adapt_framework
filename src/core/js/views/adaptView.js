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
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(this.model, 'change:_isVisible', this.toggleVisibility);
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
            
            _.defer(_.bind(function() {
               this.postRender(); 
            }, this));

            return this;
        },
      
        addChildren: function() {
            var nthChild = 0;
            this.model.getChildren().each(function(model) {
                if (model.get('_isAvailable')) {
                    nthChild ++;
                    var ChildView = this.constructor.childView || Adapt.componentStore[model.get("_component")];
                    var $parentContainer = this.$(this.constructor.childContainer);
                    $parentContainer.append(new ChildView({model:model, $parent:$parentContainer, nthChild:nthChild}).$el);
                }
            }, this);
        },
      
        setReadyStatus: function() {
            this.model.set('_isReady', true);
        },
      
        setCompletionStatus: function() {
            if (this.model.get('_isVisible')) {
                this.model.set('_isComplete', true);
            }
        },

        remove: function() {
            this.model.setOnChildren('_isReady', false);
            this.model.set('_isReady', false);
            this.$el.remove();
            this.stopListening();
            return this;
        },

        setVisibility: function() {
            var visible = "visibility-hidden";
            if (this.model.get('_isVisible')) {
                visible = "";
            }
            return visible;
        },

        toggleVisibility: function() {
            if (this.model.get('_isVisible')) {
                return this.$el.removeClass('visibility-hidden');
            }
            this.$el.addClass('visibility-hidden');
        }
        
    });
    
    return AdaptView;
    
});