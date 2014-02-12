/*
* NotifyView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');

	var NotifyView = Backbone.View.extend({

		className: 'notify',

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
			this.render();
		},

		render: function() {
			var data = this.model.toJSON();
            var template = Handlebars.templates['notify'];
            this.$el.html(template(data)).appendTo('#wrapper');
            return this;
		}

	});

	return NotifyView;

});