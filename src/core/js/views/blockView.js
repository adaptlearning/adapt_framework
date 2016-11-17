define([
    'core/js/views/adaptView'
    ], function(AdaptView) {

    var BlockView = AdaptView.extend({

        className: function() {
            return "block "
            + this.model.get('_id')
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " nth-child-"
            + this.model.get("_nthChild");
        },

        onscreen: function(event, measurement) {
            if (measurement.onscreen === false) return;

            var onScreenConfig = this.model.get('_onScreen');
            var classes = onScreenConfig._classes || 'onscreen';
            var percentInviewVertical = onScreenConfig._percentInviewVertical || 33;

            if (measurement.percentInviewVertical >= percentInviewVertical) {
                this.$el.addClass(classes).off('onscreen');
            }
        },

        enableOnScreen: function() {            
            if (this.model.has('_onScreen')) {
                if (this.model.get('_onScreen')._isEnabled === true) {
                    return true;
                }
            }
            return false;
        },

        postRender: function() {
            if (this.enableOnScreen()) {
                this.$el.on('onscreen', _.bind(this.onscreen, this));
            }

            AdaptView.prototype.postRender.apply(this, arguments);
        },

        remove: function() {
            this.$el.off('onscreen');
            AdaptView.prototype.remove.apply(this, arguments);
        }

    }, {
        childContainer: '.component-container',
        type: 'block',
        template: 'block'
    });

    return BlockView;

});
