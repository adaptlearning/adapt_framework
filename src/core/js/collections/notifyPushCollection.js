import Adapt from 'core/js/adapt';
import NotifyPushView from 'core/js/views/notifyPushView';
import NotifyModel from 'core/js/models/notifyModel';

// Build a collection to store push notifications
export default class NotifyPushCollection extends Backbone.Collection {

  initialize() {
    this.model = NotifyModel;
    this.listenTo(this, 'add', this.onPushAdded);
    this.listenTo(Adapt, 'notify:pushRemoved', this.onRemovePush);
  }

  onPushAdded(model) {
    this.checkPushCanShow(model);
  }

  checkPushCanShow(model) {
    if (!this.canShowPush()) return;
    model.set('_isActive', true);
    this.showPush(model);
  }

  canShowPush() {
    const availablePushNotifications = this.where({ _isActive: true });
    return (availablePushNotifications.length < 2);
  }

  showPush(model) {
    new NotifyPushView({
      model: model
    });
  }

  onRemovePush(view) {
    const inactivePushNotifications = this.where({ _isActive: false });
    if (inactivePushNotifications.length > 0) {
      this.checkPushCanShow(inactivePushNotifications[0]);
    }
  }

}
