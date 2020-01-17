define([
  'core/js/views/adaptView',
  'core/js/views/blockView'
], function(AdaptView, BlockView) {

  var ArticleView = AdaptView.extend({

    className: function() {
      return [
        'article',
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        this.setHidden(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
      ].join(' ');
    }

  }, {
    childContainer: '.block__container',
    childView: BlockView,
    type: 'article',
    template: 'article'
  });

  return ArticleView;

});
