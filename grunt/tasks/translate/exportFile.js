var path = require("path");
var fs = require("fs");
var csv = require("csv");
var async = require("async");

module.exports = function (grunt) {
  
  grunt.registerTask("_exportLangFiles", function () {
    
    var next = this.async();
    
    grunt.file.mkdir("languagefiles");
    formatExport();
    
    
    
    function formatExport () {
      var filename = "export_"+grunt.config("translate.masterLang");
      
      switch (grunt.config("translate.format")) {
        case "csv":
          _exportCSV(filename);
          break;
        
        default:
          _exportRaw(filename);
          break;
      }
    }
    
    
    function _exportCSV (filename) {
      var inputs = global.translate.exportTextData.reduce(function (prev, current) {
        if (!prev.hasOwnProperty(current.file)) {
          prev[current.file] = [];
        }
      
        prev[current.file].push([current.file+'/'+current.id+current.path, current.value]);
        return prev;
      }, {});
      
      var options = {
        delimiter: grunt.config("translate.csvDelimiter")
      };
      
      async.each(["course","contentObjects","articles","blocks","components"], _saveFile, _cb);
      
      function _saveFile (name, _cb) {
        csv.stringify(inputs[name], options, function (error, output) {
          if (error) {
            _cb(error);
          } else {
            var src = path.join("languagefiles",name+"_"+filename+".csv");
            grunt.file.write(src, output);
            _cb();
          }
        });
      }
      
      function _cb (error) {
        if (error) {
          throw grunt.util.error("Error saving CSV files.");
        }
        next();
      }
    }
    
    function _exportRaw (filename) {
      grunt.file.write(path.join("languagefiles",filename+".json"), JSON.stringify(global.translate.exportTextData," ", 4));
      next();
    }
    
  });
  
};

/*

global.translate.exportTextData = [
  {
    "file": "course",
    "id": "course",
    "path": "/title",
    "value": "Adapt Version 2.0 demonstartion"
  },
  {
    "file": "course",
    "id": "course",
    "path": "/displayTitle",
    "value": "Adapt Version 2.0 demonstration"
  }
]

*/