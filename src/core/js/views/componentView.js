define([
    'core/js/adapt',
    'core/js/views/adaptView'
], function(Adapt, AdaptView) {

    var ComponentView = AdaptView.extend({

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

        initialize: function(){
			//standard initialization + renderState function
            AdaptView.prototype.initialize.apply(this, arguments);
            this.renderState();
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

        renderState: function() {
            if (!Handlebars.partials['state']) return;

            // the preferred way to indicate that a state is not required
            if (this.model.get('_disableAccessibilityState')) return;
            // do not perform if component has .not-accessible class
            if (this.$el.is('.not-accessible')) return;
			// do not perform if component has .no-state class
            if (this.$el.is('.no-state')) return;

            var $previousState = this.$('.accessibility-state');
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
