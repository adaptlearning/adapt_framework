import Adapt from 'core/js/adapt';

class HeadingView extends Backbone.View {

  initialize() {
    this.listenTo(Adapt.parentView, 'postRemove', this.remove);
    this.listenTo(this.model, 'change:_isComplete', this.updateAria);
    this.render();
  }

  render() {
    const template = Handlebars.templates[this.constructor.template];
    const data = this.model.toJSON();
    const customHeadingType = this.$el.attr('data-a11y-heading-type');
    if (customHeadingType) data._type = customHeadingType;
    this.$el.html(template(data));
    this.checkCompletion();
  }

  updateAria() {
    const template = Handlebars.templates[this.constructor.template];
    const data = this.model.toJSON();
    const $rendered = $(`<div>${template(data)}</div>`);
    this.$('.aria-label').html($rendered.find('.aria-label').html());
    this.checkCompletion();
  }

  checkCompletion() {
    const isComplete = this.model.get('_isComplete');
    this.$el
      .toggleClass('is-complete', isComplete)
      .toggleClass('is-incomplete', !isComplete);
  }

}

HeadingView.template = 'heading';

export default HeadingView;
