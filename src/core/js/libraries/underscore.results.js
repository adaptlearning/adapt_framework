// 2017-09-06 https://github.com/cgkineo/underscore.results
define('underscore.results', [
  'underscore'
], function(_) {

  _.mixin({

    /*
      This function is useful to resolve instance properties which are an array or object
      or instance functions which return an array/object, to copy and extend the returned value.
    */
    resultExtend: function(instance, propertyName, withData, context) {

      /*
        Resolve the propertyName on the instance, it should be an object or array or
        a function returning an object or an array
      */
      var result;
      var attrValue = instance[propertyName];
      if (typeof attrValue === "function") {
        result = attrValue.call(context || instance, propertyName);
      } else {
        result = _.result(instance, propertyName);
      }

      var resultType = (result instanceof Array ? "array" : typeof result);

      if (!withData) {

        // If no withData assume we're just copying the result
        switch (resultType) {
          case "array":
            // Create a copy of result and return
            return result.slice(0);
          case "object":
            // Create a copy of result and return
            return _.extend({}, result);
          default:
            throw "Incorrect types in resultExtend";
        }

      }

      var withType = (withData instanceof Array ? "array" : typeof withData);

      // If no result, make a dummy one from the withData type
      if (!result) {

        switch (withType) {
          case "array":
            result = [];
            resultType = "array";
            break;
          case "object":
            result = {};
            resultType = "object";
            break;
          default:
            throw "Incorrect types in resultExtend";
        }

      }

      if (resultType !== withType) {
        throw "Incorrect types in resultExtend";
      }

      switch (resultType) {
        case "array":
          // Create a copy of result, concat new data and return
          return result.slice(0).concat(withData);
        case "object":
          // Create a copy of result, overwrite with new data and return
          return _.extend({}, result, withData);
      }

      // If the resolved result isn't an array or object throw an error
      throw "Incorrect types in resultExtend";

    }

  });

  return _;

});
