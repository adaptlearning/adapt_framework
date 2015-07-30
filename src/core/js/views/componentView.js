define(function(require) {

    var Adapt = require("coreJS/adapt");
    var AdaptView = require('coreViews/adaptView');

    var ComponentView = AdaptView.extend({

        className: function() {
            return "component "
            + this.model.get('_component')
            + "-component " + this.model.get('_id')
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " component-" + this.model.get('_layout')
            + " nth-child-" + this.model.get("_nthChild");
        },

        initialize: function(){
			//standard initialization + renderState function
            AdaptView.prototype.initialize.apply(this, arguments);
            this.renderState();
        },

        renderState: function() {
            if (!Handlebars.partials['state']) return;

			// do not perform if component has .not-accessible class
            if (this.$el.is(".not-accessible")) return;
			// do not perform if component has .no-state class
            if (this.$el.is(".no-state")) return;

			//remove pre-exisiting states
            var $previousState = this.$(".accessibility-state").remove();

            //render and append state partial
            var $rendered = $(Handlebars.partials['state']( this.model.toJSON() ));

            //restore previous tab index if not on
            var previousTabIndex = $previousState.find(".aria-label").attr("tabindex");
            if (previousTabIndex == "-1") {
                $rendered.find(".aria-label").attr("tabindex", previousTabIndex);
            }

            this.$el.append( $rendered );

            this.listenToOnce(this.model, 'change:_isComplete', this.renderState);
        },

        postRender: function() {}

    }, {
        type:'component'
    });

    return ComponentView;

});
