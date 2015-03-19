//Backwards compatibility with backbone 1.0.0

define([
	//backbone.js renamed to backbone-lib
	'core/js/libraries/backbone-lib'
	], function (Backbone) {

	/*	
		This file exists to pass nonStandardBackboneOptions as such:

			new View({  
				model: {}, 
				'nonStandardBackboneOptions' : 'value'  
			}) 

			= {  
				model: {}, 
				options: { nonBackboneOptions: 'value' }  
			};
	
			nonStandardBackboneOptions include anything not in this list:
				'model', 
				'collection', 
				'el', 
				'id', 
				'attributes', 
				'className', 
				'tagName', 
				'events'

		We should look to removing this reliance 
		mainly to keep up to date with 
		http://backbonejs.org/#

		oliver.foster@kineo.com

	*/ 


	var View = Backbone.View;
	var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	//Replacement view instanciator
	Backbone.View = function(options) {
		this.cid = _.uniqueId('view');
		options || (options = {});
		_.extend(this, _.pick(options, viewOptions));
		//THE LINE BELOW IS THE FUNCTIONALITY WE USE
		this.options = _.omit(options, viewOptions);
		if (Object.keys(this.options).length > 0) {
			//WARNING TO SHOW DEVELOPERS WHICH BEHAVIOUR NEEDS CHANGING
			console.warn("Depreciated - Using backbone options functionality");
		}
		this._ensureElement();
		this.initialize.apply(this, arguments);
	};

	//Make sure the new view instanciator looks like old view instanciator
	_.extend(Backbone.View, View);
	_.extend(Backbone.View.prototype, View.prototype);	

	return Backbone;
});