module.exports = function(less) {

    class ReplaceUrls {

        constructor(options) {

            this.isReplacing = true;
            this.isPreEvalVisitor = true;

            this._options = options;
            this._visitor = new less.visitors.Visitor(this);

        }

        run(root) {
            return this._visitor.visit(root);
        }

        visitRule(ruleNode, visitArgs) {
            this._inRule = true;
            return ruleNode;
        }

        visitRuleOut(ruleNode, visitArgs) {
            this._inRule = false;
        }

        visitUrl(URLNode, visitArgs) {

            if (!this._inRule) {
                return URLNode;
            }
            if (URLNode.value && URLNode.value.value && URLNode.value.value.indexOf('#') === 0) {
              // Might be part of a VML url-node value like:
              // ``behavior:url(#default#VML);``
              return URLNode;
            }

            this._options.replaceUrls.forEach(function(replaceObject) {
                var matches = URLNode.value.value.match(replaceObject.find);
                if (!matches) return;

                // If action required by user, warn them
                if (replaceObject.action) {
                    // Output blank line to separate outputs
                    console.log("");
                    console.log("Take action:", replaceObject.action);
                    console.log("In file:", URLNode.currentFileInfo.filename);
                }

                URLNode.value.value = URLNode.value.value.replace(replaceObject.find, replaceObject.replaceWith);

            });

            return URLNode;

        }

    }

    return ReplaceUrls;

};