// 2017-04-11 https://github.com/cgkineo/underscore.results
/*
    These function are useful inside Backbone as methods to grab instance properties listed either as
    an array/object or a function which returns an array/object, to create a copy of the
    returned value or to extend a copy of the returned value.
*/
define('underscore.results', [
    'underscore'
], function(_) {
    
    _.mixin({

        resultExtend: function(instance, propertyName, withData) {

            /* 
                resolve the property on the instance, it should be an object or array or 
                a function returning an object or an array
            */
            var result = _.result(instance, propertyName);

            /*
                check the type of the data we're trying to extend
            */
            var withType = (withData instanceof Array ? "array" : typeof withData);

            /*
                if the resolved result is empty, replace with the same type as the withData
            */
            if (!result) {
                switch (withType) {
                    case "array":
                        result = [];
                        break;
                    case "object":
                        retuls = {};
                        break;
                    default:
                        throw "Incorrect types in resultExtend";
                }
            }

            /*
                if the resolved result and the withData type don't match throw an error
            */
            var resultType = (result instanceof Array ? "array" : typeof result);
            if (resultType != withType) {
                throw "Incorrect types in resultExtend";
            }

            switch (resultType) {
            case "array":
                //create copy of result, concat new data and return uniq values
                return _.uniq(result.slice(0).concat(withData));
            case "object":
                //create copy of result and overwrite with new data
                return _.extend({}, result, withData);
            }

            /*
                if the resolved result isn't an array or object throw an error
            */
            throw "Incorrect types in resultExtend";

        },

        resultCopy: function(instance, propertyName, defaultResult) {

            /* 
                resolve the property on the instance, it should be an object or array or 
                a function returning an object or an array
            */
            var result = _.result(instance, propertyName, defaultResult);

            /*
                check the type of the data we're trying to copy from the defaultType
            */
            var defaultType = (defaultResult instanceof Array ? "array" : typeof defaultResult);

            if (!result) {
                switch (defaultType) {
                    case "array":
                        result = [];
                        break;
                    case "object":
                        retuls = {};
                        break;
                    default:
                        /*
                            if no default type is supplied or is invalid throw an error
                        */
                        throw "Incorrect types in resultCopy";
                }
            }

            /*
                if the resolved result and the default type don't match throw an error
            */
            var resultType = (result instanceof Array ? "array" : typeof result);
            if (resultType != defaultType) {
                throw "Incorrect types in resultCopy";
            }

            switch (resultType) {
            case "array":
                //create copy of result
                return result.slice(0);
            case "object":
                //create copy of result
                return _.extend({}, result);
            }

            /*
                if the resolved result isn't an array or object throw an error
            */
            throw "Incorrect types in resultCopy";

        }

    });

    return _;

});