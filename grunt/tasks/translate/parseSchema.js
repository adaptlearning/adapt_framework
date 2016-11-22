var path = require("path");
var _ = require("underscore");

module.exports = function (grunt) {
  
  grunt.registerTask("_parseSchemaFiles", function () {
    
    var srcPath = grunt.config("sourcedir");
    
    global.translate.schemaData = {};
    
    getSchemaData();
    processGlobals();
    processPluginLocations();
    
    
    
    function getSchemaData () {
      [
        {
          type: "models",
          globPattern: "core/schema/*.schema",
          bowerAttr: false,
          schemaLabel: "models"
        },{
          type: "components",
          globPattern: "components/*/properties.schema",
          bowerAttr: "component",
          schemaLabel: "components"
        },{
          type: "extensions",
          globPattern: "extensions/*/properties.schema",
          bowerAttr: "targetAttribute",
          schemaLabel: "extensions"
        },{
          type: "menu",
          globPattern: "menu/*/properties.schema",
          bowerAttr: "targetAttribute",
          schemaLabel: "menu"
        }
      ].forEach(function (item) {
        global.translate.schemaData[item.schemaLabel] = {};
        grunt.file.expand(srcPath+item.globPattern).forEach(function (filepath) {
          var dir = path.parse(filepath).dir;
          var propertiesSchema = grunt.file.readJSON(filepath);
          var key;
          if (item.bowerAttr) {
            var bower = grunt.file.readJSON(path.join(dir,"bower.json"));
            key = bower[item.bowerAttr];
          } else {
            key = path.parse(filepath).name.split(".")[0];
          }
          
          global.translate.schemaData[item.schemaLabel][key] = {};
          global.translate.schemaData[item.schemaLabel][key].properties = propertiesSchema.properties || null;
          global.translate.schemaData[item.schemaLabel][key].globals = propertiesSchema.globals || null;
        });
      });
    }
    
    function processGlobals () {
      [
        {
          type: "components",
          schemaKey: "components", // key to find in global.translate.schemaData
          schemaLabel: "_components" // name used to save in global.translate.schemaData.models.course
        },{
          type: "extensions",
          schemaKey: "extensions",
          schemaLabel: "_extensions"
        },{
          type: "menu",
          schemaKey: "menu",
          schemaLabel: "_menu"
        }
      ].forEach(function (item) {
        var data = {};
        var collection = global.translate.schemaData[item.schemaKey];
        
        for (var key in collection) {
          var globals = collection[key].globals;
          if (globals !== null) {
            
            var name = key;
            if (item.type === "components") {
              name = "_"+key;
            }
            
            data[name] = {
              type: "object",
              properties: globals
            };
          }
        }
        
        global.translate.schemaData.models.course.properties._globals.properties[item.schemaLabel] = {
          type: "object",
          properties: data
        };
      });
    }
    
    function processPluginLocations () {
      [
        {
          type: "components",
          schemaKey: "components"
        },{
          type: "extensions",
          schemaKey: "extensions"
        },{
          type: "menu",
          schemaKey: "menu"
        }
      ].forEach(function (item) {
        var collection = global.translate.schemaData[item.schemaKey];
        
        for (var key in collection) {
          var properties = collection[key].properties;
          if (properties.hasOwnProperty("pluginLocations")) {
            var pluginLocations = properties.pluginLocations.properties;
            for (var location in pluginLocations) {
              if (pluginLocations[location].hasOwnProperty("properties")) {
                _copyPropertiesToLocation(location, pluginLocations[location].properties);
                delete global.translate.schemaData[item.schemaKey][key].properties.pluginLocations.properties[location];
              }
            }
          }
        }
        
      });
    }
      
    function _copyPropertiesToLocation (location, properties) {
      global.translate.schemaData.models[location].properties = _.extend(global.translate.schemaData.models[location].properties, properties);
    }
    
  });
  
};
