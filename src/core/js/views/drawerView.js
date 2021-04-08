import Adapt from 'core/js/adapt';
import DrawerItemView from 'core/js/views/drawerItemView';

class DrawerView extends Backbone.View {

  className() {
    return 'drawer u-display-none';
  }

  attributes() {
    return {
      'role': 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'drawer-heading',
      'aria-hidden': 'true'
    };
  }

  initialize() {
    this._isVisible = false;
    this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
    this.drawerDir = Adapt.config.get('_defaultDirection') === 'rtl' ? 'left' : 'right';
    this.drawerDuration = Adapt.config.get('_drawer')?._duration ?? 400;
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    this.listenTo(Adapt, {
      'navigation:toggleDrawer': this.toggleDrawer,
      'drawer:triggerCustomView': this.openCustomView,
      'drawer:closeDrawer': this.onCloseDrawer,
      'remove': this.onRemove,
      'drawer:remove': this.remove
    });

    this.onKeyUp = this.onKeyUp.bind(this);
    this.setupEscapeKey();
  }

  setupEscapeKey() {
    $(window).on('keyup', this.onKeyUp);
  }

  onKeyUp(event) {
    if (event.which !== 27) return;
    event.preventDefault();

    this.onCloseDrawer();
  }

  events() {
    return {
      'click .drawer__back': 'onBackButtonClicked',
      'click .drawer__close': 'onCloseClicked'
    };
  }

  render() {
    const template = Handlebars.templates.drawer;
    $(this.el).html(template({ _globals: Adapt.course.get('_globals') })).prependTo('body');
    const shadowTemplate = Handlebars.templates.shadow;
    $(shadowTemplate()).prependTo('body');
    _.defer(this.postRender.bind(this));
    return this;
  }

  postRender() {
    this.$('a, button, input, select, textarea').attr('tabindex', -1);

    this.checkIfDrawerIsAvailable();
  }

  openCustomView(view, hasBackButton) {
    this._hasBackButton = hasBackButton;
    this._isCustomViewVisible = true;
    Adapt.trigger('drawer:empty');
    this.showDrawer();
    this.$('.drawer__holder').html(view);
  }

  checkIfDrawerIsAvailable() {
    const isEmptyDrawer = (this.collection.length === 0);
    $('.js-nav-drawer-btn').toggleClass('u-display-none', isEmptyDrawer);
    if (isEmptyDrawer) {
      Adapt.trigger('drawer:noItems');
    }
  }

  onBackButtonClicked(event) {
    event.preventDefault();
    this.showDrawer(true);
  }

  onCloseClicked(event) {
    event.preventDefault();
    this.hideDrawer();
  }

  onCloseDrawer($toElement) {
    this.hideDrawer($toElement);
  }

  onRemove() {
    this.hideDrawer();
  }

  toggleDrawer() {
    if (this._isVisible && this._isCustomViewVisible === false) {
      this.hideDrawer();
      return;
    }
    this.showDrawer(true);
  }

  showDrawer(emptyDrawer) {
    this.$el.removeClass('u-display-none').removeAttr('aria-hidden');
    // Only trigger popup:opened if drawer is visible, pass popup manager drawer element
    if (!this._isVisible) {
      Adapt.a11y.popupOpened(this.$el);
      Adapt.a11y.scrollDisable('body');
      this._isVisible = true;
    }

    // Sets tab index to 0 for all tabbable elements in Drawer
    this.$('a, button, input, select, textarea').attr('tabindex', 0);

    if (emptyDrawer) {
      this.$('.drawer__back').addClass('u-display-none');
      this._isCustomViewVisible = false;
      this.emptyDrawer();
      if (this.collection.models.length === 1) {
        // This callback triggers openCustomView() and sets
        // _isCustomViewVisible to true, causing toggleDrawer()
        // to re-render the drawer on every toggle button press
        Adapt.trigger(this.collection.models[0].get('eventCallback'));
        // Set _isCustomViewVisible to false to prevent re-rendering
        // the drawer and fix the toggle functionality on toggle button press
        this._isCustomViewVisible = false;
      } else {
        this.renderItems();
        Adapt.trigger('drawer:openedItemView');
      }
    } else {
      const hideDrawerBackButton = (!this._hasBackButton || this.collection.models.length <= 1);
      this.$('.drawer__back').toggleClass('u-display-none', hideDrawerBackButton);
      Adapt.trigger('drawer:openedCustomView');
    }

    const complete = () => {
      this.addShadowEvent();
      Adapt.trigger('drawer:opened');

      // focus on first tabbable element in drawer
      Adapt.a11y.focusFirst(this.$el, { defer: true });
    };

    // delay drawer animation until after background fadeout animation is complete
    const direction = {};
    if (this.disableAnimation) {
      $('.js-shadow').removeClass('u-display-none');
      $('.js-drawer-holder').scrollTop(0);

      direction[this.drawerDir] = 0;
      this.$el.css(direction);
      complete();
    } else {
      $('.js-shadow').velocity({ opacity: 1 }, {
        duration: this.drawerDuration,
        begin: () => {
          $('.js-shadow').removeClass('u-display-none');
          $('.js-drawer-holder').scrollTop(0);
          complete();
        }
      });

      const easing = Adapt.config.get('_drawer')?._showEasing || 'easeOutQuart';
      direction[this.drawerDir] = 0;
      this.$el.velocity(direction, this.drawerDuration, easing);
    }

  }

  emptyDrawer() {
    this.$('.drawer__holder').empty();
  }

  renderItems() {
    Adapt.trigger('drawer:empty');
    this.emptyDrawer();
    this.collection.forEach(model => new DrawerItemView({ model }));
  }

  hideDrawer($toElement) {
    if (!this._isVisible) return;

    const direction = {};
    Adapt.a11y.popupClosed($toElement);
    this._isVisible = false;
    Adapt.a11y.scrollEnable('body');

    if (this.disableAnimation) {

      direction[this.drawerDir] = -this.$el.width();
      this.$el
        .css(direction)
        .addClass('u-display-none')
        .attr('aria-hidden', 'true');

      $('.js-shadow').addClass('u-display-none');

      Adapt.trigger('drawer:closed');

    } else {
      const easing = Adapt.config.get('_drawer')?._hideEasing || 'easeInQuart';

      direction[this.drawerDir] = -this.$el.width();
      this.$el.velocity(direction, this.drawerDuration, easing, () => {
        this.$el
          .addClass('u-display-none')
          .attr('aria-hidden', 'true');

        Adapt.trigger('drawer:closed');
      });

      $('.js-shadow').velocity({ opacity: 0 }, { duration: this.drawerDuration,
        complete() {
          $('.js-shadow').addClass('u-display-none');
        }
      });

    }

    this._isCustomViewVisible = false;
    this.removeShadowEvent();

  }

  addShadowEvent() {
    $('.js-shadow').one('click touchstart', () => this.onCloseDrawer());
  }

  removeShadowEvent() {
    $('.js-shadow').off('click touchstart');
  }

  remove() {
    super.remove();
    $(window).off('keyup', this.onKeyUp);

    Adapt.trigger('drawer:empty');
    this.collection.reset();
    $('.js-shadow').remove();
  }

}

Object.assign(DrawerView, {
  childContainer: '.js-drawer-holder',
  childView: DrawerItemView
});

export default DrawerView;
