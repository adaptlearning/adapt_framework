define([
  'core/js/views/adaptView'
], function(AdaptView) {

  var BlockView = AdaptView.extend({

    className: function() {
      return [
        'block',
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        this.setHidden(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
      ].join(' ');
    }

  }, {
    childContainer: '.component__container',
    type: 'block',
    template: 'block'
  });

  return BlockView;

});
