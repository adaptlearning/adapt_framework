define([
  './adapt',
  './views/headingView'
], function(Adapt, HeadingView) {

  var Headings = Backbone.Controller.extend({

    initialize: function() {
      this.listenTo(Adapt, 'view:render', this.onViewRender);
    },

    onViewRender: function(view) {
      var $headingSeats = view.$('.js-heading');
      $headingSeats.each(function(index, el) {
        new HeadingView({
          el: el,
          model: view.model
        });
      });
    }

  });

  return new Headings();

});
