var csv = require("csv");
var path = require("path");
var async = require("async");
var jschardet = require("jschardet");
var iconv = require("iconv-lite");
var fs = require('fs');
var _ = require('underscore');

module.exports = function (grunt) {
  
  grunt.registerTask("_loadLanguageFiles", function () {
    
    var next = this.async();
    var langFiles;
    var inputFolder;
    global.translate.importData = [];
    
    checkInputFolder();
    autoDetectFormat();
    readLangFiles();
    processLangFiles();
    
    function checkInputFolder () {

      if (grunt.config("translate.targetLang") === null) {
        throw grunt.util.error('Target language option is missing, please add --targetLang=<languageCode>');
      } else if (!grunt.file.isDir("languagefiles", grunt.config("translate.targetLang"))) {
        throw grunt.util.error(grunt.config("translate.targetLang") + " Folder does not exist. Please create this Folder in the languagefiles directory.");
      }
      
      inputFolder = path.join("languagefiles", grunt.config("translate.targetLang"));
    }
    
    function autoDetectFormat () {
      if (grunt.option('format')) {
        // ignore autodetect mode if format is set
        return;
      }

      var fileExtensions = [];
      grunt.file.recurse(inputFolder, function(abspath, rootdir, subdir, filename) {
        fileExtensions.push(path.extname(filename));
      });

      var uniqueExtensions = _.uniq(fileExtensions);

      if (uniqueExtensions.length !== 1) {
        // autodetect failed, continue
        grunt.log.debug('format autodetection failed');
        return;
      }

      switch (uniqueExtensions[0]) {
        case ".csv":
          grunt.config('translate.format', 'csv');
          grunt.log.debug('format autodetected as csv');
          break;

        case ".json":
          grunt.config('translate.format', 'json');
          grunt.log.debug('format autodetected as json');
          break;
        
        default:
          throw grunt.util.error('Format of the language file is not supported: '+uniqueExtensions[0]);
          break;
      }
    }

    function readLangFiles () {

      // check if files exist
      langFiles = grunt.file.expand(path.join(inputFolder,"*." + grunt.config('translate.format')));

      if (langFiles.length === 0) {
        throw grunt.util.error("No languagefiles found to process in folder " + grunt.config('translate.targetLang'));
      }
    }
  
    function _parseCsvFiles () {
      var content = "";
      var lines = [];
      var options = {
        delimiter: grunt.config("translate.csvDelimiter")
      };
      
      async.each(langFiles, _parser, _cb);
      
      function _parser (filename) {
        var fileBuffer = grunt.file.read(filename, {encoding: null});
        var detected = jschardet.detect(fileBuffer);
        var fileContent;

        if (iconv.encodingExists(detected.encoding)) {
          fileContent = iconv.decode(fileBuffer, detected.encoding);
          grunt.log.debug(filename+' - encoding detected: '+detected.encoding);
        } else {
          fileContent = iconv.decode(fileBuffer, 'utf8');
          grunt.log.debug(filename+' - encoding not detected, used utf-8 instead');
        }

        csv.parse(fileContent, options, function (error, output) {
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
        throw grunt.util.error("Sorry, the imported File is not valid");
      }
      next();
    }
    
    function processLangFiles () {

      switch (grunt.config('translate.format')) {
        case "json":
          _parseJsonFile();
          break;
        
        case "csv":
        default:
          _parseCsvFiles();
          break;
      }
    }
    
  });
  
};
