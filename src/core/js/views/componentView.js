define([
    'core/js/adapt',
    'core/js/views/adaptView'
], function(Adapt, AdaptView) {

    var ComponentView = AdaptView.extend({

        attributes: function() {
            return AdaptView.resultExtend('attributes', {
                "aria-labelledby": this.model.get('_id')+"-heading",
                "role": "region"
            }, this);
        },

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

        renderState: function() {
            Adapt.log.warn("REMOVED - renderState is removed and moved to item title");
        },

        postRender: function() {}

    }, {
        type:'component'
    });

    return ComponentView;

});
