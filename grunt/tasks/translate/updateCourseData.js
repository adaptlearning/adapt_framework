var _ = require("underscore");

module.exports = function (grunt) {
  
  grunt.registerTask("_updateCourseData", function () {
    
    replaceCourseData();
    
    
    function replaceCourseData () {
      
      global.translate.importData = _.sortBy(global.translate.importData, "file");
      
      for (var i = 0; i < global.translate.importData.length; i++) {
        if (global.translate.importData[i].file === "course") {
          _replaceData(false, global.translate.importData[i]);
        } else {
          _replaceData(true, global.translate.importData[i]);
        }
      }
    }
    
    function _replaceData (isCollection, data) {
      
      if (isCollection) {
        var index = global.translate.courseData[data.file].findIndex(function (item) {
          return item._id === data.id;
        });
        _setValueByPath(global.translate.courseData[data.file][index], data.value, data.path);
      } else {
        _setValueByPath(global.translate.courseData[data.file], data.value, data.path);
      }
    }
    
    function _setValueByPath (obj, value, path) {
      path = path.split("/").slice(1,-1);
      for (i = 0; i < path.length - 1; i++)
          obj = obj[path[i]];

      obj[path[i]] = value;
    }

  });
  
};
