define([
  'core/js/adapt'
], function(Adapt) {

  class NavigationItemView extends Backbone.View {

    className() {
      return [
        'nav__item',
        this.model.get('_classes')
      ].filter(Boolean).join(' ');
    }

    attributes() {
      return {
        'data-item-name': this.model.get('_name') || ''
      };
    }

    events() {
      return {
        'click [data-event]': 'triggerEvent'
      };
    }

    initialize() {
      this.render();
    }

    render() {
      const templateName = this.model.get('_template');
      if (!templateName) return;
      const template = Handlebars.templates[templateName];
      const data = this.model.toJSON();
      this.$el.html(template(data));
    }

    triggerEvent(event) {
      event.preventDefault();
      const currentEvent = $(event.currentTarget).attr('data-event');
      Adapt.trigger('navigation:' + currentEvent);
      switch (currentEvent) {
        case 'backButton':
          Adapt.router.navigateToPreviousRoute();
          break;
        case 'homeButton':
          Adapt.router.navigateToHomeRoute();
          break;
        case 'parentButton':
          Adapt.router.navigateToParent();
          break;
        case 'skipNavigation':
          this.skipNavigation();
          break;
        case 'returnToStart':
          Adapt.startController.returnToStartLocation();
          break;
      }
    }

    skipNavigation() {
      Adapt.a11y.focusFirst('.' + Adapt.location._contentType);
    }

  }

  return NavigationItemView;

});
