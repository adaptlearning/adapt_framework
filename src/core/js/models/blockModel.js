/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var Backbone = require('backbone'),
        Adapt = require('coreJS/adapt'),
        AdaptModel = require('coreModels/adaptModel'),
        BlockModel = AdaptModel.extend({
            _parent:'articles',
            _siblings:'blocks',
            _children: 'components'

            checkCompletionStatus: function (model, isComplete) {
                if (this.ignoreCompletionEvent) { return; }
                //react to "my" children only
                if (model.get("_parentId") === this.get("_id")) {
                    var complete, incomplete,
                        criteria = this.get("_requireCompletionOf");
                    if (criteria[0] === 'all') {
                        //default
                        if (this.getChildren().findWhere({_isComplete: false})) {
                            return;
                        } else {
                            this.set({_isComplete: true});
                        }
                    } else if (criteria[0] === 'any') {
                        complete = this.filterCompletion(true);
                        //
                        if (complete && complete.length > 0) {
                            //set other children to complete
                            incomplete = this.filterCompletion(false);
                            this.ignoreCompletionEvent = true;
                            incomplete.each(function (model) {
                                //set to complete
                                model.set('_isComplete', true);
                            });
                            this.ignoreCompletionEvent = false;
                            //
                            this.set({_isComplete: true});
                        }
                    } else {
                        //we have a list of children ids to be completed
                        complete = this.getChildren().filter(function (model) {
                            var completed = model.get('_isComplete'),
                                inList = criteria.indexOf(model.get("_id")) !== -1;
                            return inList && completed === isComplete;
                        });
                        //
                        if (complete && complete.length === criteria.length) {

                            //set other children to complete
                            incomplete = this.filterCompletion(false);
                            this.ignoreCompletionEvent = true;
                            incomplete.each(function (model) {
                                //set to complete
                                model.set('_isComplete', true);
                            });
                            this.ignoreCompletionEvent = false;
                            //
                            this.set({_isComplete: true});
                        }
                    }
                }

            },



            init: function () {
                this.ignoreCompletionEvent = false;
                //
                this.listenToOnce(Adapt, "adapt:initialize", function () {
                    this.set("_requireCompletionOf", this.validateRequireCompletion(this.get("_requireCompletionOf")));
                });
                //
                BlockModel.__super__.init.apply(this, arguments);
            },

            /**
             * Helper method to filter children by the '_isComplete' state
             */
            filterCompletion: function (isComplete) {
                var t = this,
                    collection = this.getChildren().filter(function (model) {
                        var completed = model.get('_isComplete');

                        return completed === isComplete;
                    });
                return new Backbone.Collection(collection);
            },
            /**
             * Helper method to validate '_requireCompletionOf' property, it will check also if given id's are valid
             */
            validateRequireCompletion: function (r) {
                var output = r,
                    children,
                    childrenIds,
                    t = this,
                    i;
                if (typeof r === "undefined") {
                    output = ['all'];
                } else if (typeof r === "string") {
                    //string notation is also valid, just wrap it within an array
                    output = [r];
                }
                //here we have an array which can contain 'all', or 'any' - 'all' wins in case both will be found, 'all' or 'any' wins over any other entries (ids)
                if (output.length > 1) {
                    if (output.indexOf('all') !== -1 || output.indexOf('any') !== -1) {
                        if (output.indexOf('all') !== -1) {
                            output = ['all'];
                        } else {
                            output = ['any'];
                        }
                    }
                }
                //here we have either 1 item array with all, any or any other value OR multiple ids (without all or any)
                if (output.indexOf('all') === -1 && output.indexOf('any') === -1) {
                    //test given children ids
                    // each id must be a child of this block
                    children = this.getChildren();
                    childrenIds = [];
                    children.each(function (model) {
                        childrenIds.push(model.get("_id"));
                    });

                    if (childrenIds && childrenIds.length > 0) {
                        for (i = output.length; --i >= 0;) {
                            if (childrenIds.indexOf(output[i]) === -1) {
                                console.warn("The '_requireCompletionOf' for block '" + this.get("_id") + "' contains incorrect id, the '"+output[i]+"' is not child of this block, removing.");
                                output.splice(i, 1);
                            }
                        }
                    }

                    if (output.length === 0) {
                        //all invalid ids! - default to all
                        output = ['all'];
                    }
                }

                return output;
            }

    });

    
    return BlockModel;

});
