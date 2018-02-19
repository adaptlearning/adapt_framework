define([
    'core/js/adapt',
    'core/js/views/adaptView'
], function(Adapt, AdaptView) {

    var ComponentView = AdaptView.extend({

        className: function() {
            return "component " + 
            this.model.get('_component') + 
            "-component " + this.model.get('_id') + 
            " " + this.model.get('_classes') + 
            " " + this.setVisibility() +
            " " + this.setHidden() +
            " component-" + this.model.get('_layout') + 
            " nth-child-" + this.model.get("_nthChild") +
            " " + (this.model.get('_isComplete') ? 'completed' : '');
        },

        initialize: function(){
			//standard initialization + renderState function
            AdaptView.prototype.initialize.apply(this, arguments);
            this.renderState();
        },

        renderState: function() {
            if (!Handlebars.partials['state']) return;

            // the preferred way to indicate that a state is not required
            if (this.model.get('_disableAccessibilityState')) return;
            // do not perform if component has .not-accessible class
            if (this.$el.is(".not-accessible")) return;
			// do not perform if component has .no-state class
            if (this.$el.is(".no-state")) return;

            var $previousState = this.$(".accessibility-state");
            var isStateRendered = $previousState.length;

            var data = _.extend(this.model.toJSON(), {a11yConfig: Adapt.config.get('_accessibility')});
            var element = Handlebars.partials['state'](data);

            if (isStateRendered) {
                $previousState.html(element);
            } else {
                this.$el.append(element);
            }

            this.listenToOnce(this.model, 'change:_isComplete', this.renderState);
        },

        postRender: function() {}

    }, {
        type:'component'
    });

    return ComponentView;

});
