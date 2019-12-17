define([
  './adapt',
  './views/headingView'
], function(Adapt, HeadingView) {

  var Headings = Backbone.Controller.extend({

    initialize: function() {
      var types = [ 'menu', 'page', 'article', 'block', 'component' ];
      var eventNames = types.concat(['']).join('View:render ');
      this.listenTo(Adapt, eventNames, this.onViewRender);
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
