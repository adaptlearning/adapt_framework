define([
    'core/js/adapt',
    'core/js/views/adaptView'
], function(Adapt, AdaptView) {

    var ComponentView = AdaptView.extend({

        attributes: function() {
            if (!this.model.get("_isA11yRegionEnabled")) {
                return AdaptView.resultExtend('attributes', {}, this);
            }
            return AdaptView.resultExtend('attributes', {
                "aria-labelledby": this.model.get('_id')+"-heading",
                "role": "region"
            }, this);
        },

        className: function() {
            return [
                'component',
                this.model.get('_component') +'-component',
                this.model.get('_id'),
                this.model.get('_classes'),
                this.setVisibility(),
                this.setHidden(),
                'component-' + this.model.get('_layout'),
                'nth-child-' + this.model.get('_nthChild'),
                (this.model.get('_isComplete') ? 'completed' : '')
            ].join(' ');
        },

        renderState: function() {
            Adapt.log.warn("REMOVED - renderState is removed and moved to item title");
        },

        /**
         * Allows components that want to use inview for completion to set that up
         * @param {string} [inviewElementSelector] Allows to you to specify (via a selector) which DOM element to use for inview.
         * Defaults to `'.component-inner'` if not supplied.
         * @param {function} [callback] Allows you to specify what function is called when the component has been viewed, should
         * you want to perform additional checks before setting the component to completed - see adapt-contrib-assessmentResults
         * for an example. Defaults to `view.setCompletionStatus` if not specified.
         */
        setupInviewCompletion: function(inviewElementSelector, callback) {
            this.$inviewElement = this.$(inviewElementSelector || '.component-inner');
            this.inviewCallback = (callback || this.setCompletionStatus);

            this.$inviewElement.on('inview.componentView', this.onInview.bind(this));
        },

        removeInviewListener: function() {
            if (!this.$inviewElement) return;
            this.$inviewElement.off('inview.componentView');
            this.$inviewElement = null;
        },

        onInview: function(event, visible, visiblePartX, visiblePartY) {
            if (!visible) return;

            switch (visiblePartY) {
                case 'top':
                    this.hasSeenTop = true;
                    break;
                case 'bottom':
                    this.hasSeenBottom = true;
                    break;
                case 'both':
                    this.hasSeenTop = this.hasSeenBottom = true;
            }

            if (!this.hasSeenTop || !this.hasSeenBottom) return;

            this.inviewCallback();

            if (this.model.get('_isComplete')) {
                this.removeInviewListener();
            }
        },

        postRender: function() {},

        remove: function() {
            this.removeInviewListener();

            AdaptView.prototype.remove.call(this);
        }

    }, {
        type:'component'
    });

    return ComponentView;

});
