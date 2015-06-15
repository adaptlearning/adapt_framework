/*
* NotifyView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');

    var NotifyView = Backbone.View.extend({

        className: 'notify',
        disableAnimation: false,
        escapeKeyAttached: false,

        initialize: function() {
            this.disableAnimation = $("html").is(".ie8");

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

            //hide notify container
            this.$el.css("visibility", "hidden");
            //attach popup + shadow
            this.$el.html(template(data)).appendTo('body');
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
            Adapt.trigger('notify:closed');
        },

        resetNotifySize: function() {
            $('.notify-popup').removeAttr('style');

            this.resizeNotify();
        },

        resizeNotify: function() {
            var windowHeight = $(window).height();
            var notifyHeight = this.$('.notify-popup').height();

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

            if (this.disableAnimation) {

                this.$('.notify-shadow').css("display", "block");

            } else {

                this.$('.notify-shadow').velocity({ opacity: 1 }, {duration:200, begin: _.bind(function() {
                    this.$('.notify-shadow').css("display", "block");
                }, this)});

            }

            this.disableBodyScrollbars();

            if (this.$("img").length > 0) {
                this.$el.imageready( _.bind(loaded, this));
            } else {
                loaded.call(this);
            }

            function loaded() {
                this.resizeNotify();

                if (this.disableAnimation) {

                    this.$('.notify-popup').css("visibility", "visible");

                } else {

                    //delay popup fadein until after background animations
                    _.delay(_.bind(function() {
                        
                        this.$('.notify-popup').velocity({ opacity: 0 }, {duration:0}).velocity({ opacity: 1 }, { duration:200, begin: _.bind(function() {
                            this.$('.notify-popup').css("visibility", "visible");
                        }, this) });
                        
                        /*ALLOWS POPUP MANAGER TO CONTROL FOCUS*/
                        Adapt.trigger('popup:opened', this.$el);

                        //set focus to first accessible element
                        this.$('.notify-popup').a11y_focus();

                    }, this), 200);
                }
            }

        },

        closeNotify: function (event) {
            
            if (this.disableAnimation) {

                this.$('.notify-popup').css("visibility", "hidden");
                this.$el.css("visibility", "hidden");

                this.enableBodyScrollbars();

                this.remove();

            } else {

                this.$('.notify-popup').velocity({ opacity: 0 }, {duration:200, complete: _.bind(function() {
                    this.$('.notify-popup').css("visibility", "hidden");
                }, this)});

                this.enableBodyScrollbars();

                //delay background fadeout animations until after popup has faded out
                _.delay(_.bind(function() {

                    this.$('.notify-shadow').velocity({ opacity: 0 }, {duration:300, complete:_.bind(function() {
                        this.$el.css("visibility", "hidden");
                        this.remove();
                    }, this)});

                }, this), 200);
            }

            Adapt.trigger('popup:closed');
        },

        disableBodyScrollbars: function(callback) {
            this._scrollTop = $(window).scrollTop();
            this._bodyHeight = $("body").css("height");
            this._htmlHeight = $("html").css("height");

            if (this.disableAnimation) {

                $('html').css({
                    "height": "100%"
                });
                $('body').css({
                    "height": "100%",
                    "overflow-y": "hidden"
                });

                $('#wrapper').css({
                    "position": "relative",
                    "top": "-"+ this._scrollTop +"px"
                });

            } else {

                $('.page, .menu').velocity({opacity:0}, {duration:1, complete:_.bind(function() {

                    $('.page, .menu').css("visibility", "hidden");              
                    //wait for renderer to catch-up with fade out
                    _.delay(_.bind(function(){

                        //this causes the content to jump 
                        $('html').css({
                            "height": "100%"
                        });
                        $('body').css({
                            "height": "100%",
                            "overflow-y": "hidden"
                        });

                        //puts the content back to where it should be
                        $('#wrapper').css({
                            "position": "relative",
                            "top": "-"+ this._scrollTop +"px"
                        });
                        
                        //wait for renderer to catch-up with jump
                        _.delay(_.bind(function() {
                            $('.page, .menu').css("visibility", "visible");
                            $('.page, .menu').velocity({opacity:1}, {duration:600});
                        }, this), 50);

                    }, this), 50);

                },this)});
            }
            
        },

        enableBodyScrollbars: function() {

            if (this.disableAnimation) {

                $('html').css({
                    "height": ""
                });
                $('body').css({
                    "height": "",
                    "overflow-y": ""
                });
                $('#wrapper').css({
                    "position": "relative",
                    "top": ""
                });
                $(window).scrollTo(this._scrollTop); 

            } else {

                $('.page, .menu').velocity({opacity:0}, {duration:1, complete:_.bind(function() {

                    $('.page, .menu').css("visibility", "hidden");

                    //this causes the content to jump
                    $('html').css({
                        "height": ""
                    });

                    var height = "";

                    if (this._htmlHeight != this._bodyHeight) {
                        height = this._bodyHeight;
                    }

                    $('body').css({
                        "height": height,
                        "overflow-y": ""
                    });
                    $('#wrapper').css({
                        "position": "relative",
                        "top": ""
                    });

                    //wait for renderer to catch-up with jump
                    _.delay(_.bind(function() {

                        $('.page, .menu').css("visibility", "visible");

                        //puts the content back to where it should be
                        $(window).scrollTo(this._scrollTop);     
                        
                        $('.page, .menu').velocity({opacity:1}, {duration: 300 });

                    }, this), 50);    

                }, this)});
            }

        }

    });

    return NotifyView;

});