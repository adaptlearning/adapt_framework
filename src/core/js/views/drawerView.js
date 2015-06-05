/*
* Drawer
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>, Himanshu Rajotia <himanshu.rajotia@credipoint.com>
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var DrawerView = Backbone.View.extend({

        className: 'drawer display-none',
        disableAnimation: false,

        initialize: function() {
            this.disableAnimation = $("html").is(".ie8");
            this._isVisible = false;
            this.drawerDir = 'right';
            if(Adapt.config.get('_defaultDirection')=='rtl'){//on RTL drawer on the left
                this.drawerDir = 'left';
            }
            this.listenTo(Adapt, 'navigation:toggleDrawer', this.toggleDrawer);
            this.listenTo(Adapt, 'drawer:triggerCustomView', this.openCustomView);
            this.listenToOnce(Adapt, 'adapt:initialize', this.checkIfDrawerIsAvailable);
            this.listenTo(Adapt, 'drawer:closeDrawer', this.onCloseDrawer);
            this.listenTo(Adapt, 'remove', this.onCloseDrawer);
            this.render();
            this.drawerDuration = Adapt.config.get('_drawer')._duration;
            this.drawerDuration = (this.drawerDuration) ? this.drawerDuration : 400;
            // Setup cached selectors
            this.$wrapper = $('#wrapper');
        },

        events: {
            'click .drawer-back': 'onBackButtonClicked',
            'click .drawer-close':'onCloseDrawer'
        },

        render: function() {
            var template = Handlebars.templates['drawer']
            $(this.el).html(template({_globals: Adapt.course.get("_globals")})).appendTo('body');
            var shadowTemplate = Handlebars.templates['shadow'];
            $(shadowTemplate()).appendTo('body');
            // Set defer on post render
            _.defer(_.bind(function() {
                this.postRender();
            }, this));
            return this;
        },

        // Set tabindex for select elements
        postRender: function() {
            this.$('a, button, input, select, textarea').attr('tabindex', -1);
        },

        openCustomView: function(view, hasBackButton) {
            // Set whether back button should display
            this._hasBackButton = hasBackButton;
            this._isCustomViewVisible = true;
            Adapt.trigger('drawer:empty');
            this.showDrawer();
            this.$('.drawer-holder').html(view);
        },

        checkIfDrawerIsAvailable: function() {
            if(this.collection.length == 0) {
                $('.navigation-drawer-toggle-button').addClass('display-none');
                Adapt.trigger('drawer:noItems');
            }
        },

        onBackButtonClicked: function(event) {
            event.preventDefault();
            this.showDrawer(true);
        },

        onCloseDrawer: function(event) {
            if (event) {
                event.preventDefault();
            }
            this.hideDrawer();
        },

        toggleDrawer: function() {
            if (this._isVisible && this._isCustomViewVisible === false) {
                this.hideDrawer();
            } else {
                this.showDrawer(true);
            }
        },

        showDrawer: function(emptyDrawer) {

            this.$el.removeClass('display-none');
            //only trigger popup:opened if drawer is visible, pass popup manager drawer element
            if (!this._isVisible) {
                Adapt.trigger('popup:opened', this.$el);

                this._isVisible = true;
            }

            var drawerWidth = this.$el.width();
            // Sets tab index to 0 for all tabbable elements in Drawer
            this.$('a, button, input, select, textarea').attr('tabindex', 0);

            if (emptyDrawer) {
                this.$('.drawer-back').addClass('display-none');
                this._isCustomViewVisible = false;
                this.emptyDrawer();
                this.renderItems();
                Adapt.trigger('drawer:openedItemView');
            } else {
                if (this._hasBackButton) {
                    this.$('.drawer-back').removeClass('display-none');
                } else {
                    this.$('.drawer-back').addClass('display-none');
                }
                Adapt.trigger('drawer:openedCustomView');
            }

            //delay drawer animation until after background fadeout animation is complete
            if (this.disableAnimation) {

                $('#shadow').removeClass("display-none");

                this.disableBodyScrollbars();

                var direction={};
                direction[this.drawerDir]=0;
                this.$el.css(direction);
                this.addShadowEvent();
                Adapt.trigger('drawer:opened');

                //focus on first tabbable element in drawer
                //defer to stop focus jumping content
                this.$el.a11y_focus();

            } else {

                $('#shadow').velocity({opacity:1},{duration:200, begin: function() {
                        $("#shadow").removeClass("display-none");
                    }});

                this.disableBodyScrollbars();

                _.delay(_.bind(function() {
                    
                    var showEasingAnimation = Adapt.config.get('_drawer')._showEasing;
                    var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';
                    var direction={};
                    direction[this.drawerDir]=0;
                    this.$el.velocity(direction, this.drawerDuration, easing);
                    this.addShadowEvent();
                    Adapt.trigger('drawer:opened');

                    //focus on first tabbable element in drawer
                    //defer to stop focus jumping content
                    this.$el.a11y_focus();

                }, this), 200);

            }
        },

        emptyDrawer: function() {
            this.$('.drawer-holder').empty();
        },

        renderItems: function() {
            Adapt.trigger('drawer:empty');
            this.emptyDrawer();
            var models = this.collection.models;
            for (var i = 0, len = models.length; i < len; i++) {
                var item = models[i];
                new DrawerItemView({model: item});
            }
        },

        hideDrawer: function() {
            //only trigger popup:closed if drawer is visible
            if (this._isVisible) {
                Adapt.trigger('popup:closed');
                this._isVisible = false;
            } else {
                return;
            }

            if (this.disableAnimation) {

                var direction={};
                direction[this.drawerDir]=-this.$el.width();
                this.$el.css(direction).addClass('display-none');
                
                this._isCustomViewVisible = false;
                this.removeShadowEvent();

                this.enableBodyScrollbars();

                $('#shadow').addClass("display-none");

            } else {

                var showEasingAnimation = Adapt.config.get('_drawer')._hideEasing;
                var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';

                var duration = Adapt.config.get('_drawer')._duration;
                duration = (duration) ? duration : 400;

                var direction={};
                direction[this.drawerDir]=-this.$el.width();
                this.$el.velocity(direction, this.drawerDuration, easing, _.bind(function() {
                    this.$el.addClass('display-none');
                }, this));
                
                this._isCustomViewVisible = false;
                this.removeShadowEvent();

                this.enableBodyScrollbars();

                //delay background fadeout until after drawer animation is complete
                _.delay(_.bind(function(){
                
                    $('#shadow').velocity({opacity:0}, {duration:200, complete:function() {
                        $('#shadow').addClass("display-none");
                    }});

                }, this), duration + 50);

            }

            Adapt.trigger('drawer:closed');
        },

        addShadowEvent: function() {
            $('#shadow').one('click touchstart', _.bind(function() {
                this.onCloseDrawer();
            }, this));
        },

        removeShadowEvent: function() {
            $('#shadow').off('click touchstart');
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
                    $('body').css({
                        "height": "",
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

    var DrawerItemView = Backbone.View.extend({

        className: 'drawer-item',

        initialize: function() {
            this.listenTo(Adapt, 'drawer:empty', this.remove);
            this.render();
        },

        events: {
            'click .drawer-item-open': 'onDrawerItemClicked'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['drawerItem']
            $(this.el).html(template(data)).appendTo('.drawer-holder');
            return this;
        },

        onDrawerItemClicked: function(event) {
            event.preventDefault();
            var eventCallback = this.model.get('eventCallback');
            Adapt.trigger(eventCallback);
        }
    });

    return DrawerView;
});
