const _ = require('underscore');
const fs = require('fs-extra');
const path = require('path');
// extends grunt.file.expand with { order: cb(filePaths) }
require('grunt-file-order');
const Framework = require('./helpers/Framework');

module.exports = function(grunt) {

  const convertSlashes = /\\/g;

  // grunt tasks

  grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
    grunt.log.ok(`Starting server in '${grunt.config('outputdir')}' using port ${grunt.config('connect.server.options.port')}`);
  });
  grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
    const includes = grunt.config('includes');
    const excludes = grunt.config('excludes');
    const productionExcludes = grunt.config('productionExcludes');

    if (includes && excludes) {
      grunt.fail.fatal('Cannot specify includes and excludes. Please check your config.json configuration.');
    }

    if (includes) {
      const count = includes.length;
      grunt.log.writeln('The following will be included in the build:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + includes[i]); }
      grunt.log.writeln('');
    }
    if (excludes) {
      const count = excludes.length;
      grunt.log.writeln('The following will be excluded from the build:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + excludes[i]); }
      grunt.log.writeln('');
    }
    if (productionExcludes) {
      const count = productionExcludes.length;
      grunt.log.writeln('The following will be excluded from the build in production:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + productionExcludes[i]); }
      grunt.log.writeln('');
    }

    grunt.log.ok(`Using source at '${grunt.config('sourcedir')}'`);
    grunt.log.ok(`Building to '${grunt.config('outputdir')}'`);
    if (grunt.config('theme') !== '**') grunt.log.ok(`Using theme '${grunt.config('theme')}'`);
    if (grunt.config('menu') !== '**') grunt.log.ok(`Using menu ${grunt.config('menu')}'`);
    if (grunt.config('languages') !== '**') grunt.log.ok(`The following languages will be included in the build '${grunt.config('languages')}'`);
  });

  // privates
  const generateIncludedRegExp = function() {
    const includes = grunt.config('includes') || [];
    const pluginTypes = exports.defaults.pluginTypes;

    // Return a more specific plugin regExp including src path.
    const re = _.map(includes, function(plugin) {
      return _.map(pluginTypes, function(type) {
        // eslint-disable-next-line no-useless-escape
        return exports.defaults.sourcedir + type + '\/' + plugin + '\/';
      }).join('|');
    }).join('|');
    // eslint-disable-next-line no-useless-escape
    const core = exports.defaults.sourcedir + 'core\/';
    return new RegExp(core + '|' + re, 'i');
  };

  const generateNestedIncludedRegExp = function() {
    const includes = grunt.config('includes') || [];
    const folderRegEx = 'less/plugins';

    // Return a more specific plugin regExp including src path.
    const re = _.map(includes, function(plugin) {
      // eslint-disable-next-line no-useless-escape
      return exports.defaults.sourcedir + '([^\/]*)\/([^\/]*)\/' + folderRegEx + '\/' + plugin + '\/';
    }).join('|');
    return new RegExp(re, 'i');
  };

  const generateExcludedRegExp = function() {
    const excludes = grunt.config('excludes') || [];
    if (grunt.config('type') === 'production') {
      const productionExcludes = grunt.config('productionExcludes') || [];
      excludes.push(...productionExcludes);
    }
    const pluginTypes = exports.defaults.pluginTypes;

    // Return a more specific plugin regExp including src path.
    const re = _.map(excludes, function(plugin) {
      return _.map(pluginTypes, function(type) {
        // eslint-disable-next-line no-useless-escape
        return exports.defaults.sourcedir + type + '\/' + plugin + '\/';
      }).join('|');
    }).join('|');
    return new RegExp(re, 'i');
  };

  const generateScriptSafeRegExp = function() {
    const includes = grunt.config('scriptSafe') || [];
    let re = '';
    const count = includes.length;

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-useless-escape
      re += '\/' + includes[i].toLowerCase() + '\/';
      if (i < includes.length - 1) re += '|';
    }
    return new RegExp(re, 'i');
  };

  const appendSlash = function(dir) {
    if (dir) {
      const lastChar = dir.substring(dir.length - 1, dir.length);
      if (lastChar !== path.sep) return dir + path.sep;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const includedProcess = function(content, filepath) {
    if (!exports.isPathIncluded(filepath)) return '';
    else return content;
  };

  const getIncludedRegExp = function() {
    const configValue = grunt.config('includedRegExp');
    return configValue || grunt.config('includedRegExp', generateIncludedRegExp());
  };

  const getNestedIncludedRegExp = function() {
    const configValue = grunt.config('nestedIncludedRegExp');
    return configValue || grunt.config('nestedIncludedRegExp', generateNestedIncludedRegExp());
  };

  const getExcludedRegExp = function() {
    const configValue = grunt.config('excludedRegExp');
    return configValue || grunt.config('excludedRegExp', generateExcludedRegExp());
  };

  const getScriptSafeRegExp = function() {
    const configValue = grunt.config('scriptSafeRegExp');
    return configValue || grunt.config('scriptSafeRegExp', generateScriptSafeRegExp());
  };

  // exported

  const exports = {

    defaults: {
      sourcedir: 'src/',
      outputdir: 'build/',
      coursedir: 'course',
      configdir: null,
      cachepath: null,
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
    },

    getIncludes: function(buildIncludes, configData) {
      const dependencies = [];

      // Iterate over the plugin types.
      for (let i = 0; i < exports.defaults.pluginTypes.length; i++) {
        const pluginTypeDir = path.join(configData.sourcedir, exports.defaults.pluginTypes[i]);
        // grab a list of the installed (and included) plugins for this type
        const plugins = _.intersection(fs.readdirSync(pluginTypeDir), buildIncludes);
        for (let j = 0; j < plugins.length; j++) {
          try {
            const bowerJson = grunt.file.readJSON(path.join(pluginTypeDir, plugins[j], 'bower.json'));
            for (const key in bowerJson.dependencies) {
              if (!_.contains(buildIncludes, key)) dependencies.push(key);
            }
          } catch (error) {
            grunt.log.error(error);
          }
        }
      }

      return [].concat(exports.defaults.includes, buildIncludes, dependencies);
    },

    generateConfigData: function() {

      const localConfigPath = exports.getLocalConfig();
      const localConfig = localConfigPath
        ? fs.readJSONSync(localConfigPath)
        : {};
      const defaults = Object.assign({}, exports.defaults, localConfig);

      const root = __dirname.split(path.sep).slice(0, -1).join(path.sep);
      const adaptJSON = fs.readJSONSync(`${root}/adapt.json`);
      const sourcedir = appendSlash(grunt.option('sourcedir')) || defaults.sourcedir;
      const outputdir = appendSlash(grunt.option('outputdir')) || defaults.outputdir;
      const cachepath = grunt.option('cachepath') || null;
      const tempdir = outputdir + '.temp/';
      const jsonext = grunt.option('jsonext') || defaults.jsonext;
      const coursedir = grunt.option('coursedir') || adaptJSON.coursedir || defaults.coursedir;

      let languageFolders = '';
      if (grunt.option('languages') && grunt.option('languages').split(',').length > 1) {
        languageFolders = '{' + grunt.option('languages') + '}';
      } else {
        languageFolders = grunt.option('languages');
      }

      // Selectively load the course.json ('outputdir' passed by server-build)
      const configDir = grunt.option('outputdir') ? outputdir : defaults.configdir ?? sourcedir;
      // add root path if necessary, and point to course/config.json

      const configPath = path.join(path.resolve(root, configDir), coursedir, 'config.' + jsonext);
      let buildConfig;

      try {
        buildConfig = grunt.file.readJSON(configPath).build || {};
      } catch (error) {
        grunt.log.error(error);
        process.exit();
      }

      const isDevelopmentBuild = process.argv.some(arg => (arg === 'dev' || arg.includes(':dev') || arg.includes('--dev')));
      const cacheAge = isNaN(grunt.option('cacheage'))
        ? 7 * 24 * 60 * 60 * 1000 // one week
        : parseInt(grunt.option('cacheage'));

      const data = {
        type: isDevelopmentBuild ? 'development' : 'production',
        root,
        sourcedir,
        outputdir,
        configdir: configDir,
        coursedir,
        cachepath,
        tempdir,
        jsonext,
        trackingIdType: grunt.option('trackingidtype') || 'block',
        theme: grunt.option('theme') || defaults.theme,
        menu: grunt.option('menu') || defaults.menu,
        languages: languageFolders || defaults.languages,
        scriptSafe: defaults.scriptSafe,
        strictMode: false,
        targets: buildConfig.targets || '',
        cacheAge
      };

      if (buildConfig.jsonext) data.jsonext = buildConfig.jsonext;
      if (buildConfig.includes) data.includes = exports.getIncludes(buildConfig.includes, data);
      if (buildConfig.excludes) data.excludes = buildConfig.excludes;
      if (buildConfig.productionExcludes) data.productionExcludes = buildConfig.productionExcludes;
      if (buildConfig.scriptSafe) {
        data.scriptSafe = buildConfig.scriptSafe.split(',').map(function(item) {
          return item.trim();
        });
      }
      if (Object.hasOwn(buildConfig, 'strictMode')) data.strictMode = buildConfig.strictMode;

      const framework = new Framework({
        rootPath: data.root,
        outputPath: data.outputdir,
        sourcePath: data.sourcedir,
        courseDir: data.coursedir,
        includedFilter: exports.includedFilter,
        jsonext: data.jsonext,
        trackingIdType: data.trackingIdType,
        useOutputData: Boolean(grunt.option('outputdir')),
        log: grunt.log.ok,
        warn: grunt.log.error
      });
      framework.load();

      data.availableLanguageNames = framework.getData().languageNames;

      return data;
    },

    /*
    * Uses the parent folder name (menu, theme, components, extensions).
    * Also caches a list of the installed plugins
    * assumption: all folders are plugins
    */
    getInstalledPluginsByType: function(type) {
      const pluginDir = grunt.config('sourcedir') + type + '/';
      if (!grunt.file.isDir(pluginDir)) return []; // fail silently
      // return all sub-folders, and save for later
      return grunt.option(type, grunt.file.expand({
        filter: 'isDirectory',
        cwd: pluginDir
      }, '*'));
    },

    isPluginInstalled: function(pluginName) {
      const types = ['components', 'extensions', 'theme', 'menu'];
      for (let i = 0, len = types.length; i < len; i++) {
        const plugins = grunt.option(types[i]) || this.getInstalledPluginsByType(types[i]);
        if (plugins.indexOf(pluginName) !== -1) return true;
      }
      return false;
    },

    isPathIncluded: function(pluginPath) {
      pluginPath = pluginPath.replace(convertSlashes, '/');

      const includes = grunt.config('includes');
      const excludes = grunt.config('excludes') || (grunt.config('type') === 'production' && grunt.config('productionExcludes'));

      // carry on as normal if no includes/excludes
      if (!includes && !excludes) return true;

      // Very basic check to see if the file path string contains any
      // of the included list of plugin string names.
      const isIncluded = includes && pluginPath.search(getIncludedRegExp()) !== -1;
      const isExcluded = excludes && pluginPath.search(getExcludedRegExp()) !== -1;

      // Exclude any plugins that don't match any part of the full file path string.
      if (isExcluded || isIncluded === false) {
        return false;
      }

      // Check the LESS plugins folder exists.
      // The LESS 'plugins' folder doesn't exist, so add the file,
      // as the plugin has already been found in the previous check.
      const nestedPluginsPath = !!pluginPath.match(/(?:.)+(?:\/less\/plugins)/g);
      if (!nestedPluginsPath) {
        return true;
      }

      // The LESS 'plugins' folder exists, so check that any plugins in this folder are allowed.
      const hasPluginSubDirectory = !!pluginPath.match(getNestedIncludedRegExp());
      if (hasPluginSubDirectory) {
        return true;
      }

      // File might be in the included plugin/less/plugins directory,
      // but the naming convention or directory structure is not correct.
      return false;
    },

    isPluginScriptSafe: function(pluginPath) {

      pluginPath = pluginPath.replace(convertSlashes, '/');
      const includes = grunt.config('scriptSafe');
      const isExplicitlyDefined = (includes && pluginPath.search(getScriptSafeRegExp()) !== -1);
      const isIncluded = grunt.option('allowscripts') || includes[0] === '*' || isExplicitlyDefined;

      return isIncluded;

    },

    includedFilter: function(filepath) {
      return exports.isPathIncluded(filepath);
    },

    scriptSafeFilter: function(filepath) {
      return exports.isPluginScriptSafe(filepath);
    },

    /** @returns {Framework} */
    getFramework: function({ useOutputData = Boolean(grunt.option('outputdir')) } = {}) {
      const buildConfig = exports.generateConfigData();
      const framework = new Framework({
        rootPath: buildConfig.root,
        outputPath: buildConfig.outputdir,
        sourcePath: buildConfig.sourcedir,
        courseDir: buildConfig.coursedir,
        includedFilter: exports.includedFilter,
        jsonext: buildConfig.jsonext,
        trackingIdType: buildConfig.trackingIdType,
        useOutputData,
        log: grunt.log.ok,
        warn: grunt.log.error
      });
      framework.load();
      return framework;
    },

    getLocalConfig: function() {
      if (Object.hasOwn(this, '_localConfigPath')) return this._localConfigPath;
      const fileName = '.adaptrc.json';
      let currentDir = path.resolve(process.cwd()).replace(convertSlashes, '/');
      while (currentDir.split('/').filter(Boolean).length > 0) {
        const filePath = `${currentDir}/${fileName}`;
        if (fs.existsSync(filePath)) {
          grunt.log.ok(`Using: ${filePath}`);
          this._localConfigPath = filePath;
          return filePath;
        }
        currentDir = currentDir.split('/').slice(0, -1).join('/');
      }
      return (this._localConfigPath = null);
    }

  };

  return exports;
};
