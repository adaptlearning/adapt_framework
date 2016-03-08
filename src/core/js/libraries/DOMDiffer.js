//https://github.com/oliverfoster/DOMDiffer 2016-03-02

// Uses CommonJS, AMD or browser globals to register library
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function() {
            return (root.DOMDiffer = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        this.DOMDiffer = factory();
    }
}(this, function () {

    var trim_regex = /^\s+|\s+$/g;
    var svgNS = "http://www.w3.org/2000/svg";

    var proto = {

        setOptions: function setOptions(options) {

            this.options = options || {};;

            var ignoreAttributesWithPrefix = this.options.ignoreAttributesWithPrefix;
            var ignoreAttributes = this.options.ignoreAttributes;
            if ((!ignoreAttributesWithPrefix  || !ignoreAttributesWithPrefix.length )
                && (!ignoreAttributes  || !ignoreAttributes.length )) return;

            var regex = "";
            var lastIndex;
            if (ignoreAttributesWithPrefix && ignoreAttributesWithPrefix.length > 0) {
                regex+="^("
                lastIndex = ignoreAttributesWithPrefix.length-1;
                for (var i = 0, l = ignoreAttributesWithPrefix.length; i < l; i++) {
                    var prefix = ignoreAttributesWithPrefix[i];
                    regex+=this._escapeRegExp(prefix);
                    if (i !== lastIndex) {
                        regex+="|";
                    }
                }
                regex+=")";

                if (regex && ignoreAttributes && ignoreAttributes.length > 0) {
                    regex += "|";
                }
            }

            if (ignoreAttributes && ignoreAttributes.length > 0) {
                regex+="^("
                lastIndex = ignoreAttributes.length-1;
                for (var i = 0, l = ignoreAttributes.length; i < l; i++) {
                    var attribute = ignoreAttributes[i];
                    regex+=this._escapeRegExp(attribute);
                    if (i !== lastIndex) {
                        regex+="|";
                    }
                }
                regex+=")$";
            }

            this._ignoreAttributes = new RegExp(regex, "i");

            this._ignoreClass = {};

            if (this.options.ignoreClasses) {
                var ignoreClasses = this.options.ignoreClasses;
                for (var i = 0, l = ignoreClasses.length; i < l; i++) {
                    this._ignoreClass[ignoreClasses[i]] = true;
                }
            }

        },

        _escapeRegExp: function _escapeRegExp(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },

        //turn dom nodes into vnodes and diff
        nodesDiff: function nodesDiff(source, destination, options) {
            var vsource = this.nodeToVNode(source);
            var vdestination = this.nodeToVNode(destination);
            return this.vNodesDiff(vsource, vdestination, options);
        },

        //turn dom node into vnode
        nodeToVNode: function nodeToVNode(DOMNode, options, context) {

            options = options || {};

            if (!context ) {

                context = {
                    depth: 0,
                    index: 0,
                    uid: 0,
                    parentUid: -1
                };

            }

            //build vNode
            var vNode = this._vNodeFromNode(DOMNode, context);

            this._vNodeAttributes(DOMNode, vNode);
            this._injectSpecialAttributes(DOMNode, vNode);

            if (!options.ignoreChildren) {
                var allowedSubTree = this._isAllowedSubTree(vNode);
                if (!allowedSubTree) return vNode;

                //capture deep from childNodes
                var deep = 0;

                var vChildNodes = vNode.childNodes;

                if (DOMNode.childNodes.length) deep++;

                var childNode;
                var childNodeType;
                var vChildNode;
                var childContext;
                for (var i = 0, l = DOMNode.childNodes.length; i < l; i++) {
                    childNode = DOMNode.childNodes[i];
                    childNodeType = childNode.nodeType;

                    switch (childNodeType) {
                    case 1:
                        childContext = {
                            depth: vNode.depth+1, 
                            index: i,
                            uid: context.uid, // carry current uid count through
                            parentUid: vNode.uid
                        };
                        vChildNode = this.nodeToVNode(childNode, options, childContext);
                        deep = deep+vChildNode.deep;
                        context.uid = childContext.uid;
                        break;
                    case 3:
                        //add text node
                        vChildNode = {
                            DOMNode: childNode,
                            nodeType: childNodeType,
                            nodeName: childNode.nodeName,
                            data: childNode.data,
                            trimmed: this._trim(childNode.data),
                            index: i,
                            depth: vNode.depth+1,
                            deep: 0,
                            uid: context.uid++,
                            parentUid: vNode.uid
                        };
                        break;
                    }

                    vChildNodes.push(vChildNode);
                }

                vNode.deep = deep;
            }
            
            return vNode;
        },

        _vNodeFromNode: function _vNodeFromNode(DOMNode, context) {
            //capture depth and index from parent
            var depth = context.depth;
            var index = context.index;
            
            var vNode = {
                DOMNode: DOMNode,
                nodeType: DOMNode.nodeType,
                nodeName: DOMNode.nodeName,
                attributes: {},
                id: "",
                classes: {},
                childNodes: [],
                depth: depth,
                index: index,
                deep: 0,
                uid: context.uid++,
                parentUid: context.parentUid
            };
            return vNode;
        },

        _vNodeAttributes: function _vNodeAttributes(DOMNode, vNode) {
            //build vNode attributes
            var nodeAttributes = DOMNode.attributes;
            var vNodeAttributes = vNode.attributes;
            var vNodeClasses = vNode.classes;

            var attribute;
            var attributeName;
            var attributeValue;
            var forbiddenAttribute;
            for (var i = 0, l = nodeAttributes.length; i < l; i++) {
                attribute = nodeAttributes.item(i);
                attributeName = attribute.name;
                attributeValue = attribute.value;

                if (this._ignoreAttributes) {
                    forbiddenAttribute = this._ignoreAttributes.test(attributeName);
                    if (forbiddenAttribute) continue;
                }

                vNodeAttributes[attributeName] = attributeValue;
            }

            var classValue = vNodeAttributes['class'];
            if (classValue) {
                var classes = classValue.split(" ");
                var className;
                var allowedClass;
                for (var c = 0, cl = classes.length; c < cl; c++) {
                    className = classes[c];
                    if (!className) continue;

                    if (this._ignoreClass[className]) continue;

                    vNodeClasses[className] = true;
                }
            }

            var idValue = vNodeAttributes.id;
            if (idValue) {
                vNode.id = idValue;
            }

            delete vNodeAttributes['class'];
            delete vNodeAttributes.id;
        },

        _injectSpecialAttributes: function _injectSpecialAttributes(DOMNode, vNode) {
            var vNodeAttributes = vNode.attributes;

            switch (vNode.nodeName) {
            case "svg":
                if (!vNodeAttributes["xmlns"]) vNodeAttributes["xmlns"] = svgNS;
                break;
            }
        },

        _isAllowedSubTree: function _isAllowedSubTree(vNode) {
            //don't stop at root nodes
            if (vNode.parentUid === -1) return true;

            var ignoreSubTreesWithAttributes = this.options.ignoreSubTreesWithAttributes;
            if (!ignoreSubTreesWithAttributes || !ignoreSubTreesWithAttributes.length) return true;

            //if node has attribute then stop building tree here
            var attr;
            for (var i = 0, l = ignoreSubTreesWithAttributes.length; i < l; i++) {
                attr = ignoreSubTreesWithAttributes[i];
                if (vNode.attributes[attr] !== undefined) {
                    return false;
                }
            }

            return true;

        },

        //trim whitespace from a string ends
        _trim: function _trim(string) {
            return string.replace(trim_regex, '');
        },

        //flatten vnodes and diff
        vNodesDiff: function vNodesDiff(vsource, vdestination, options) {
            var fVSource = this._vNodeToFVNode(vsource);
            var fVDestination = this._vNodeToFVNode(vdestination);
            return this._fVNodesDiff(fVSource, fVDestination, options);
        },

        //flatten a vnode
        _vNodeToFVNode: function _vNodeToFVNode(vNode, rtn, index) {
            index = index || {};
            rtn = rtn || [];
            switch (vNode.nodeType) {
            case 1:
                rtn.push(vNode);
                index[vNode.uid] = vNode;
                var childNodes = vNode.childNodes;
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    this._vNodeToFVNode(childNodes[i], rtn, index);
                }
                break;
            case 3:
                rtn.push(vNode);
                index[vNode.uid] = vNode;
                break;
            }
            return rtn;
        },

        //create a differential of flattened vnodes
        //1. match source nodes to the best destination node
        //2. create matches to remove all left-over source nodes with no matches
        //4. create matches to add all left-over destination nodes
        //6. find the start destination node
        //7. rebuild destination tree from source tree using added nodes where necessary and returning the order of the differences
        //8. use the differential to turn a copy of the source tree into the destination tree, removing redundant diffs on the way
        //9. return finished differential
        _fVNodesDiff: function _fVNodesDiff(fVSource, fVDestination, options) {

            options = options || {};

            //create editable arrays to preserve original arrays
            var fVSource2 = fVSource.slice(0);
            var fVDestination2 = fVDestination.slice(0);

            //try to match containers
            var sourceMatches = [];
            var uidIndexes = {
                bySourceUid: {},
                byDestinationUid: {}
            };

            this._compareAndRemoveFVNodes(fVSource2, fVDestination2, 0.20, sourceMatches, uidIndexes, options);
            var removes = this._createRemoveMatches(fVSource2, sourceMatches, uidIndexes);
            this._createAddMatches(fVDestination2, sourceMatches, uidIndexes);

            fVSource2 = undefined;
            fVDestination2 = undefined;

            var destinationStartVNode = this._fVNodeToVNode(fVDestination);

            var orderedMatches = [];
            this._rebuildDestinationFromSourceMatches(orderedMatches, destinationStartVNode, sourceMatches, uidIndexes);

            if (options.ignoreContainer && orderedMatches[0] && orderedMatches[0].sourceParentUid === -1) {
                //remove container from diff
                orderedMatches.splice(0,1);
            }

            sourceMatches = undefined;

            var differential = [].concat(
                removes, //re-add removes as they get lost in the ordering
                orderedMatches
            )

            //find the start node on the original source
            var sourceStartVNode = this._fVNodeToVNode(fVSource);
        
            //remove redundant differentials by test-applying the diff
            //use performOnVNode: false so as not to change the original source vnode
            //use performOnDOM: false so as not to change the original dom structure
            options = this._cloneObject(options);
            options.performOnDOM = options.performOnDOM || false;
            options.performOnVNode = options.performOnVNode || false;

            this.vNodeDiffApply(sourceStartVNode, differential, options);

            this._sanitizeDifferential(differential);

            return differential;
        },

        //compare each source vnode with each destination vnode
        //when a match is found, remove both the source and destination from their original flattened arrays and add a match diff object
        _compareAndRemoveFVNodes: function _compareAndRemoveFVNodes(fVSource, fVDestination, minRate, sourceMatches, uidIndexes, options) {
            if (!fVSource.length  || !fVDestination.length ) return;

            //always remove root containers as matches first
            if (fVSource[0].parentUid === -1 && fVDestination[0].parentUid === -1) {
                var source = fVSource[0];
                var destination = fVDestination[0];
                var rate = this._rateCompare(source, destination);
                fVSource[0] = undefined;
                fVDestination[0] = undefined;
                var diffObj = {
                    source: source,
                    destination: destination,
                    nodeType: source.nodeType,
                    sourceUid: source.uid,
                    sourceParentUid: source.parentUid,
                    sourceIndex: source.index,
                    destinationUid: destination.uid,
                    destinationParentUid: destination.parentUid,
                    destinationIndex: destination.index,
                    isEqual: rate === 1,
                    rate: rate
                };
                this._expandDifferences(diffObj, options);
                sourceMatches.push(diffObj);
                uidIndexes.bySourceUid[diffObj.sourceUid] = diffObj;
                uidIndexes.byDestinationUid[diffObj.destinationUid] = diffObj;
            }

            var fIndex = fVSource.length-1;
            var f2Index = fVDestination.length-1;

            var maxRating = -1, maxRated, maxRatedIndex;

            //match each source piece to the best destination piece
            //this way the fewest source moves will be made
            var sourceLength = fVSource.length;
            var source;
            var sourceUid;
            var destinationLength = fVDestination.length;
            var destination;
            var destinationUid;
            var diffObj;
            var rate;

            var bySourceUid = uidIndexes.bySourceUid;
            var byDestinationUid = uidIndexes.byDestinationUid;

            for (var sIndex = 0; sIndex < sourceLength; sIndex++) {

                source = fVSource[sIndex];
                if (!source) continue;
                sourceUid = source.uid;

                for (var dIndex = 0; dIndex < destinationLength; dIndex++) {

                    destination = fVDestination[dIndex];
                    if (!destination) continue;
                    destinationUid = destination.uid;

                    if (destination.nodeType !== source.nodeType) continue;
                    if (source.nodeName !== destination.nodeName) continue;

                    rate = this._rateCompare(destination, source);

                    if (rate < minRate || rate <= maxRating) continue;

                    maxRated = destination;
                    maxRating = rate;
                    maxRatedIndex = dIndex;
                    if (rate !== 1) continue;

                    fVSource[sIndex] = undefined;
                    fVDestination[dIndex] = undefined;
                    diffObj = {
                        source: source,
                        destination: destination,
                        nodeType: source.nodeType,
                        sourceUid: sourceUid,
                        sourceParentUid: source.parentUid,
                        sourceIndex: source.index,
                        destinationUid: destination.uid,
                        destinationParentUid: destination.parentUid,
                        destinationIndex: destination.index,
                        isEqual: rate === 1,
                        rate: rate
                    };
                    this._expandDifferences(diffObj, options);
                    sourceMatches.push(diffObj);
                    bySourceUid[diffObj.sourceUid] = diffObj;
                    byDestinationUid[diffObj.destinationUid] = diffObj;
                    maxRating = 0;
                    maxRated = undefined;
                    maxRatedIndex = undefined;
                    sIndex = -1;
                    break;
                }

                if (!maxRated) continue;

                fVSource[sIndex] = undefined;
                fVDestination[maxRatedIndex] = undefined;
                diffObj = {
                    source: source,
                    destination: maxRated,
                    nodeType: source.nodeType,
                    sourceUid: source.uid,
                    sourceParentUid: source.parentUid,
                    sourceIndex: source.index,
                    destinationUid: maxRated.uid,
                    destinationParentUid: maxRated.parentUid,
                    destinationIndex: maxRated.index,
                    isEqual: false,
                    rate: maxRating
                };
                this._expandDifferences(diffObj, options);
                sourceMatches.push(diffObj);
                bySourceUid[diffObj.sourceUid] = diffObj;
                byDestinationUid[diffObj.destinationUid] = diffObj;
                maxRating = 0;
                maxRated = undefined;
                maxRatedIndex = undefined;
                sIndex = -1;
            }

        }, 

        //create a percentage difference value for two vnodes
        _rateCompare: function _rateCompare(vdestination, vsource) {
            var value = 0;

            var rate = -1;
            switch (vdestination.nodeType) {
            case 1:
                
                value+=vsource.id===vdestination.id?3:0;
                value+=vsource.depth === vdestination.depth? 3 : 0;

                value+=this._keyValueCompare(vsource.classes, vdestination.classes) * 3;

                value+=this._keyValueCompare(vsource.attributes, vdestination.attributes) * 2;

                value+=(vsource.childNodes.length) === (vdestination.childNodes.length)? 2 : 0;
                value+=vsource.childNodes.length === vdestination.childNodes.length? 2 : 0;
                
                value+=vsource.deep === vdestination.deep? 1 : 0;
                value+=vsource.index === vdestination.index? 1 : 0;

                rate = (value / 17);

                break;
            case 3:
                value+=vsource.depth === vdestination.depth? 3 : 0;
                value+=vsource.index === vdestination.index? 1 : 0;

                value+=vsource.trimmed === vdestination.trimmed? 2 : 0;
                value+=vsource.data === vdestination.data? 1 : 0;
                
                rate = (value / 7);
            }

            return rate;
        },

        //create a percentage difference value for two vnodes
        _rateCompareNoChildren: function _rateCompareNoChildren(vdestination, vsource) {
            var value = 0;
            if (vdestination.nodeType !== vsource.nodeType) return -1;
            if (vsource.nodeName !== vdestination.nodeName) return -1;

            var rate = -1;
            switch (vdestination.nodeType) {
            case 1:
                
                value+=vsource.id===vdestination.id?3:0;

                value+=this._keyValueCompare(vsource.classes, vdestination.classes) * 3;

                value+=this._keyValueCompare(vsource.attributes, vdestination.attributes) * 2;

                rate = (value / 8);

                break;
            case 3:
 
                value+=vsource.trimmed === vdestination.trimmed? 2 : 0;
                value+=vsource.data === vdestination.data? 1 : 0;
                
                rate = (value / 3)
            }

            return rate;
        },

        _rateCompareNoDepth: function _rateCompareNoDepth(vdestination, vsource) {
            var value = 0;
            if (vdestination.nodeType !== vsource.nodeType) return -1;
            if (vsource.nodeName !== vdestination.nodeName) return -1;

            var rate = -1;
            switch (vdestination.nodeType) {
            case 1:
                
                value+=vsource.id===vdestination.id?3:0;

                value+=this._keyValueCompare(vsource.classes, vdestination.classes) * 3;

                value+=this._keyValueCompare(vsource.attributes, vdestination.attributes) * 2;
                
                value+=vsource.index === vdestination.index? 1 : 0;

                rate = (value / 9);

                break;
            case 3:
                value+=vsource.index === vdestination.index? 1 : 0;

                value+=vsource.trimmed === vdestination.trimmed? 2 : 0;
                value+=vsource.data === vdestination.data? 1 : 0;
                
                rate = (value / 4);
            }

            return rate;
        },

        //compare two key value pair objects
        //return percentage match 0-1
        _keyValueCompare: function _keyValueCompare(object1, object2) {
            var matchingValues = 0;
            var totalKeys = 0;
            var o2value;
            for (var k1 in object1) {
                totalKeys++;
                if (object1[k1] === object2[k1]) {
                    matchingValues++;
                }
            }
            for (var k2 in object2) {
                if (object1[k2] === undefined) {
                    totalKeys++;
                }
            }
            if (!totalKeys) return 1;
            return (matchingValues / totalKeys) || -1;
        },

        //manufacture 'matches' for the items to remove from the source tree
        _createRemoveMatches: function _createRemoveMatches(fVSource2, sourceMatches, uidIndexes) {
            if (!fVSource2.length ) return [];

            var removes = [];

            var deleteSourceRoots = [];
            var sourceParentUids = {};

            var source;
            var diffObj;
            for (var f2Index = 0, l = fVSource2.length; f2Index < l; f2Index++) {
                source = fVSource2[f2Index];
                if (!source) continue;
                diffObj = {
                    changeRemove: true,
                    source: source,
                    nodeType: source.nodeType,
                    sourceUid: source.uid,
                    sourceParentUid: source.parentUid,
                };
                sourceMatches.push(diffObj);
                uidIndexes.bySourceUid[diffObj.sourceUid] = diffObj;
                uidIndexes.byDestinationUid[diffObj.destinationUid] = diffObj;

                sourceParentUids[source.uid] = true;
                if (!sourceParentUids[source.parentUid]) {
                    deleteSourceRoots.push(source);
                    //only add source root deletion to output diff
                    removes.push(diffObj);
                } else {
                    diffObj.redundant = true;
                }

            }

            return removes;
        },

        //manufacture 'matches' for the items to add to the source tree from the destination
        _createAddMatches: function _createAddMatches(fVDestination2, sourceMatches, uidIndexes) {
            if (!fVDestination2.length ) return [];
            //create new source pieces to add by cloning the needed destination pieces

            var newDestinationRoots = [];
            var destinationParentUids = {};
            var destination;
            for (var f2Index = 0, l = fVDestination2.length; f2Index < l; f2Index++) {

                destination = fVDestination2[f2Index];
                if (!destination) continue;
                destinationParentUids[destination.uid] = true;
                if (!destinationParentUids[destination.parentUid]) {
                    newDestinationRoots.push(destination);
                }

            }

            //create matches for new objects to that sourceUids don't conflict with preexisting sourceNodes
            //assign new item.sourceUids from the negative spectrum
            var newSourceUids = -1;
            var translateOldDestionationUidToNewSourceUid = {};
            for (var i = 0, l = newDestinationRoots.length; i < l; i++) {

                var fVSource = this._vNodeToFVNode(newDestinationRoots[i]);
                var fVDestination = this._vNodeToFVNode(newDestinationRoots[i]);

                for (var c = 0, cl = fVDestination.length; c < cl; c++) {

                    var destination = fVDestination[c];
                    var oldDestinationParentUid = destination.parentUid;
                    var oldDestionationUid = destination.uid;

                    var newSourceParentUid = translateOldDestionationUidToNewSourceUid[oldDestinationParentUid];
                    
                    //check if there is an indexed matching destination
                    var existingDiff = uidIndexes.byDestinationUid[destination.uid];
                    if (existingDiff) {
                        //no need to create new nodes as nodes will be moved from existing source
                        translateOldDestionationUidToNewSourceUid[oldDestionationUid] = existingDiff.sourceUid;
                        continue;
                    }

                    var source = this.vNodeToOuterVNode(fVSource[c], {performOnVNode: false});
                    var newSourceUid = newSourceUids--;
                    translateOldDestionationUidToNewSourceUid[oldDestionationUid] = newSourceUid;
                    
                    //if we're dealing with a child of a new root
                    if (!newSourceParentUid ) {
                        //if no translation to a new uid, not a child of a new root
                        //assume new node is connected to a preexisting source node
                        newSourceParentUid = uidIndexes.byDestinationUid[oldDestinationParentUid].sourceUid;
                    }

                    //configure new source nodes
                    source.uid = newSourceUid;
                    source.parentUid = newSourceParentUid;
                    source.DOMNode = undefined;

                    var vNode = {};
                    switch (source.nodeType) {
                    case 1:
                        vNode.attributes = source.attributes;
                        vNode.classes = source.classes;
                        vNode.id = source.id;
                        vNode.nodeName = source.nodeName;
                        vNode.nodeType = source.nodeType;
                        vNode.childNodes = [];
                        break;
                    case 3:
                        vNode.data = source.data;
                        vNode.nodeType = source.nodeType;
                        vNode.nodeName = source.nodeName;
                        vNode.trimmed = source.trimmed;
                    }
                    vNode.uid = newSourceUid;
                    vNode.parentUid = newSourceParentUid;
                    vNode.deep = source.deep;
                    vNode.depth = source.depth;
                    vNode.index = source.index;

                    var diffObj = {
                        changeAdd: true,
                        changeHierachyData: true,
                        destination: destination,
                        nodeType: destination.nodeType,
                        destinationUid: oldDestionationUid,
                        destinationParentUid: oldDestinationParentUid,
                        depth: destination.depth,
                        deep: destination.deep,
                        source: source,
                        vNode: vNode,
                        sourceUid: newSourceUid,
                        sourceParentUid: newSourceParentUid,
                        sourceIndex: source.index,
                        destinationIndex: destination.index
                    }
                    sourceMatches.push(diffObj);
                    uidIndexes.bySourceUid[newSourceUid] = diffObj;
                    uidIndexes.byDestinationUid[oldDestionationUid] = diffObj;
                }
            }

        },

        //add attributes to the match to express the differences between each pair
        //this makes each match-pair into a match-diff
        //strip DOMNodes
        _expandDifferences: function _expandDifferences(match, options) {

            if (match.changeRemove || match.changeAdd) return;

            var source = match.source;
            var destination = match.destination;

            if (source.parentUid === -1 && (options.ignoreContainer || this.options.ignoreContainer) ) return;

            if (source.deep !== destination.deep
                || source.depth !== destination.depth) {
                    match.changeHierachyData = true;
                    match.depth = destination.depth;
                    match.deep = destination.deep;
                    match.isEqual = false;
            }

            switch(match.nodeType) {
            case 1:

                var changeAttributes = this._diffKeyValues(source.attributes, destination.attributes);
                if (!changeAttributes.isEqual) {
                    match.changeAttributes = true;
                    match.attributes = changeAttributes;
                    match.isEqual = false;
                }
                var changeClasses = this._diffKeys(source.classes, destination.classes);
                if (!changeClasses.isEqual) {
                    match.changeClasses = true;
                    match.classes = changeClasses;
                    match.isEqual = false;
                }
                if (source.id !== destination.id) {
                    match.changeId = true;
                    match.id = destination.id;
                    match.isEqual = false;
                }

                break;
            case 3:

                if (source.data !== destination.data) {
                    match.changeData = true;
                    match.data = destination.data;
                    match.isEqual = false;
                }

                break;
            }

        },

        //describe the differences between two objects (source & destination attributes, or source & destination classes)
        _diffKeys: function _diffKeys (source, destination) {
            var diff = {
                removed: [],
                addedLength: 0,
                added: {},
                isEqual: true,
                value: ""
            };
            var nodeValue;
            for (var k in source) {
                nodeValue = destination[k];

                if (nodeValue === undefined) {
                    diff.removed.push(k);
                    continue;
                } 

                if (source[k] !== nodeValue) {
                    diff.added[k] = nodeValue;
                    diff.addedLength++;
                }
            }
            var destKeys = [];
            for (var k in destination) {
                destKeys.push(k);
                if (source[k] === undefined) {
                    diff.added[k] = destination[k];
                    diff.addedLength++;
                }
            }
            if (diff.removed.length || diff.addedLength) {
                diff.isEqual = false;
                diff.value = destKeys.join(" ");
            }
            return diff;
        },

        _diffKeyValues: function _diffKeyValues (source, destination) {
            var diff = {
                removed: [],
                addedLength: 0,
                added: {},
                isEqual: true
            };
            var nodeValue;
            for (var k in source) {
                nodeValue = destination[k];

                if (nodeValue === undefined) {
                    diff.removed.push(k);
                    continue;
                } 

                if (source[k] !== nodeValue) {
                    diff.added[k] = nodeValue;
                    diff.addedLength++;
                }
            }
            for (var k in destination) {
                if (source[k] === undefined) {
                    diff.added[k] = destination[k];
                    diff.addedLength++;
                }
            }
            if (diff.removed.length || diff.addedLength) {
                diff.isEqual = false;
            }
            return diff;
        },

        //find the first vnode in a flattened vnode list
        _fVNodeToVNode: function _fVNodeToVNode(fVNode) {
            var startVNode;
            for (var i = 0, vNode; vNode = fVNode[i++];) {
                if (vNode.parentUid === -1) {
                    startVNode = vNode;
                    break;
                }
            }
            if (!startVNode) throw "cannot find start node";
            return startVNode;
        },

        //recursively go through the destination tree, checking each source mapped node (or added node) and outputing the match-diffs where necessary
        //this filters and orders the match-diffs creating a preliminary differential
        _rebuildDestinationFromSourceMatches: function _rebuildDestinationFromSourceMatches(diffs, destinationStartVNode, sourceMatches, uidIndexes, destinationParentVNode, newIndex) {

            var diff = uidIndexes.byDestinationUid[destinationStartVNode.uid];
            var isNotRootNode = (diff.sourceParentUid !== -1);

            if (isNotRootNode) {
                var sourceParentDiff = uidIndexes.bySourceUid[diff.sourceParentUid];
                var destinationParentDiff =  uidIndexes.byDestinationUid[destinationParentVNode.uid];
                
                //if source parent destination match, is not the same as the expected destination then move
                if (sourceParentDiff.destinationUid !== destinationParentVNode.uid) {

                    var moveToSourceUid = destinationParentDiff.sourceUid;
                    //mark to move into a different parent
                    diff.isEqual = false;
                    diff.changeParent = true;

                    //fetch source parent to relocate node to
                    diff.newSourceParentUid = moveToSourceUid;

                }

                var isChildNode = (newIndex !== undefined);
                var sourceDiff = uidIndexes.bySourceUid[diff.sourceUid];

                //if is a child node and has moved the add directive to reindex in siblings
                if (isChildNode && 
                    (diff.changeAdd 
                        || diff.changeParent 
                        || destinationStartVNode.index !== newIndex
                        || sourceDiff.sourceIndex !== newIndex 
                        || sourceParentDiff.changeChildren
                )) {
                    diff.isEqual = false;
                    diff.changeIndex = true;
                    destinationParentDiff.changeChildren = true;
                    destinationParentDiff.isEqual = false;
                }

            } else if (diff.changeAdd) {
                diff.isEqual = false;
                diff.changeIndex = true;
            }

            switch (diff.nodeType) {
            case 1:
                if (!diff.isEqual
                    || diff.changeAdd
                    || diff.changeId
                    || diff.changeAttributes
                    || diff.changeClasses
                    || diff.changeParent
                    || diff.changeIndex
                    || diff.changeHierachyData
                    || diff.changeChildren
                    ) {
                    diff.isIncluded = true;
                    diffs.push(diff);
                }

                var childNode;
                var childDiffs;
                for (var i = 0, l = destinationStartVNode.childNodes.length; i < l; i++) {
                    childNode = destinationStartVNode.childNodes[i];
                    this._rebuildDestinationFromSourceMatches(diffs, childNode, sourceMatches, uidIndexes, destinationStartVNode, i);
                }

                break;
            case 3:
                if (!diff.isEqual
                    || diff.changeData
                    || diff.changeAdd
                    || diff.changeParent
                    || diff.changeIndex
                    || diff.changeHierachyData
                    ) {
                    diff.isIncluded = true;
                    diffs.push(diff);
                }
                break;
            }

        },

        _sanitizeDifferential: function _sanitizeDifferential(differential) {
            for (var i = 0, diff; diff = differential[i++];) {
                //delete diff.isIncluded;
                delete diff.source;
                delete diff.destination;
                delete diff.isEqual;
                delete diff.rate;
            }
            return differential;
        },

        //apply the differential to the vnode, optionally cloning the vnode so as not to change it
        vNodeDiffApply: function vNodeDiffApply(startVNode, differential, options) {

            options = options || {
                performOnVNode: true,
                performOnDOM: true
            };

            if (!options.performOnVNode) startVNode = this._cloneObjectCopy(startVNode, {"DOMNode":true});

            var bySourceUid = {};
            var fVStartNode = [];
            this._vNodeToFVNode(startVNode, fVStartNode, bySourceUid);

            var diffIndexBySourceUid = {};
            for (var i = 0, diff; diff = differential[i++];) { 
                diffIndexBySourceUid[diff.sourceUid] = diff;
            }

            var vNode;
            for (var i = 0, diff; diff = differential[i++];) {
                vNode = bySourceUid[diff.sourceUid];

                if (diff.changeRemove) {
                    this._changeRemove(diff, vNode, bySourceUid, diffIndexBySourceUid, options);                    
                    diff.isComplete = true;
                    continue;
                }

                if (diff.changeAdd) {
                    vNode = this._changeAdd(diff, vNode, bySourceUid, diffIndexBySourceUid, options);
                }
                
                if (diff.changeHierachyData) {
                    this._changeHierachyData(diff, vNode);
                }

                //change attributes
                if (diff.changeAttributes) {
                    this._changeAttributes(diff, vNode, options);
                }

                if (diff.changeId) {
                    this._changeId(diff, vNode, options);
                }

                //change classes
                if (diff.changeClasses) {
                    this._changeClasses(diff, vNode, options);                    
                }

                if (diff.changeParent) {
                    this._changeParent(diff, vNode, bySourceUid, diffIndexBySourceUid, options);
                }

                if (diff.changeIndex) {
                    this._changeIndex(diff, vNode, bySourceUid, diffIndexBySourceUid, options);
                }

                //change data
                if (diff.changeData) {
                    this._changeData(diff, vNode, options);                    
                }

                diff.isComplete = true;
            }

            //remove redundant items from the original diff
            this._removeRedundants(differential);

            return startVNode;
        },


        _changeRemove: function _changeRemove(diff, vNode, bySourceUid, diffIndexBySourceUid, options) {
            var parentVNode = bySourceUid[diff.sourceParentUid];
            if (parentVNode.nodeType === 3) throw "cannot find children of a text node";

            var found = false;
            for (var r = 0, rl = parentVNode.childNodes.length; r < rl; r++) {
                if ( parentVNode.childNodes[r].uid === diff.sourceUid) {

                    if (options.performOnDOM) {
                        parentVNode.DOMNode.removeChild(vNode.DOMNode);
                    }

                    parentVNode.childNodes.splice(r,1);
                    found = true;
                    break;
                }
            }
            if (!found) throw "Remove not found";
        },

        _changeAdd: function _changeAdd(diff, vNode, bySourceUid, diffIndexBySourceUid, options) {
            var parentVNode = bySourceUid[diff.sourceParentUid];
                    
            var newSourceVNode = this.vNodeToOuterVNode(diff.vNode, {performOnVNode:false});
            var newNode = this.vNodeToNode(newSourceVNode);
            newSourceVNode.DOMNode = newNode;

            //index the new diff by source id so that subsequent child adds have somewhere to go
            bySourceUid[diff.sourceUid] = newSourceVNode;

            //add to the end
            if (options.performOnDOM) {
                parentVNode.DOMNode.appendChild(newNode);
            }

            parentVNode.childNodes.push(newSourceVNode);

            return newSourceVNode;
        },

        _changeAttributes: function _changeAttributes(diff, vNode, options) {
            var attributes = diff.attributes;
            if (attributes.removed.length) {
                for (var r = 0, rl = attributes.removed.length; r < rl; r++) {
                    var key = attributes.removed[r];

                    if (options.performOnDOM) {
                        vNode.DOMNode.removeAttribute(key);
                    }

                    delete vNode.attributes[key];
                }
            }
            if (attributes.addedLength) {
                for (var k in attributes.added) {

                    if (options.performOnDOM) {
                        vNode.DOMNode.setAttribute(k, attributes.added[k]);
                    }

                    vNode.attributes[k] = attributes.added[k];
                }
            }
        },

        _changeId: function _changeId(diff, vNode, options) {
            if (options.performOnDOM) {
                if (!diff.id) {
                    vNode.DOMNode.removeAttribute('id');
                } else {
                    vNode.DOMNode.setAttribute('id', diff.id);
                }
            }
            vNode.id = diff.id;
        },

        _changeClasses: function _changeClasses(diff, vNode, options) {
            var classes = diff.classes;
            
            var className = classes.value;
            if (!className) {
                vNode.DOMNode.removeAttribute("class");
            } else {
                vNode.DOMNode.setAttribute("class", className);
            }

            
            if (classes.removed.length !== 0) {
                for (var r = 0, rl = classes.removed.length; r < rl; r++) {
                    var key = classes.removed[r];
                    delete vNode.classes[key];
                }
            }
            if (classes.addedLength !== 0) {
                for (var k in classes.added) {
                    vNode.classes[k] = classes.added[k];
                }
            }
        },

        _changeParent: function _changeParent(diff, vNode, bySourceUid, diffIndexBySourceUid, options) {
            var oldParentVNode = bySourceUid[diff.sourceParentUid];
            var newParentVNode = bySourceUid[diff.newSourceParentUid];

            //remove from original source childNodes
            var found = false;
            var moveNode;
            for (var r = 0, rl = oldParentVNode.childNodes.length; r < rl; r++) {
                if ( oldParentVNode.childNodes[r].uid === diff.sourceUid) {

                    if (options.performOnDOM) {
                        moveNode = oldParentVNode.DOMNode.childNodes[r];
                        if (moveNode === undefined) {
                            found = false;
                            break;
                        }
                    }

                    oldParentVNode.childNodes.splice(r, 1);
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw "cannot find object to move in parent";
            }

            //add to the end
            if (options.performOnDOM) {
                newParentVNode.DOMNode.appendChild(moveNode);
            }

            newParentVNode.childNodes.push(vNode);
        },

        _changeIndex: function _changeIndex(diff, vNode, bySourceUid, diffIndexBySourceUid, options) {
            var parentVNode;
            if (diff.changeParent) {
                //if node changed parents last
                parentVNode = bySourceUid[diff.newSourceParentUid];

                //reindex vnodes as they can change around
                var oldParentVNode = bySourceUid[diff.sourceParentUid];
                for (var r = 0, rl = oldParentVNode.childNodes.length; r < rl; r++) {
                    oldParentVNode.childNodes[r].index = r;
                }

            } else {
                parentVNode = bySourceUid[diff.sourceParentUid];
            }
            
            //reindex vnodes as they can change around
            for (var r = 0, rl = parentVNode.childNodes.length; r < rl; r++) {
                parentVNode.childNodes[r].index = r;
            }

            var parentDiff = diffIndexBySourceUid[parentVNode.uid];
            

            if (diff.destinationIndex === vNode.index) {
                if (!diff.changeAttributes 
                    && !diff.changeClass 
                    && !diff.changeData 
                    && !diff.changeParent 
                    && !diff.changeAdd  
                    && !diff.changeRemove 
                    && !diff.changeHierachyData 
                    && (!parentDiff  || !parentDiff.changeChildren )) {
                        //remove diff if only changing index
                        diff.redundant = true;
                }
            } else {

                if (diff.destinationIndex > vNode.index) {
                    /* insert before next, when a node is moved up a list it changes the indices of 
                        *  all the elements above it
                        *  it's easier to pick the node after its new position and insert before that one
                        *  makes indices come out correctly
                        */
                    if (options.performOnDOM) {
                        var moveNode = parentVNode.DOMNode.childNodes[vNode.index];

                        var offsetIndex = diff.destinationIndex+1;
                        if (offsetIndex >= parentVNode.DOMNode.childNodes.length) {
                            parentVNode.DOMNode.appendChild(moveNode);
                        } else {
                            var afterNode = parentVNode.DOMNode.childNodes[offsetIndex];
                            parentVNode.DOMNode.insertBefore(moveNode, afterNode);
                        }
                    }
                } else {
                    if (options.performOnDOM) {
                        var afterNode = parentVNode.DOMNode.childNodes[diff.destinationIndex];
                        var moveNode = parentVNode.DOMNode.childNodes[vNode.index];
                        parentVNode.DOMNode.insertBefore(moveNode, afterNode);
                    }
                }

                parentVNode.childNodes.splice(vNode.index,1);
                parentVNode.childNodes.splice(diff.destinationIndex,0,vNode);
                vNode.index = diff.destinationIndex;

            }

        },

        _changeData: function _changeData(diff, vNode, options) {
            if (options.performOnDOM) {
                vNode.DOMNode.data = diff.data;
            }

            vNode.data = diff.data;
            vNode.trimmed = this._trim(diff.data);
        },

        _changeHierachyData: function _changeHierachyData(diff, vNode) {
            vNode.depth = diff.depth;
            vNode.deep = diff.deep;
        },

        _removeRedundants: function _removeRedundants(differential) {
            for (var i = differential.length-1, l = -1; i > l; i--) {
                var diff = differential[i];
                if (diff.redundant) {
                    differential.splice(i,1);
                }
            }
        },

        //clone basic javascript Array, Object and primative structures
        _cloneObject: function _cloneObject(value) {
            if (value instanceof Array) {
                var rtn = [];
                for (var i = 0, l = value.length; i < l; i++) {
                    rtn[i] = this._cloneObject(value[i]);
                }
                return rtn;
            } else if (value instanceof Object) {
                var rtn = {};
                for (var k in value) {
                    rtn[k] = this._cloneObject(value[k]);
                }
                return rtn;
            }
            return value;
        },

        _cloneObjectCopy: function _cloneObjectCopy(value, copy) {
            if (value instanceof Array) {
                var rtn = [];
                for (var i = 0, l = value.length; i < l; i++) {
                    rtn[i] = this._cloneObjectCopy(value[i], copy);
                }
                return rtn;
            } else if (value instanceof Object) {
                var rtn = {};
                for (var k in value) {
                    if (copy && copy[k] !== undefined) {
                        rtn[k] = value[k]
                    } else {
                        rtn[k] = this._cloneObjectCopy(value[k], copy);
                    }
                }
                return rtn;
            }
            return value;
        },

        //clone and strip the children from the vNode
        vNodeToOuterVNode: function vNodeToOuterVNode(vNode, options) {
            if (options && !options.performOnVNode) {
                var clone = {};
                for (var k in vNode) {
                    switch (k) {
                    case "childNodes":
                        clone.childNodes = [];
                        continue;
                    case "DOMNode":
                        clone[k] = vNode[k];
                        continue;
                    default: 
                        if (vNode[k] instanceof Object) {
                            clone[k] = this._cloneObject(vNode[k]);
                            continue;
                        }
                        clone[k] = vNode[k];
                    }
                }
                vNode = clone;
            } else {
                switch (vNode.nodeType) {
                case 1:
                    vNode.childNodes.length = 0;
                }
            }
            return vNode;
        },

        //turn dom node into vnode ignoring children
        nodeToOuterVNode: function nodeToOuterVNode(DOMNode, options) {
            options = this._cloneObject(options) || {};
            options.ignoreChildren = true;
            return this.nodeToVNode(DOMNode, options);
        },

        //render a node into a dom node
        vNodeToNode: function vNodeToNode(vNode) {

            var DOMNode;
            switch (vNode.nodeType) {
            case 1:
                switch (vNode.nodeName) {
                case "svg":
                    DOMNode = document.createElementNS(svgNS, vNode.nodeName);
                    break;
                default:
                    DOMNode = document.createElement(vNode.nodeName);
                }
                for (var k in vNode.attributes) {
                    DOMNode.setAttribute(k, vNode.attributes[k]);
                }
                var classes = [];
                for (var k in vNode.classes) {
                    classes.push(k);            
                }
                var className = classes.join(" ");
                if (className) {
                    DOMNode.setAttribute("class", className);
                }
                if (vNode.id) {
                    DOMNode.setAttribute("id", vNode.id);
                }

                for (var i = 0, childNode; childNode = vNode.childNodes[i++];) {
                    DOMNode.appendChild( this.vNodeToNode(childNode) );
                }
                break;
            case 3:
                DOMNode = document.createTextNode(vNode.data);
                break;
            }

            return DOMNode;
        },

        nodeDiffApply: function nodeDiffApply(DOMNode, differential, options) {
            var startVNode = this.nodeToVNode(DOMNode);

            options = options || {
                performOnVNode: true,
                performOnDOM: true
            };

            this.vNodeDiffApply(startVNode, differential, options);

            return startVNode;
        },

        //replace the children of one node with the children of another
        nodeReplaceChildren: function nodeReplaceChildren(DOMNode, withNode) {
            if (!withNode.childNodes.length) return;
            DOMNode.innerHTML = "";
            for (var n = 0, nl = withNode.childNodes.length; n < nl; n++) {
                DOMNode.appendChild(withNode.childNodes[0]);
            } 
        },

        nodesAreEqual: function nodesAreEqual(node1, node2, options) {

            var vNode1 = this.nodeToVNode(node1);
            var vNode2 = this.nodeToVNode(node2);

            return this.vNodesAreEqual(vNode1, vNode2, options);

        },

        vNodesAreEqual: function vNodesAreEqual(vNode1, vNode2, options) {

            options = options || {};

            var rate;
            if (vNode1.parentUid === -1 && (options.ignoreContainer || this.options.ignoreContainer)) {
                rate = 1;
            } else {
                if (options.ignoreDepths) {
                    rate = this._rateCompareNoDepth(vNode1, vNode2);
                    var ncrate = this._rateCompareNoChildren(vNode1, vNode2);
                    if (rate !== 1 && ncrate !== 1) {
                        if (options.forDebug) {
                            console.log("nodes different at", vNode1, vNode2);
                            //debugger;
                        };
                        return false;
                    }
                } else {
                    rate = this._rateCompare(vNode1, vNode2);
                    var ncrate = this._rateCompareNoChildren(vNode1, vNode2);
                    if (rate !== 1 && ncrate !== 1) {
                        if (options.forDebug) {
                            console.log("nodes different at", vNode1, vNode2);
                            //debugger;
                        };
                        return false;
                    }
                }
            }

            switch (vNode1.nodeType) {
            case 1:
                if (vNode1.childNodes.length !== vNode2.childNodes.length) {
                    if (options.forDebug) {
                        console.log("childNodes different at", vNode1, vNode2);
                        //debugger;
                    };
                    return false;
                }
                for (var i = 0, l = vNode1.childNodes.length; i < l; i++) {
                    if (!this.vNodesAreEqual(vNode1.childNodes[i], vNode2.childNodes[i], options)) {
                        return false;
                    }
                }
                break;
            }

            return true;

        },

        vNodeCheckIndexes: function vNodeCheckIndexes(vNode) {

            switch (vNode.nodeType) {
            case 1:

                for (var i = 0, l = vNode.childNodes.length; i < l; i++) {
                    var childNode = vNode.childNodes[i];
                    if (childNode.index !== i) {
                        console.log("indexes different at", vNode);
                        //debugger;
                    }
                    if (childNode.nodeType === 3) {
                        this.vNodeCheckIndexes(childNode);
                    }
                }
            }

        },

        nodeUpdateNode: function nodeUpdateNode(DOMNode1, DOMNode2, options) {
            options = options || {};

            var vNode1 = this.nodeToVNode(DOMNode1);
            var vNode2 = this.nodeToVNode(DOMNode2);

            if (options.test) {
                this.vNodeCheckIndexes(vNode1);
                this.vNodeCheckIndexes(vNode2);
            }

            options = this._cloneObject(options);

            var diff;
            switch (options.diff) {
            case "small":
                options.performOnDOM = false;
                options.performOnVNode = false;

                diff = this.vNodesDiff(vNode1, vNode2, options);

                options.performOnDOM = true;
                options.performOnVNode = true;
                this.vNodeDiffApply(vNode1, diff, options);
                break;
            case "fast":
            default:
                options.performOnDOM = true;
                options.performOnVNode = true;
                diff = this.vNodesDiff(vNode1, vNode2, options);
                break;
            }
            

            if (options.test) {

                this.vNodeCheckIndexes(vNode1);
                this.vNodeCheckIndexes(vNode2);

                var vNode1Reread = this.nodeToVNode(DOMNode1);
                this.vNodeCheckIndexes(vNode1Reread);

                var updatedVSRereadUpdated = this.vNodesAreEqual(vNode1, vNode1Reread, options);
                var updatedVSOriginal = this.vNodesAreEqual(vNode1, vNode2, options);
                var rereadUpdatedVSOriginal = this.vNodesAreEqual(vNode1Reread, vNode2, options);

                if (!updatedVSRereadUpdated
                    || !updatedVSOriginal 
                    || !rereadUpdatedVSOriginal) {
                    if (options.errorOnFail) {
                        throw "failed update";
                    } else {
                        console.log("failed update");
                        //debugger;
                    }
                }
            }

            if (options.returnVNode) {
                return vNode1;
            } else if (options.returnDiff) {
                return diff;
            } else {
                return this;
            }

        },

        stringToNode: function stringToNode(htmlString) {

            var container = document.createElement("div");
            container.innerHTML = htmlString;
            return container.childNodes[0];

        }

    };

    
    function DOMDiffer(options) {
        options = options || {
            ignoreContainer: false,
            ignoreAttributes: [],
            ignoreAttributesWithPrefix: [
                "sizzle",
                "jquery"
            ],
            ignoreSubTreesWithAttributes: [
                "view-container"
            ]
        };
        this.setOptions(options);
    }
    for (var k in proto) DOMDiffer.prototype[k] = proto[k];


    //export DOMDiffer for use in document
    return DOMDiffer;

}));