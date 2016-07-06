module.exports = function (grunt) {
  
  var Helper = require("./helper.js")(grunt);
  
  global.translate.exportTextData = [];
  
  grunt.registerTask("_extractCourseData", function (mode) {

    processCourseData();

    // checks if _lookupTables has path
    function _lookupHasKey (ltIndex, mt, path) {
      return global.translate.lookupTables[ltIndex][mt].hasOwnProperty(path);
    }

    // checks if LookupValue is true
    function _lookupValueIsTrue (ltIndex, mt, path) {
      if (global.translate.lookupTables[ltIndex][mt][path] === true) {
        return true;
      } else {
        return false;
      }
    }
        
    // checks lookUpTable if path exists and if set to true
    function _shouldExportText (file, component, path) {
      if (Helper.modelTypeMap[file] === "component") {
        
        if (_lookupHasKey("models",Helper.modelTypeMap[file],path) || _lookupHasKey("components",component,path)) {
          if (_lookupValueIsTrue("models",Helper.modelTypeMap[file], path) || _lookupValueIsTrue("components",component,path)) {
            return true;
          }
        }
        return false;
        
      } else {
        
        if (_lookupHasKey("models",Helper.modelTypeMap[file],path)) {
          if (_lookupValueIsTrue("models",Helper.modelTypeMap[file],path)) {
            return true;
          }
        }
        return false;
      }
    }
    
    function _traverseCourse(data, level, path, lookupPath, id, file, component, cbs) {

      if (level === 0) {
        // at the root
        id = data.hasOwnProperty("_id") ? data._id : null;
        component = data.hasOwnProperty("_component") ? data._component : null;
      }
      
      
      if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          _traverseCourse(data[i], level+=1, path+i+"/", lookupPath, id, file, component, cbs);
        }
      
      } else if (typeof data === "object") {
        
        for (var attribute in data) {
          _traverseCourse(data[attribute], level+=1, path+attribute+"/", lookupPath+attribute+"/", id, file, component, cbs);
        }
        
      } else {
        // hanlde value (data)
        for (var j = 0; j < cbs.length; j++) {
          cbs[j].call(this, data, path, lookupPath, file, id, component);
        }
      }
    }
    
    function _collectTexts (data, path, lookupPath, file, id, component) {
      if (_shouldExportText(file, component, lookupPath)) {
        if (data) {
          global.translate.exportTextData.push({
            file: file,
            id: id,
            path: path,
            value: data
          });
        }
      }
    }
    
    function processCourseData () {
      
      ["config","course","contentObjects","articles","blocks","components"].forEach(function (file) {
        
        var cbs = [_collectTexts];

        if (Array.isArray(global.translate.courseData[file])) {
          for (var i = 0; i < global.translate.courseData[file].length; i++) {
            _traverseCourse(global.translate.courseData[file][i], 0, "/", "/", null, file, null, cbs);
          }
        } else {
          _traverseCourse(global.translate.courseData[file], 0, "/", "/", null, file, null, cbs);
        }

      });

    }

  });
  
};
