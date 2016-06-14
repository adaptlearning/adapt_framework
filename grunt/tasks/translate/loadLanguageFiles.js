var csv = require("csv");
var path = require("path");
var async = require("async");

module.exports = function (grunt) {
  
  grunt.registerTask("_loadLanguageFiles", function () {
    
    var next = this.async();
    var langFiles = grunt.config("translate.langFiles");
    global.translate.importData = [];
    
    readLangFiles();
    processLangFiles();
    
    
    function readLangFiles () {
      
      // check if files exist
      if (typeof langFiles === "string") {
        langFiles = langFiles.split(",");
      }

      for (var i = 0; i < langFiles.length; i++) {
        if (grunt.file.exists("languagefiles", langFiles[i])) {
          langFiles[i] = path.join("languagefiles",langFiles[i]);
        } else {
          throw grunt.util.error(langFiles[i] + " not found");
        }
      }
    }
  
    function _parseCsvFiles () {
      var content = "";
      var lines = [];
      var options = {
        delimiter: grunt.config("translate.csvDelimiter")
      };
      
      async.each(langFiles, _parser, _cb);
      
      function _parser (item) {
        csv.parse(grunt.file.read(item), options, function (error, output) {
          if (error) {
            _cb(error);
          } else {
            lines = lines.concat(output);
            _cb();
          }
        });
      }
      
      function _cb (err) {
        if (err) {
          throw grunt.util.error("Error processing CSV files.");
        } else {
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var value = line[1];
            var key = line[0].split("/");
            var file = key[0];
            var id = key[1];
            var path = key.slice(2).join("/");
            
            if (line.length === 2) {
              global.translate.importData.push({
                file: file,
                id: id,
                path: "/"+path,
                value: value
              });
            }
          }
        }
        next();
      }
      
    }
  
    function _parseJsonFile () {
      // check if valid raw format
      global.translate.importData = grunt.file.readJSON(langFiles[0]);
      var item = global.translate.importData[0];
      var isValid = item.hasOwnProperty("file") && item.hasOwnProperty("id") && item.hasOwnProperty("path") && item.hasOwnProperty("value");
      
      if (!isValid) {
        throw grunt.util.error("Sorry, the imported Files are not valid");
      }
      next();
    }
    
    function processLangFiles () {
      var format = path.parse(langFiles[0]).ext;

      switch (format) {
        case ".csv":
          _parseCsvFiles();
          break;
        
        default:
          _parseJsonFile();
          break;
      }
    }
    
  });
  
};
