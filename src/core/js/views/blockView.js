define([
  'core/js/views/adaptView'
], function(AdaptView) {

  var BlockView = AdaptView.extend({

    className: function() {
      return "block " +
      this.model.get('_id') +
      " " + this.model.get('_classes') +
      " " + this.setVisibility() +
      " " + this.setHidden() +
      " nth-child-" + this.model.get("_nthChild") +
      " " + (this.model.get('_isComplete') ? 'is-complete' : '');
    }

  }, {
    childContainer: '.component__container',
    type: 'block',
    template: 'block'
  });

  return BlockView;

});
