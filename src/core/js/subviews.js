define([
    'handlebars',
    'core/js/adapt'
], function(Handlebars, Adapt){

    var Subviews = Backbone.Controller.extend({

        initialize: function() {
            this._register = {};
            this._hold = {};
            this._addHelpers();
            this._addMutationObserver();
        },

        /**
         * Add the subview helper for handlebars
         * {{subview name="menu:progress" id="co-200"}}
         */
        _addHelpers: function() {
            Handlebars.registerHelper('subview', function(options) {
                var name = options.hash.name;
                var subview = Adapt.subviews.create(name, {
                    data: options.hash.model || this || {},
                    id: options.hash.id || null
                });
                if (!subview) return;
                var html = '<' + subview.el.tagName + ' data-subview-cid="'+subview.cid+'" />';
                return new Handlebars.SafeString(html);
            });
        },

        /**
         * Listen for new elements added to the document.body
         */
        _addMutationObserver: function() {
            var observer = new MutationObserver(this._onMutated.bind(this));
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        /**
         * Check newly added elements for subviews references
         * @param  {MutationList} list List of browser mutations
         */
        _onMutated: function(list) {
            var $placeholders = $([]);
            for (var i = 0, l = list.length; i < l; i++) {
                var mutation = list[i];
                var $news = $(mutation.addedNodes).find("[data-subview-cid]");
                if (!$news.length) continue;
                $placeholders = $placeholders.add($news);
            }
            if (!$placeholders.length) return;
            $placeholders.each(function(index, placeholder) {
                var $placeholder = $(placeholder);
                var cid = $placeholder.attr("data-subview-cid");
                var subview = this._hold[cid];
                $placeholder.replaceWith(subview.$el);
                delete this._hold[cid];
            }.bind(this));
        },

        /**
         * Register a named subview
         * @param  {String} name The name of your subview
         * @param  {Function} view The subview class
         */
        register: function(name, view) {
            this._register[name] = view;
        },

        /**
         * Return a subview class by name
         * @param  {String} name Name of the subview to return
         * @return {Function}
         */
        get: function(name) {
            return this._register[name];
        },

        /**
         * Create an instance of the named subview assigning it a model by id
         * @param  {String} name Named subview model
         * @param  {String} id   Subview model id
         * @return {Object}      Instantiated subview
         */
        create: function(name, data) {
            var Subview = this.get(name);
            if (!Subview) return;
            var model;
            // Find the original model by id if specified
            if (data.id) model = Adapt.findById(data.id);
            // If no model was found, create a new one from the data supplied
            if (!model) model = new Backbone.Model(data.model);
            var subview = new Subview({
                model: model
            });
            return this._hold[subview.cid] = subview;
        }

    });

    return Adapt.subviews = new Subviews();

});
