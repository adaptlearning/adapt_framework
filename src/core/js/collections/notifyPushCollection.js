import Adapt from 'core/js/adapt';
import NotifyPushView from 'core/js/views/notifyPushView';
import NotifyModel from 'core/js/models/notifyModel';

// Build a collection to store push notifications
export default class NotifyPushCollection extends Backbone.Collection {

  model() {
    return NotifyModel;
  }

  initialize() {
    this.listenTo(this, 'add', this.onPushAdded);
    this.listenTo(Adapt, 'notify:pushRemoved', this.onRemovePush);
  }

  onPushAdded(model) {
    this.checkPushCanShow(model);
  }

  checkPushCanShow(model) {
    if (this.canShowPush()) {
      model.set('_isActive', true);
      this.showPush(model);
    }
  }

  canShowPush() {
    var availablePushNotifications = this.where({ _isActive: true });
    if (availablePushNotifications.length >= 2) {
      return false;
    }
    return true;
  }

  showPush(model) {
    new NotifyPushView({
      model: model
    });
  }

  onRemovePush(view) {
    var inactivePushNotifications = this.where({ _isActive: false });
    if (inactivePushNotifications.length > 0) {
      this.checkPushCanShow(inactivePushNotifications[0]);
    }
  }

}
