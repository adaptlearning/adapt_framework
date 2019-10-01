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
				'notify:alert': this._deprecated.bind(this, 'alert'),
				'notify:prompt': this._deprecated.bind(this, 'prompt'),
				'notify:popup': this._deprecated.bind(this, 'popup'),
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

		alert: function(notifyObject) {
			return this.create(notifyObject, { _type: 'alert' });
		},

		prompt: function(notifyObject) {
			return this.create(notifyObject, { _type: 'prompt' });
		},

		popup: function(notifyObject) {
			return this.create(notifyObject, { _type: 'popup' });
		},

		push: function(notifyObject) {
			return this.create(notifyObject, { _type: 'push' });
		}

	});

	return (Adapt.notify = new Notify());

});
