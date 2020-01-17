var _ = require('underscore');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var fileorder = require('grunt-file-order');

module.exports = function(grunt) {

  var convertSlashes = /\\/g;

  // grunt tasks

  grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
    grunt.log.ok('Starting server in "' + grunt.config('outputdir') + '" using port ' + grunt.config('connect.server.options.port'));
  });
  grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
    var includes = grunt.config('includes');
    var excludes = grunt.config('excludes');

    if (includes && excludes) {
      grunt.fail.fatal('Cannot specify includes and excludes. Please check your config.json configuration.');
    }

    if (includes) {
      grunt.log.writeln('The following will be included in the build:');
      for (var i = 0, count = includes.length; i < count; i++)
        grunt.log.writeln('- ' + includes[i]);
      grunt.log.writeln('');
    }
    if (excludes) {
      grunt.log.writeln('The following will be excluded from the build:');
      for (var i = 0, count = excludes.length; i < count; i++)
        grunt.log.writeln('- ' + excludes[i]);
      grunt.log.writeln('');
    }

    grunt.log.ok('Using source at "' + grunt.config('sourcedir') + '"');
    grunt.log.ok('Building to "' + grunt.config('outputdir') + '"');
    if (grunt.config('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config('theme') + '"');
    if (grunt.config('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config('menu') + '"');
    if (grunt.config('languages') !== '**') grunt.log.ok('The following languages will be included in the build "' + grunt.config('languages') + '"');
  });

  // privates
  var generateIncludedRegExp = function() {
    var includes = grunt.config('includes') || [];
    var pluginTypes = exports.defaults.pluginTypes;

    // Return a more specific plugin regExp including src path.
    var re = _.map(includes, function(plugin) {
      return _.map(pluginTypes, function(type) {
        return exports.defaults.sourcedir + type + '\/' + plugin + '\/';
      }).join('|');
    }).join('|');
    return new RegExp(re, "i");
  };

  var generateNestedIncludedRegExp = function() {
    var includes = grunt.config('includes') || [];
    var folderRegEx = "less/plugins";

    // Return a more specific plugin regExp including src path.
    var re = _.map(includes, function(plugin) {
      return exports.defaults.sourcedir + '([^\/]*)\/([^\/]*)\/' + folderRegEx + '\/' + plugin + '\/';
    }).join('|');
    return new RegExp(re, "i");
  };

  var generateExcludedRegExp = function() {
    var excludes = grunt.config('excludes') || [];
    var pluginTypes = exports.defaults.pluginTypes;

    // Return a more specific plugin regExp including src path.
    var re = _.map(excludes, function(plugin) {
      return _.map(pluginTypes, function(type) {
        return exports.defaults.sourcedir + type + '\/' + plugin + '\/';
      }).join('|');
    }).join('|');
    return new RegExp(re, "i");
  };

  var generateScriptSafeRegExp = function() {
    var includes = grunt.config('scriptSafe') || [];
    var re = '';
    for (var i = 0, count = includes.length; i < count; i++) {
      re += '\/' + includes[i].toLowerCase() + '\/';
      if (i < includes.length - 1) re += '|';
    }
    return new RegExp(re, "i");
  };

  var appendSlash = function(dir) {
    if (dir) {
      var lastChar = dir.substring(dir.length - 1, dir.length);
      if (lastChar !== path.sep) return dir + path.sep;
    }
  };

  var includedProcess = function(content, filepath) {
    if (!exports.isPathIncluded(filepath)) return "";
    else return content;
  };

  var getIncludedRegExp = function() {
    var configValue = grunt.config('includedRegExp');
    return configValue || grunt.config('includedRegExp', generateIncludedRegExp());
  };

  var getNestedIncludedRegExp = function() {
    var configValue = grunt.config('nestedIncludedRegExp');
    return configValue || grunt.config('nestedIncludedRegExp', generateNestedIncludedRegExp());
  };

  var getExcludedRegExp = function() {
    var configValue = grunt.config('excludedRegExp');
    return configValue || grunt.config('excludedRegExp', generateExcludedRegExp());
  };

  var getScriptSafeRegExp = function() {
    var configValue = grunt.config('scriptSafeRegExp');
    return configValue || grunt.config('scriptSafeRegExp', generateScriptSafeRegExp());
  };

  // exported

  var exports = {};

  exports.defaults = {
    sourcedir: 'src' + path.sep,
    outputdir: 'build' + path.sep,
    jsonext: 'json',
    theme: '**',
    menu: '**',
    languages: '**',
    includes: [

    ],
    pluginTypes: [
      'components',
      'extensions',
      'menu',
      'theme'
    ],
    scriptSafe: [
      'adapt-contrib-xapi',
      'adapt-contrib-spoor'
    ]
  };

  // Convert the directory paths so that they work cross platform
  exports.defaults.sourcedir = exports.defaults.sourcedir.replace(convertSlashes, "/");
  exports.defaults.outputdir = exports.defaults.outputdir.replace(convertSlashes, "/");

  exports.getIncludes = function(buildIncludes, configData) {
    var dependencies = [];

    // Iterate over the plugin types.
    for (var i = 0; i < exports.defaults.pluginTypes.length; i++) {
      var pluginTypeDir = path.join(configData.sourcedir, exports.defaults.pluginTypes[i]);
      // grab a list of the installed (and included) plugins for this type
      var plugins = _.intersection(fs.readdirSync(pluginTypeDir), buildIncludes);
      for (var j = 0; j < plugins.length; j++) {
        try {
          var bowerJson = grunt.file.readJSON(path.join(pluginTypeDir, plugins[j], 'bower.json'));
          for (var key in bowerJson.dependencies) {
            if (!_.contains(buildIncludes, key)) dependencies.push(key);
          }
        } catch (error) {
          grunt.log.error(error);
        }
      }
    }

    return [].concat(exports.defaults.includes, buildIncludes, dependencies);
  };

  exports.generateConfigData = function() {

    var root = __dirname.split(path.sep).slice(0, -1).join(path.sep);
    var sourcedir = appendSlash(grunt.option('sourcedir')) || exports.defaults.sourcedir;
    var outputdir = appendSlash(grunt.option('outputdir')) || exports.defaults.outputdir;
    var jsonext = grunt.option('jsonext') || exports.defaults.jsonext;

    var languageFolders = "";
    if (grunt.option('languages') && grunt.option('languages').split(',').length > 1) {
      languageFolders = "{" + grunt.option('languages') + "}";
    } else {
      languageFolders = grunt.option('languages');
    }

    // Selectively load the course.json ('outputdir' passed by server-build)
    var configDir = grunt.option('outputdir') ? outputdir : sourcedir;
    // add root path if necessary, and point to course/config.json

    var configPath = path.join(path.resolve(root, configDir), 'course', 'config.' + jsonext);

    try {
      var buildConfig = grunt.file.readJSON(configPath).build;
    } catch (error) {
      grunt.log.error(error);
      process.exit();
    }

    var data = {
      root: root,
      sourcedir: sourcedir,
      outputdir: outputdir,
      jsonext: jsonext,
      theme: grunt.option('theme') || exports.defaults.theme,
      menu: grunt.option('menu') || exports.defaults.menu,
      languages: languageFolders || exports.defaults.languages,
      scriptSafe: exports.defaults.scriptSafe
    };

    if (buildConfig) {
      if (buildConfig.jsonext) data.jsonext = buildConfig.jsonext;
      if (buildConfig.includes) data.includes = exports.getIncludes(buildConfig.includes, data);
      if (buildConfig.excludes) data.excludes = buildConfig.excludes;
      if (buildConfig.scriptSafe) data.scriptSafe = buildConfig.scriptSafe.split(",").map(function(item) {
        return item.trim()
      });
    }

    return data;
  };

  /*
   * Uses the parent folder name (menu, theme, components, extensions).
   * Also caches a list of the installed plugins
   * assumption: all folders are plugins
   */
  exports.getInstalledPluginsByType = function(type) {
    var pluginDir = grunt.config('sourcedir') + type + '/';
    if (!grunt.file.isDir(pluginDir)) return []; // fail silently
    // return all sub-folders, and save for later
    return grunt.option(type, grunt.file.expand({
      filter: 'isDirectory',
      cwd: pluginDir
    }, '*'));
  };

  exports.isPluginInstalled = function(pluginName) {
    var types = ['components', 'extensions', 'theme', 'menu'];
    for (var i = 0, len = types.length; i < len; i++) {
      var plugins = grunt.option(types[i]) || this.getInstalledPluginsByType(types[i]);
      if (plugins.indexOf(pluginName) !== -1) return true;
    }
    return false;
  };

  exports.isPathIncluded = function(pluginPath) {
    pluginPath = pluginPath.replace(convertSlashes, "/");

    var includes = grunt.config('includes');
    var excludes = grunt.config('excludes');

    // carry on as normal if no includes/excludes
    if (!includes && !excludes) return true;

    // Very basic check to see if the file path string contains any
    // of the included list of plugin string names.
    var isIncluded = includes && pluginPath.search(getIncludedRegExp()) !== -1;
    var isExcluded = excludes && pluginPath.search(getExcludedRegExp()) !== -1;

    // Exclude any plugins that don't match any part of the full file path string.
    if (isExcluded || isIncluded === false) {
      // grunt.log.writeln('Excluded ' + chalk.red(pluginPath));
      return false;
    }

    // Check the LESS plugins folder exists.
    // The LESS 'plugins' folder doesn't exist, so add the file,
    // as the plugin has already been found in the previous check.
    var nestedPluginsPath = !!pluginPath.match(/(?:.)+(?:\/less\/plugins)/g);
    if (!nestedPluginsPath) {
      // grunt.log.writeln('Included ' + chalk.green(pluginPath));
      return true;
    }

    // The LESS 'plugins' folder exists, so check that any plugins in this folder are allowed.
    var hasPluginSubDirectory = !!pluginPath.match(getNestedIncludedRegExp());
    if (hasPluginSubDirectory) {
      // grunt.log.writeln('Included ' + chalk.green(pluginPath));
      return true;
    }

    // File might be in the included plugin/less/plugins directory,
    // but the naming convention or directory structure is not correct.
    // grunt.log.writeln('Excluded ' + chalk.red(pluginPath));
    return false;
  };

  exports.isPluginScriptSafe = function(pluginPath) {

    pluginPath = pluginPath.replace(convertSlashes, "/");
    var includes = grunt.config('scriptSafe');
    var isExplicitlyDefined = (includes && pluginPath.search(getScriptSafeRegExp()) !== -1);
    var isIncluded = grunt.option('allowscripts') || includes[0] === "*" || isExplicitlyDefined;

    if (!isIncluded) {
      //grunt.log.writeln('Excluded ' + chalk.red(pluginPath));
    } else {
      //grunt.log.writeln('Included ' + chalk.green(pluginPath));
    }

    return isIncluded;

  };

  exports.includedFilter = function(filepath) {
    return exports.isPathIncluded(filepath);
  };

  exports.scriptSafeFilter = function(filepath) {
    return exports.isPluginScriptSafe(filepath);
  };

  return exports;
};
