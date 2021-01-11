import Adapt from './adapt';
import HeadingView from './views/headingView';

class Headings extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, 'view:render', this.onViewRender);
  }

  onViewRender(view) {
    const $headingSeats = view.$('.js-heading');
    $headingSeats.each((index, el) => new HeadingView({ el, model: view.model }));
  }

}

export default new Headings();
