define([
    'core/js/adapt'
], function(Adapt) {

    var HeadingView = Backbone.View.extend({

        attributes: {
            'aria-live': 'polite',
            'aria-atomic': 'true'
        },

        initialize: function() {
            this.listenTo(Adapt, "remove", this.remove);
            this.listenTo(this.model, "change:_isComplete", this.render);
            this.$el.attr(this.attributes);
            this.render();
        },

        render: function() {
            var template = Handlebars.templates[this.constructor.template];
            var data = this.model.toJSON();
            var customHeadingType = this.$el.attr('data-a11y-heading-type');
            if (customHeadingType) data._type = customHeadingType;
            this.$el.html(template(data));
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
