/*
* NotifyView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var NotifyView = Backbone.View.extend({

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
		},

		render: function() {
			var data = this.model.toJSON();
            var template = Handlebars.templates['notify'];
            this.$el.html(template(data));
            return this;
		}

	});

});