define([
    'core/js/views/adaptView'
    ], function(AdaptView) {

    var BlockView = AdaptView.extend({

        className: function() {
            var _classes = this.model.has('_classes') ? " " + this.model.get('_classes'):"";
            return "block "
            + this.model.get('_id')
            + _classes
            + " " + this.setVisibility()
            + " nth-child-"
            + this.model.get("_nthChild");
        }

    }, {
        childContainer: '.component-container',
        type: 'block',
        template: 'block'
    });

    return BlockView;

});
