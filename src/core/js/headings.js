import Adapt from './adapt';
import HeadingView from './views/headingView';

class Headings extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, 'view:render', this.onViewRender);
  }

  onViewRender(view) {
    var $headingSeats = view.$('.js-heading');
    $headingSeats.each(function(index, el) {
      new HeadingView({
        el: el,
        model: view.model
      });
    });
  }

}

export default new Headings();
