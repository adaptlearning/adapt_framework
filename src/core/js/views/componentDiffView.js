define([
    "core/js/adapt",
    './adaptDiffView'
], function(Adapt, AdaptDiffView) {

    // Abstract view - Do not instantiate directly, please extend first

    var ComponentDiffView = AdaptDiffView.extend({

        className: function className() {

            return this.normalizeClassNames([
                "component",
                this.model.get('_component') + "-component " + this.model.get('_id'),
                this.model.get('_classes'),
                this.setVisibility(),
                this.model.get('_layout'),
                "nth-child-" + this.model.get("_nthChild")
            ]);

        }

    }, {
        type:'component'
    });

    return ComponentDiffView;

});
