import Adapt from 'core/js/adapt';
import AdaptView from 'core/js/views/adaptView';

export default class NotifyView extends Backbone.View {

  className() {
    return `notify ${this.model.get('_classes') || ''}`;
  }

  attributes () {
    return Object.assign({
      role: 'dialog',
      'aria-labelledby': 'notify-heading',
      'aria-modal': 'true'
    }, this.model.get('_attributes'));
  }

  events() {
    return {
      'click .js-notify-btn-alert': 'onAlertButtonClicked',
      'click .js-notify-btn-prompt': 'onPromptButtonClicked',
      'click .js-notify-close-btn': 'onCloseButtonClicked',
      'click .js-notify-shadow-click': 'onShadowClicked'
    };
  }

  initialize() {
    _.bindAll(this, 'resetNotifySize', 'onKeyUp');
    this.disableAnimation = Adapt.config.get('_disableAnimation') || false;
    this.isOpen = false;
    this.hasOpened = false;
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    this.listenTo(Adapt, {
      'remove page:scrollTo': this.closeNotify,
      'notify:resize': this.resetNotifySize,
      'notify:cancel': this.cancelNotify,
      'notify:close': this.closeNotify,
      'device:resize': this.resetNotifySize
    });
    this.setupEscapeKey();
  }

  setupEscapeKey() {
    $(window).on('keyup', this.onKeyUp);
  }

  onKeyUp(event) {
    if (event.which !== 27) return;
    event.preventDefault();
    this.cancelNotify();
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates.notify;
    // hide notify container
    this.$el.css('visibility', 'hidden');
    // attach popup + shadow
    this.$el.html(template(data)).appendTo('body');
    // hide popup
    this.$('.notify__popup').css('visibility', 'hidden');
    // show notify container
    this.$el.css('visibility', 'visible');
    this.showNotify();
    return this;
  }

  onAlertButtonClicked(event) {
    event.preventDefault();
    // tab index preservation, notify must close before subsequent callback is triggered
    this.closeNotify();
    Adapt.trigger(this.model.get('_callbackEvent'), this);
  }

  onPromptButtonClicked(event) {
    event.preventDefault();
    // tab index preservation, notify must close before subsequent callback is triggered
    this.closeNotify();
    Adapt.trigger($(event.currentTarget).attr('data-event'), this);
  }

  onCloseButtonClicked(event) {
    event.preventDefault();
    // tab index preservation, notify must close before subsequent callback is triggered
    this.cancelNotify();
  }

  onShadowClicked(event) {
    event.preventDefault();
    if (this.model.get('_closeOnShadowClick') === false) return;
    this.cancelNotify();
  }

  cancelNotify() {
    if (this.model.get('_isCancellable') === false) return;
    // tab index preservation, notify must close before subsequent callback is triggered
    this.closeNotify();
    Adapt.trigger('notify:cancelled', this);
  }

  resetNotifySize() {
    if (!this.hasOpened) return;
    this.resizeNotify();
  }

  resizeNotify() {
    const windowHeight = $(window).height();
    const notifyHeight = this.$('.notify__popup-inner').outerHeight();
    const isFullWindow = (notifyHeight >= windowHeight);
    this.$('.notify__popup').css({
      'height': isFullWindow ? '100%' : 'auto',
      'top': isFullWindow ? 0 : '',
      'margin-top': isFullWindow ? '' : -(notifyHeight / 2),
      'overflow-y': isFullWindow ? 'scroll' : '',
      '-webkit-overflow-scrolling': isFullWindow ? 'touch' : ''
    });
  }

  async showNotify() {
    this.isOpen = true;
    await this.addSubView();
    // Add to the list of open popups
    Adapt.notify.stack.push(this);
    // Keep focus from previous action
    this.$previousActiveElement = $(document.activeElement);
    Adapt.trigger('notify:opened', this);
    this.$el.imageready(this.onLoaded.bind(this));
  }

