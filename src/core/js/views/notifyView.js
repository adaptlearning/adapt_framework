/*
* NotifyView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');

    var NotifyView = Backbone.View.extend({

        className: 'notify',
        escapeKeyAttached: false,

        initialize: function() {
            this.setupEventListeners();
            //include accessibility globals in notify model
            this.model.set('_globals', Adapt.course.get('_globals'));
            this.render();
        },

        setupEventListeners: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(Adapt, 'device:resize', this.resetNotifySize);
            this.listenTo(Adapt, 'accessibility:toggle', this.onAccessibilityToggle);
            this._onKeyUp = _.bind(this.onKeyUp, this);
            this.setupEscapeKey();
        },

        setupEscapeKey: function() {
            var hasAccessibility = Adapt.config.get('_accessibility')._isEnabled;
            if (!hasAccessibility && ! this.escapeKeyAttached) {
                $(window).on("keyup", this._onKeyUp);
                this.escapeKeyAttached = true;
            } else {
                $(window).off("keyup", this._onKeyUp);
                this.escapeKeyAttached = false;
            }
        },

        onAccessibilityToggle: function() {
            this.setupEscapeKey();
        },

        onKeyUp: function(event) {
            if (event.which != 27) return;
            event.preventDefault();

            this.closeNotify();
            Adapt.trigger('notify:closed');
        },

        events: {
            'click .notify-popup-alert-button':'onAlertButtonClicked',
            'click .notify-popup-prompt-button': 'onPromptButtonClicked',
            'click .notify-popup-done': 'onCloseButtonClicked',
            'click .notify-shadow': 'onCloseButtonClicked'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['notify'];
            this.$el.html(template(data)).appendTo('body');
            this.showNotify();
            return this;
        },

        onAlertButtonClicked: function(event) {
            event.preventDefault();
            //tab index preservation, notify must close before subsequent callback is triggered
            this.closeNotify();
            Adapt.trigger(this.model.get('_callbackEvent'), this);
        },

        onPromptButtonClicked: function(event) {
            event.preventDefault();
            //tab index preservation, notify must close before subsequent callback is triggered
            this.closeNotify();
            Adapt.trigger($(event.currentTarget).attr('data-event'));
        },

        onCloseButtonClicked: function(event) {
            event.preventDefault();
            //tab index preservation, notify must close before subsequent callback is triggered
            this.closeNotify();
            Adapt.trigger('notify:closed');
        },

        resetNotifySize: function() {
            $('.notify-popup').removeAttr('style');
            this.resizeNotify(true);
        },

        resizeNotify: function(noAnimation) {
            var windowHeight = $(window).height();
            var notifyHeight = this.$('.notify-popup').height();
            var animationSpeed = 400;
            if (notifyHeight > windowHeight) {
                this.$('.notify-popup').css({
                    'height':'100%', 
                    'top':0, 
                    'overflow-y': 'scroll', 
                    '-webkit-overflow-scrolling': 'touch',
                    'opacity': 1
                });
            } else {
                if (noAnimation) {
                    var animationSpeed = 0;
                }
                this.$('.notify-popup').css({
                    'margin-top': -(notifyHeight/2)-50, 'opacity': 0
                }).velocity({
                    'margin-top': -(notifyHeight/2), 'opacity':1
                }, animationSpeed);
            }
        },

        showNotify: function() {
            this.resizeNotify();
            this.$('.notify-popup').show();
            this.$('.notify-shadow').fadeIn('fast');
            //Set focus to first accessible element
            this.$('.notify-popup').a11y_focus();
                
        },

        closeNotify: function (event) {
            this.$el.fadeOut('fast', _.bind(function() {
                this.remove();
            }, this));
            Adapt.trigger('popup:closed');
            $(window).off("keyup", this._onKeyUp);
        }

    });

    return NotifyView;

});