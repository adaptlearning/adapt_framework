define([
  'core/js/adapt'
], function(Adapt) {

  var HeadingView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(Adapt.parentView, 'postRemove', this.remove);
      this.listenTo(this.model, 'change:_isComplete', this.render);
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
      var isComplete = this.model.get('_isComplete');
      this.$el
        .toggleClass('is-complete', isComplete)
        .toggleClass('is-incomplete', !isComplete);
    }

  }, {
    template: 'heading'
  });

  return HeadingView;

});