  onLoaded() {
    if (this.disableAnimation) {
      this.$('.notify__shadow').css('display', 'block');
    } else {
      this.$('.notify__shadow').velocity({ opacity: 0 }, { duration: 0 }).velocity({ opacity: 1 }, { duration: 400,
        begin: () => {
          this.$('.notify__shadow').css('display', 'block');
        }
      });
    }
    this.resizeNotify();
    if (this.disableAnimation) {
      this.$('.notify__popup').css('visibility', 'visible');
      this.onOpened();
    } else {
      this.$('.notify__popup').velocity({ opacity: 0 }, { duration: 0 }).velocity({ opacity: 1 }, { duration: 400,
        begin: () => {
          // Make sure to make the notify visible and then set
          // focus, disabled scroll and manage tabs
          this.$('.notify__popup').css('visibility', 'visible');
          this.onOpened();
        }
      });
    }
  }

  onOpened() {
    $.inview();
    this.hasOpened = true;
    // Allows popup manager to control focus
    Adapt.a11y.popupOpened(this.$('.notify__popup'));
    Adapt.a11y.scrollDisable('body');
    $('html').addClass('notify');
    // Set focus to first accessible element
    Adapt.a11y.focusFirst(this.$('.notify__popup'), { defer: false });
  }

  async addSubView() {
    this.subView = this.model.get('_view');
    if (this.model.get('_id')) {
      // Automatically render the specified id
      const model = Adapt.findById(this.model.get('_id'));
      const View = Adapt.getViewClass(model);
      this.subView = new View({ model });
    }
    if (!this.subView) return;
    this.subView.$el.on('resize', this.resetNotifySize);
    this.$('.notify__content-inner').prepend(this.subView.$el);
    if (!(this.subView instanceof AdaptView) || this.subView.model.get('_isReady')) return;
    // Wait for the AdaptView subview to be ready
    return new Promise(resolve => {
      const check = (model, value) => {
        if (!value) return;
        this.subView.model.off('change:_isReady', check);
        resolve();
      };
      this.subView.model.on('change:_isReady', check);
    });
  }

  closeNotify() {
    // Make sure that only the top most notify is closed
    const stackItem = Adapt.notify.stack[Adapt.notify.stack.length - 1];
    if (this !== stackItem) return;
    Adapt.notify.stack.pop();
    // Prevent from being invoked multiple times - see https://github.com/adaptlearning/adapt_framework/issues/1659
    if (!this.isOpen) return;
    this.isOpen = false;
    // If closeNotify is called before showNotify has finished then wait
    // until it's open.
    if (this.hasOpened) {
      this.onCloseReady();
      return;
    }
    this.listenToOnce(Adapt, 'popup:opened', () => {
      // Wait for popup:opened to finish processing
      _.defer(this.onCloseReady.bind(this));
    });
  }

  onCloseReady() {
    if (this.disableAnimation) {
      this.$('.notify__popup').css('visibility', 'hidden');
      this.$el.css('visibility', 'hidden');
      this.remove();
    } else {
      this.$('.notify__popup').velocity({ opacity: 0 }, { duration: 400,
        complete: () => {
          this.$('.notify__popup').css('visibility', 'hidden');
        }
      });
      this.$('.notify__shadow').velocity({ opacity: 0 }, { duration: 400,
        complete: () => {
          this.$el.css('visibility', 'hidden');
          this.remove();
        }
      });
    }
    Adapt.a11y.scrollEnable('body');
    $('html').removeClass('notify');
    // Return focus to previous active element
    Adapt.a11y.popupClosed(this.$previousActiveElement);
    // Return reference to the notify view
    Adapt.trigger('notify:closed', this);
  }

  remove(...args) {
    this.removeSubView();
    $(window).off('keyup', this.onKeyUp);
    super.remove(...args);
  }

  removeSubView() {
    if (!this.subView) return;
    this.subView.$el.off('resize', this.resetNotifySize);
    if (this.subView instanceof AdaptView) {
      // Clear up nested views and models
      const views = [...this.subView.findDescendantViews(), this.subView];
      views.forEach(view => {
        view.model.set('_isReady', false);
        view.remove();
      });
    } else {
      this.subView.remove();
    }
    this.subView = null;
  }

}
