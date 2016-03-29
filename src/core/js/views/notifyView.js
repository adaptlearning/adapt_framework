define(function(require) {

    var Adapt = require('coreJS/adapt');

    var NotifyView = Backbone.View.extend({

        className: 'notify',
        disableAnimation: false,
        escapeKeyAttached: false,

        initialize: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;

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
            var hasAccessibility = Adapt.config.has('_accessibility') && Adapt.config.get('_accessibility')._isActive;

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

            //hide notify container
            this.$el.css("visibility", "hidden");
            //attach popup + shadow
            this.$el.html(template(data)).prependTo('body');
            //hide popup
            this.$('.notify-popup').css("visibility", "hidden");
            //show notify container
            this.$el.css("visibility", "visible");

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
            Adapt.trigger("notify:cancelled");
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

            Adapt.trigger('notify:opened', this);

            if (this.$("img").length > 0) {
                this.$el.imageready( _.bind(loaded, this));
            } else {
                loaded.call(this);
            }

            function loaded() {
                if (this.disableAnimation) {
                    this.$('.notify-shadow').css("display", "block");
                } else {

                    this.$('.notify-shadow').velocity({ opacity: 0 }, {duration:0}).velocity({ opacity: 1 }, {duration:400, begin: _.bind(function() {
                        this.$('.notify-shadow').css("display", "block");
                    }, this)});

                }

                this.resizeNotify();

                if (this.disableAnimation) {

                    this.$('.notify-popup').css("visibility", "visible");
                    complete.call(this);
                    
                } else {

                    this.$('.notify-popup').velocity({ opacity: 0 }, {duration:0}).velocity({ opacity: 1 }, { duration:400, begin: _.bind(function() {
                        this.$('.notify-popup').css("visibility", "visible");
                        complete.call(this);
                    }, this) });

                }
                
                function complete() {
                    /*ALLOWS POPUP MANAGER TO CONTROL FOCUS*/
                    Adapt.trigger('popup:opened', this.$('.notify-popup'));
                    $('body').scrollDisable();
                    
                    //set focus to first accessible element
                    this.$('.notify-popup').a11y_focus();
                }
            }

        },

        closeNotify: function (event) {

            if (this.disableAnimation) {

                this.$('.notify-popup').css("visibility", "hidden");
                this.$el.css("visibility", "hidden");

                this.remove();

            } else {

                this.$('.notify-popup').velocity({ opacity: 0 }, {duration:400, complete: _.bind(function() {
                    this.$('.notify-popup').css("visibility", "hidden");
                }, this)});

                this.$('.notify-shadow').velocity({ opacity: 0 }, {duration:400, complete:_.bind(function() {
                    this.$el.css("visibility", "hidden");
                    this.remove();
                }, this)});
            }

            $('body').scrollEnable();
            Adapt.trigger('popup:closed');
            Adapt.trigger('notify:closed');
        }

    });

    return NotifyView;

});
