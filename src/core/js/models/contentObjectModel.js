/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel", "coreJS/adapt"], function(AdaptModel, Adapt) {

    var ContentObjectModel = AdaptModel.extend({
        
        initialize: function() {
            if (this.get('_type') === 'page') this.constructor.children = 'articles';
            if (this.constructor.children) {
                Adapt[this.constructor.children].on({
                    "change:_ready": this.checkReadyStatus,
                    "change:_complete": this.checkCompletionStatus
                }, this);
            }
            this.init();
        }
        
    }, {
        parent:'course',
        siblings:'contentObjects',
        children:'contentObjects'
    });
    
    return ContentObjectModel;

});