/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["backbone", "coreJS/adapt"], function(Backbone, Adapt) {

    var AdaptModel = Backbone.Model.extend({
        
        initialize: function() {

        },
        
        getChildren: function() {
            if (this.get("_children")) return this.get("_children");
            var children = Adapt[this.constructor.children].where({_parentId:this.get("_id")});
            this.set("_children", children);
            return children;
        },
        
        getParent: function() {
            if (this.get("_parent")) return this.get("_parent");
            var parent = Adapt[this.constructor.parent].where({_id:this.get("_parentId")});
            this.set("_parent", parent);
            return parent;
        },
        
        getSiblings: function() {
            if (this.get("_siblings")) return this.get("_siblings");
            var siblings = _.reject(Adapt[this.constructor.siblings].where({
                _parentId:this.get("_parentId")
            }), _.bind(function(model){ 
                return model.get('_id') == this.get('_id'); 
            }, this));
            //var siblings = Adapt[this.constructor.siblings].where({_parentId:this.get("_parentId")});
            this.set("_siblings", siblings);
            return siblings;
        }
        
    });
    
    return AdaptModel;

});