define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var DrawerView = Backbone.View.extend({

        className: 'drawer display-none',
        disableAnimation: false,
        escapeKeyAttached: false,

        initialize: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this._isVisible = false;
            this.drawerDir = 'right';
            if(Adapt.config.get('_defaultDirection')=='rtl'){//on RTL drawer on the left
                this.drawerDir = 'left';
            }
            this.setupEventListeners();
            this.render();
            this.drawerDuration = Adapt.config.get('_drawer')._duration;
            this.drawerDuration = (this.drawerDuration) ? this.drawerDuration : 400;
            // Setup cached selectors
            this.$wrapper = $('#wrapper');
        },

        setupEventListeners: function() {
            this.listenTo(Adapt, 'navigation:toggleDrawer', this.toggleDrawer);
            this.listenTo(Adapt, 'drawer:triggerCustomView', this.openCustomView);
            this.listenTo(Adapt, 'drawer:closeDrawer', this.onCloseDrawer);
            this.listenTo(Adapt, 'remove', this.onCloseDrawer);
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

            this.onCloseDrawer();
        },

        events: {
            'click .drawer-back': 'onBackButtonClicked',
            'click .drawer-close':'onCloseDrawer'
        },

        render: function() {
            var template = Handlebars.templates['drawer']
            $(this.el).html(template({_globals: Adapt.course.get("_globals")})).prependTo('body');
            var shadowTemplate = Handlebars.templates['shadow'];
            $(shadowTemplate()).prependTo('body');
            // Set defer on post render
            _.defer(_.bind(function() {
                this.postRender();
            }, this));
            return this;
        },

        // Set tabindex for select elements
        postRender: function() {
            this.$('a, button, input, select, textarea').attr('tabindex', -1);

            this.checkIfDrawerIsAvailable();
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
            if (this.collection.length == 0) {
                $('.navigation-drawer-toggle-button').addClass('display-none');
                Adapt.trigger('drawer:noItems');
            } else {
                $('.navigation-drawer-toggle-button').removeClass('display-none');
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
                $('body').scrollDisable();
                this._isVisible = true;
            }

            var drawerWidth = this.$el.width();
            // Sets tab index to 0 for all tabbable elements in Drawer
            this.$('a, button, input, select, textarea').attr('tabindex', 0);

            if (emptyDrawer) {
                this.$('.drawer-back').addClass('display-none');
                this._isCustomViewVisible = false;
                this.emptyDrawer();
                if(this.collection.models.length === 1) {
                    Adapt.trigger(this.collection.models[0].get('eventCallback'));
                } else {
                    this.renderItems();
                    Adapt.trigger('drawer:openedItemView');
                }
            } else {
                if (this._hasBackButton && this.collection.models.length > 1) {
                    this.$('.drawer-back').removeClass('display-none');
                } else {
                    this.$('.drawer-back').addClass('display-none');
                }
                Adapt.trigger('drawer:openedCustomView');
            }

            //delay drawer animation until after background fadeout animation is complete
            if (this.disableAnimation) {
                $('#shadow').removeClass("display-none");

                var direction={};
                direction[this.drawerDir]=0;
                this.$el.css(direction);
                complete.call(this);
                
            } else {

                $('#shadow').velocity({opacity:1},{duration:this.drawerDuration, begin: _.bind(function() {
                    $("#shadow").removeClass("display-none");
                    complete.call(this);
                }, this)});

                var showEasingAnimation = Adapt.config.get('_drawer')._showEasing;
                var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';
                var direction={};
                direction[this.drawerDir]=0;
                this.$el.velocity(direction, this.drawerDuration, easing);

            }

            function complete() {
                this.addShadowEvent();
                Adapt.trigger('drawer:opened');
                
                //focus on first tabbable element in drawer
                this.$el.a11y_focus();
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
                $('body').scrollEnable();
            } else {
                return;
            }

            if (this.disableAnimation) {

                var direction={};
                direction[this.drawerDir]=-this.$el.width();
                this.$el.css(direction).addClass('display-none');

                $('#shadow').addClass("display-none");

                Adapt.trigger('drawer:closed');

            } else {

                var showEasingAnimation = Adapt.config.get('_drawer')._hideEasing;
                var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';

                var direction={};
                direction[this.drawerDir]=-this.$el.width();
                this.$el.velocity(direction, this.drawerDuration, easing, _.bind(function() {
                    this.$el.addClass('display-none');
                    Adapt.trigger('drawer:closed');
                }, this));

                $('#shadow').velocity({opacity:0}, {duration:this.drawerDuration, complete:function() {
                    $('#shadow').addClass("display-none");
                }});

            }

            this._isCustomViewVisible = false;
            this.removeShadowEvent();


        },

        addShadowEvent: function() {
            $('#shadow').one('click touchstart', _.bind(function() {
                this.onCloseDrawer();
            }, this));
        },

        removeShadowEvent: function() {
            $('#shadow').off('click touchstart');
        },

        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            $(window).off("keyup", this._onKeyUp);

            Adapt.trigger('drawer:empty');
            this.collection.reset();
            $('#shadow').remove();
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
