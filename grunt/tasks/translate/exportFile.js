var path = require("path");
var fs = require("fs");
var csv = require("csv");
var async = require("async");

module.exports = function (grunt) {
  
  grunt.registerTask("_exportLangFiles", function () {
    
    var next = this.async();
    
    var outputFolder = path.join(process.cwd(), "languagefiles", grunt.config("translate.masterLang"));
    if (grunt.option("languagedir")) outputFolder = path.join(grunt.option("languagedir"), grunt.config("translate.masterLang"));

    grunt.file.mkdir(outputFolder);
    formatExport();
    
    
    
    function formatExport () {
      var filename = "export";
      
      switch (grunt.config("translate.format")) {
        case "json":
          _exportRaw(filename);
          break;
        
        case "csv":
        default:
          _exportCSV(filename);
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
        quotedString: true,
        delimiter: grunt.config("translate.csvDelimiter")
      };
      
      var fileNames = Object.keys(inputs);
      
      async.each(fileNames, _saveFile, _cb);
      
      function _saveFile (name, _cb) {
        csv.stringify(inputs[name], options, function (error, output) {
          if (error) {
            _cb(error);
          } else {
            var src = path.join(outputFolder, name+".csv");
            grunt.file.write(src, "\ufeff" + output);
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
      grunt.file.write(path.join(outputFolder, filename + "." + grunt.config('jsonext')), JSON.stringify(global.translate.exportTextData, null, 4));
      next();
    }
    
  });
  
};
