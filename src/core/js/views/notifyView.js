define([
    'core/js/adapt'
], function(Adapt) {

    var NotifyView = Backbone.View.extend({

        className: function() {
            var classes = 'notify ';
            classes += (this.model.get('_classes') || '');
            return classes;
        },

        attributes: {
            'role': 'dialog',
            'aria-labelledby': 'notify-heading',
            'aria-modal': 'true'
        },

        disableAnimation: false,
        isOpen: false,

        initialize: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;

            this.setupEventListeners();

            this.render();
        },

        setupEventListeners: function() {
            this.listenTo(Adapt, {
                'remove page:scrollTo': this.closeNotify,
                'notify:resize': this.resetNotifySize,
                'notify:cancel': this.cancelNotify,
                'notify:close': this.closeNotify,
                'device:resize': this.resetNotifySize
            });

            this._onKeyUp = this.onKeyUp.bind(this);
            this.setupEscapeKey();
        },

        setupEscapeKey: function() {
            $(window).on('keyup', this._onKeyUp);
        },

        onKeyUp: function(event) {
            if (event.which != 27) return;
            event.preventDefault();

            this.cancelNotify();
        },

        events: {
            'click .notify-popup-alert-button':'onAlertButtonClicked',
            'click .notify-popup-prompt-button': 'onPromptButtonClicked',
            'click .notify-popup-done': 'onCloseButtonClicked',
            'click .notify-shadow': 'onShadowClicked'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['notify'];

            //hide notify container
            this.$el.css('visibility', 'hidden');
            //attach popup + shadow
            this.$el.html(template(data)).prependTo('body');
            //hide popup
            this.$('.notify-popup').css('visibility', 'hidden');
            //show notify container
            this.$el.css('visibility', 'visible');

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
            this.cancelNotify();
        },

        onShadowClicked: function(event) {
            event.preventDefault();
            if (this.model.get("_closeOnShadowClick") === false) return;
            this.cancelNotify();
        },

        cancelNotify: function() {
            if (this.model.get("_isCancellable") === false) return;
            //tab index preservation, notify must close before subsequent callback is triggered
            this.closeNotify();
            Adapt.trigger('notify:cancelled');
        },

        resetNotifySize: function() {
            $('.notify-popup').removeAttr('style');

            this.resizeNotify();
        },

        resizeNotify: function() {
            var windowHeight = $(window).height();
            var notifyHeight = this.$('.notify-popup').outerHeight();

            if (notifyHeight > windowHeight) {
                this.$('.notify-popup').css({
                    'height':'100%',
                    'top':0,
                    'overflow-y': 'scroll',
                    '-webkit-overflow-scrolling': 'touch'
                });
            } else {
                this.$('.notify-popup').css({
                    'margin-top': -(notifyHeight/2)
                });
            }
        },

        showNotify: function() {
            this.isOpen = true;
            this.addSubView();

            Adapt.trigger('notify:opened', this);

            this.$el.imageready(loaded.bind(this));

            function loaded() {
                if (this.disableAnimation) {
                    this.$('.notify-shadow').css('display', 'block');
                } else {

                    this.$('.notify-shadow').velocity({ opacity: 0 }, { duration: 0 }).velocity({ opacity: 1 }, {duration: 400, begin: function() {
                        this.$('.notify-shadow').css('display', 'block');
                    }.bind(this)});

                }

                this.resizeNotify();

                if (this.disableAnimation) {

                    this.$('.notify-popup').css('visibility', 'visible');
                    complete.call(this);

                } else {

                    this.$('.notify-popup').velocity({ opacity: 0 }, { duration: 0 }).velocity({ opacity: 1 }, { duration: 400, begin: function() {
                        this.$('.notify-popup').css('visibility', 'visible');
                        complete.call(this);
                    }.bind(this)});

                }

                function complete() {
                    /*ALLOWS POPUP MANAGER TO CONTROL FOCUS*/
                    Adapt.trigger('popup:opened', this.$('.notify-popup'));
                    $('body').scrollDisable();
                    $('html').addClass('notify');

                    //set focus to first accessible element
                    this.$('.notify-popup').a11y_focus();
                }
            }

        },

        addSubView: function() {

            this.subView = this.model.get("_view");
            if (!this.subView) return;

            this.$(".notify-popup-content-inner").append(this.subView.$el);

        },

        closeNotify: function (event) {
            //prevent from being invoked multiple times - see https://github.com/adaptlearning/adapt_framework/issues/1659
            if (!this.isOpen) return;
            this.isOpen = false;

            if (this.disableAnimation) {

                this.$('.notify-popup').css('visibility', 'hidden');
                this.$el.css('visibility', 'hidden');

                this.remove();

            } else {

                this.$('.notify-popup').velocity({ opacity: 0 }, {duration: 400, complete: function() {
                    this.$('.notify-popup').css('visibility', 'hidden');
                }.bind(this)});

                this.$('.notify-shadow').velocity({ opacity: 0 }, {duration: 400, complete:function() {
                    this.$el.css('visibility', 'hidden');
                    this.remove();
                }.bind(this)});
            }

            $('body').scrollEnable();
            $('html').removeClass('notify');

            Adapt.trigger('popup:closed notify:closed');
        },

        remove: function() {
            this.removeSubView();
            $(window).off('keyup', this._onKeyUp);
            Backbone.View.prototype.remove.apply(this, arguments);
        },

        removeSubView: function() {
            if (!this.subView) return;
            this.subView.remove();
            this.subView = null;

        }

    });

    return NotifyView;

});
