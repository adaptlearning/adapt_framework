/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["backbone", "coreJS/adapt"], function(Backbone, Adapt) {

    var AdaptModel = Backbone.Model.extend({
        
        initialize: function() {
            if (this.constructor.children) {
                Adapt[this.constructor.children].on({
                    "change:_ready": this.checkReadyStatus,
                    "change:_complete": this.checkCompletionStatus
                }, this);
            }
            this.init();
        },
        
        defaults: {
            _ready:false,
            _complete:false,
        },
        
        init: function() {},
        
        checkReadyStatus: function() {
            if (this.getChildren().findWhere({_ready:false})) return;
            this.set({_ready:true});
        },
        
        checkCompletionStatus: function() {
            if (this.getChildren().findWhere({_complete:false})) return;
            this.set({_complete:true});
        },
        
        findDescendant: function(descendant) {
            console.log(descendant);

            // first check if descendant is child and return child
            if (this.constructor.children === descendant) {
                return this.getChildren();
            }
            
            var allDescendants = [];
            var flattenedDescendants;
            var children = this.getChildren();
            var returnedDescedants;
            function searchChildren(children) {
                children.each(function(model) {
                    var childrensModels = model.getChildren().models;
                    allDescendants.push(childrensModels);
                    flattenedDescendants = _.flatten(allDescendants);                    
                });
                returnedDescedants = new Backbone.Collection(flattenedDescendants);
                
                if (children.models[0].constructor.children === descendant) {
                    return;
                } else {
                    allDescendants = [];
                    searchChildren(returnedDescedants);
                }
            }
            
            searchChildren(children);
            return returnedDescedants;
        },
        
        getChildren: function() {
            if (this.get("_children")) return this.get("_children");
            var children = Adapt[this.constructor.children].where({_parentId:this.get("_id")});
            var childrenCollection = new Backbone.Collection(children);
            this.set("_children", childrenCollection);
            return childrenCollection;
        },
        
        getParent: function() {
            if (this.get("_parent")) return this.get("_parent");
            var parent = Adapt[this.constructor.parent].where({_id:this.get("_parentId")});
            var parent = parent[0];
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
            var siblingsCollection = new Backbone.Collection(siblings);
            this.set("_siblings", siblingsCollection);
            return siblingsCollection;
        }
        
    });
    
    return AdaptModel;

});