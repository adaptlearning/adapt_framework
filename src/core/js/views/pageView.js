define([
    'core/js/adapt',
    'core/js/views/adaptView',
    'core/js/views/articleView'
], function(Adapt, AdaptView, ArticleView) {

    var PageView = AdaptView.extend({

        className: function() {
            return "page " +
            this.model.get('_id') +
            " " + this.model.get('_classes') +
            " " + this.setVisibility();
        },

        preRender: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },

        render: function() {
            Adapt.trigger(this.constructor.type + 'View:preRender', this);

            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];

            // Create fragment that we will build the views in, preventing many page reflows
            this.fragment = this.getFragmentFromHTML(template(data));

            // don't call postRender after remove
            if (this._isRemoved) {
                return this;
            }

            this.postRender();

            _.defer(_.bind(function() {
                Adapt.trigger(this.constructor.type + 'View:postRender', this);
            }, this));

            return this;
        },

        postRender: function() {
            this.addChildren(this.fragment);
            this.$el.append(this.fragment);
            this.fragment = null;
        },

        addChildren: function(fragment) {
            var nthChild = 0;
            var children = this.model.getChildren();
            var models = children.models;
            for (var i = 0, len = models.length; i < len; i++) {
                var model = models[i];
                if (model.get('_isAvailable')) {
                    nthChild ++;

                    var ChildView;
                    var ViewModelObject = this.constructor.childView || Adapt.componentStore[model.get("_component")];

                    //use view+model object
                    if (ViewModelObject.view) ChildView = ViewModelObject.view;
                    //use view only object
                    else ChildView = ViewModelObject;

                    if (ChildView) {
                        model.set("_nthChild", nthChild);
                        fragment.appendChild(new ChildView({model:model}).el);
                    } else {
                        throw 'The component \'' + models[i].attributes._id + '\'' +
                            ' (\'' + models[i].attributes._component + '\')' +
                            ' has not been installed, and so is not available in your project.';
                    }
                }
            }
        },

        getFragmentFromHTML: function(html) {
            var fragment = document.createDocumentFragment();
            var content = document.createElement('div');
            content.innerHTML = html;
            while(content.firstChild) {
                fragment.appendChild(content.firstChild);
            }

            return fragment;
        },

        isReady: function() {
            if (this.model.get('_isReady')) {
                _.defer(_.bind(function() {
                    $('.loading').hide();
                    $(window).scrollTop(0);
                    Adapt.trigger('pageView:ready', this);
                    var styleOptions = { opacity: 1 };
                    if (this.disableAnimation) {
                        this.$el.css(styleOptions);
                        $.inview();
                    } else {
                        this.$el.velocity(styleOptions, {
                            duration: 'fast',
                            complete: function() {
                                $.inview();
                            }
                        });
                    }
                    $(window).scroll();
                }, this));
            }
        }

    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        type: 'page',
        template: 'page'
    });

    return PageView;

});
