define([
	'core/js/models/questionModel',
	'core/js/models/itemModel'
], function(QuestionModel, ItemModel) {

	var ItemsQuestionModel = QuestionModel.extend({

		toJSON: function() {
			var json = _.clone(this.attributes);

			json._items = this.get('_items').toJSON();

			return json;
		},

		init: function() {
			this.setUpItems();

			this.listenTo(this.get('_items'),  {
				'change:_isVisited': this.checkCompletionStatus
			});
		},

		setUpItems: function() {
			console.log('setting up items!');
			var items = this.get('_items').map(function(item, index) {
				item._index = index;

				return item;
			});

			this.set('_items', new Backbone.Collection(items, {model: ItemModel}));
		},

		getItem: function(index) {
			return this.get('_items').findWhere({ _index: index });
		},

		getVisitedItems: function() {
			return this.get('_items').where({ _isVisited: true });
		},

		getActiveItems: function() {
			return this.get('_items').where({ _isActive: true });
		},

		getActiveItem: function() {
			return this.get('_items').findWhere({ _isActive: true });
		},

		areAllItemsCompleted: function() {
			return this.getVisitedItems().length === this.get('_items').length;
		},

		checkCompletionStatus: function() {
			if (this.areAllItemsCompleted()) {
				this.setCompletionStatus();
			}
		},

		reset: function(type, force) {
			this.get('_items').each(function(item) { item.reset(); });

			QuestionModel.prototype.reset.call(this, type, force);
		},

		resetActiveItems: function() {
			this.get('_items').each(function(item) { item.toggleActive(false); });
		},

		setActiveItem: function(index) {
			this.getActiveItem().toggleActive(false);
			this.getItem(index).toggleActive(true);
		}

	});

	return ItemsQuestionModel;

});