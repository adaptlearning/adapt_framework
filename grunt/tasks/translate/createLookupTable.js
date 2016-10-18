module.exports = function (grunt) {
  
  grunt.registerTask("_createLookupTables", function () {
    
    global.translate.lookupTables = {};
    
    createLookUpTables();
    
    
    
    // function to test if a property should be picked from a schema file
    function _shouldTranslate (obj) {
      // return false if value should be skipped
      // return value that should be picked
      if (obj.hasOwnProperty("translatable")) {
        return obj.translatable;
      } else {
        return false;
      }
    }
    
    // _schemaData traverse function
    function _traverseSchemas (properties, store, path, shouldPickValue) {
    
      var _properties = properties,
          _path = path;
      
      for (var attributeName in _properties) {
        var description = _properties[attributeName];
        
        if (description.hasOwnProperty("editorOnly") || !description.hasOwnProperty("type")) {
          // go to next attribute
          continue;
        }
        
        switch (description.type) {
          case "string":
            // check if attribute should be picked
            var value = shouldPickValue(description);
            if (value !== false) {
              // add value to store
              store[path+attributeName+"/"] = value;
            }
            
            break;
          
          case "object":
            _traverseSchemas(description.properties, store, _path+attributeName+"/", shouldPickValue);
            break;
          
          case "array":
            if (!description.hasOwnProperty('items')) {
              // handles "inputType": "List" edge-case
              break;
            }

            if (description.items.type === "object") {
              _traverseSchemas(description.items.properties, store, _path+attributeName+"/", shouldPickValue);
            } else {
              var next = {};
              next[attributeName] = description.items;
              _traverseSchemas(next, store, _path, shouldPickValue);
            }
            break;
        }
        
      }
    }
    
    // traverse _schemaData
    function createLookUpTables () {
      global.translate.lookupTables.models = {};
      global.translate.lookupTables.components = {};
      
      Object.keys(global.translate.schemaData.components).forEach(function (component) {
        global.translate.lookupTables.components[component] = {};
        var properties = global.translate.schemaData.components[component].properties;
        _traverseSchemas(properties, global.translate.lookupTables.components[component], "/", _shouldTranslate);
      });

      Object.keys(global.translate.schemaData.models).forEach(function (type) {
        global.translate.lookupTables.models[type] = {};
        var properties = global.translate.schemaData.models[type].properties;
        _traverseSchemas(properties, global.translate.lookupTables.models[type], "/", _shouldTranslate);
      });
    }
    
  });
  
};
