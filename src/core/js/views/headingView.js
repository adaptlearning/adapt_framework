define([
    'core/js/adapt'
], function(Adapt) {

    var HeadingView = Backbone.View.extend({

        initialize: function() {
            this.listenTo(Adapt, "remove", this.remove);
            this.listenTo(this.model, "change:_isComplete", this.onComplete);

            this.$el.attr({
                'aria-live': 'polite',
                'aria-atomic': 'true'
            });

            this.render();
            this.checkCompletion();
        },

        render: function() {
            var template = Handlebars.templates[this.constructor.template];
            var data = this.model.toJSON();
            this.$el.html(template(data));
        },

        onComplete: function() {
            this.render();
            this.checkCompletion();
        },

        checkCompletion: function() {
            var isComplete = this.model.get("_isComplete");
            this.$el
            .toggleClass("complete", isComplete)
            .toggleClass("incomplete", !isComplete);
        }

    }, {
        template: 'heading'
    });

    return HeadingView;

});
