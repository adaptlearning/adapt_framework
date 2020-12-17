import Adapt from 'core/js/adapt';

class HeadingView extends Backbone.View {

  initialize() {
    this.listenTo(Adapt.parentView, 'postRemove', this.remove);
    this.listenTo(this.model, 'change:_isComplete', this.render);
    this.render();
  }

  render() {
    var template = Handlebars.templates[this.constructor.template];
    var data = this.model.toJSON();
    var customHeadingType = this.$el.attr('data-a11y-heading-type');
    if (customHeadingType) data._type = customHeadingType;
    this.$el.html(template(data));
    this.checkCompletion();
  }

  checkCompletion() {
    var isComplete = this.model.get('_isComplete');
    this.$el
      .toggleClass('is-complete', isComplete)
      .toggleClass('is-incomplete', !isComplete);
  }

}

HeadingView.template = 'heading';

export default HeadingView;
