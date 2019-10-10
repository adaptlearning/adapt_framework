define([
    'core/js/adapt',
    'core/js/views/notifyPushView',
    'core/js/models/notifyModel'
], function(Adapt, NotifyPushView, NotifyModel) {

    // Build a collection to store push notifications
    var NotifyPushCollection = Backbone.Collection.extend({

        model: NotifyModel,

        initialize: function() {
            this.listenTo(this, 'add', this.onPushAdded);
            this.listenTo(Adapt, 'notify:pushRemoved', this.onRemovePush);
        },

        onPushAdded: function(model) {
            this.checkPushCanShow(model);
        },

        checkPushCanShow: function(model) {
            if (this.canShowPush()) {
                model.set('_isActive', true);
                this.showPush(model);
            }
        },

        canShowPush: function() {
            var availablePushNotifications = this.where({_isActive:true});
            if (availablePushNotifications.length >= 2) {
                return false;
            }
            return true;
        },

        showPush: function(model) {
            new NotifyPushView({
                model: model
            });
        },

        onRemovePush: function(view) {
            var inactivePushNotifications = this.where({_isActive:false});
            if (inactivePushNotifications.length > 0) {
                this.checkPushCanShow(inactivePushNotifications[0]);
            }
        }

    });

    return NotifyPushCollection;

});
