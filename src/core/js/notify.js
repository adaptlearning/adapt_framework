define([
  'core/js/adapt',
  'core/js/collections/notifyPushCollection',
  'core/js/views/notifyView',
  'core/js/models/notifyModel'
], function(Adapt, NotifyPushCollection, NotifyView, NotifyModel) {

  var Notify = Backbone.Controller.extend({

    notifyPushes: null,

    _warnFirstOnly: true,
    _warn: true,
    _hasWarned: false,

    initialize: function() {
      this.notifyPushes = new NotifyPushCollection();
      this.listenTo(Adapt, {
        'notify:popup': this._deprecated.bind(this, 'popup'),
        'notify:alert': this._deprecated.bind(this, 'alert'),
        'notify:prompt': this._deprecated.bind(this, 'prompt'),
        'notify:push': this._deprecated.bind(this, 'push')
      });
    },

    _deprecated: function(type, notifyObject) {
      if (this._warn && (this._warnFirstOnly && !this._hasWarned)) {
        Adapt.log.warn('NOTIFY DEPRECATED: Adapt.trigger(\'notify:'+type+'\', notifyObject); is no longer supported, please use Adapt.notify.'+type+'(notifyObject);');
        this._hasWarned = true;
      }
      return this.create(notifyObject, { _type: type });
    },

    create: function(notifyObject, defaults) {
      notifyObject =_.defaults({}, notifyObject, defaults, {
        _type: 'popup',
        _isCancellable: true,
        _showCloseButton: true,
        _closeOnShadowClick: true,
      });

      if (notifyObject._type === 'push') {
        this.notifyPushes.push(notifyObject);
        return;
      }

      return new NotifyView({
        model: new NotifyModel(notifyObject)
      });
    },

    /**
     * Creates a 'popup' notify
     * @param {Object} notifyObject An object containing all the settings for the popup
     * @param {string} notifyObject.title Title of the popup
     * @param {string} notifyObject.body Body of the popup
     * @param {Boolean} [notifyObject._showCloseButton=true] If set to `false` the popup will not have a close button. The learner will still be able to dismiss the popup by clicking outside of it or by pressing the Esc key. This setting is typically used mainly for popups that have a subview (where the subview contains the close button)
     * @param {Boolean} [notifyObject._isCancellable=true] If set to `false` the learner will not be able to close the popup - use with caution!
     * @param {string} [notifyObject._classes] A class name or (space separated) list of class names you'd like to be applied to the popup's `<div>`
     * @param {Backbone.View} [notifyObject._view] Subview to display in the popup instead of the standard view
     */
    popup: function(notifyObject) {
      return this.create(notifyObject, { _type: 'popup' });
    },

    /**
     * Creates an 'alert' notify popup
     * @param {Object} notifyObject An object containing all the settings for the alert popup
     * @param {string} notifyObject.title Title of the alert popup
     * @param {string} notifyObject.body Body of the alert popup
     * @param {string} notifyObject.confirmText Label for the popup confirm button
     * @param {Boolean} [notifyObject._isCancellable=true] If set to `false` only the confirm button can be used to dismiss/close the popup
     * @param {Boolean} [notifyObject._showIcon=false] If set to `true` an 'alert' icon will be displayed in the popup
     * @param {string} [notifyObject._callbackEvent] Event to trigger when the confirm button is clicked
     * @param {string} [notifyObject._classes] A class name or (space separated) list of class names you'd like to be applied to the popup's `<div>`
     * @param {Backbone.View} [notifyObject._view] Subview to display in the popup instead of the standard view
     */
    alert: function(notifyObject) {
      return this.create(notifyObject, { _type: 'alert' });
    },

    /**
     * Creates a 'prompt dialog' notify popup
     * @param {Object} notifyObject An object containing all the settings for the prompt dialog
     * @param {string} notifyObject.title Title of the prompt
     * @param {string} notifyObject.body Body of the prompt
     * @param {Object[]} notifyObject._prompts Array of objects that each define a button (and associated callback event) that you want shown in the prompt
     * @param {string} notifyObject._prompts[].promptText Label for this button
     * @param {string} notifyObject._prompts[]._callbackEvent Event to be triggered when this button is clicked
     * @param {Boolean} [notifyObject._isCancellable=true] If set to `false` only the confirm button can be used to dismiss/close the prompt
     * @param {Boolean} [notifyObject._showIcon=true] If set to `true` a 'query' icon will be displayed in the popup
     * @param {string} [notifyObject._callbackEvent] Event to trigger when the confirm button is clicked
     * @param {string} [notifyObject._classes] A class name or (space separated) list of class names you'd like to be applied to the popup's `<div>`
     * @param {Backbone.View} [notifyObject._view] Subview to display in the popup instead of the standard view
     */
    prompt: function(notifyObject) {
      return this.create(notifyObject, { _type: 'prompt' });
    },

    /**
     * Creates a 'push notification'
     * @param {Object} notifyObject An object containing all the settings for the push notification
     * @param {string} notifyObject.title Title of the push notification
     * @param {string} notifyObject.body Body of the push notification
     * @param {Number} [notifyObject._timeout=3000] Length of time (in milliseconds) the notification should left on-screen before automatically fading away
     * @param {string} notifyObject._callbackEvent Event to be triggered if the learner clicks on the push notification (not triggered if they use the close button)
     * @param {string} [notifyObject._classes] A class name or (space separated) list of class names you'd like to be applied to the popup's `<div>`
     */
    push: function(notifyObject) {
      return this.create(notifyObject, { _type: 'push' });
    }

  });

  return (Adapt.notify = new Notify());

});
