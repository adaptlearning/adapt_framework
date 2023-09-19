const path = require('path');

module.exports = function(grunt, options) {

  const Helpers = require('../helpers')(grunt);

  const filterNullValues = function(obj) {
    // hack to fix bug https://github.com/adaptlearning/adapt_framework/issues/1867
    let value;

    if (obj instanceof Array) {
      for (let i = obj.length - 1; i >= 0; i--) {
        value = obj[i];
        if (value === null) {
          obj.splice(i, 1);
        } else if (typeof value === 'object') {
          obj[i] = filterNullValues(value);
        }
      }
    } else if (typeof obj === 'object') {
      for (const k in obj) {
        value = obj[k];
        if (value === null) {
          delete obj[k];
        } else if (typeof value === 'object') {
          obj[k] = filterNullValues(value);
        }
      }
    }

    return obj;

  };

  const generatePatterns = function() {
    const framework = Helpers.getFramework({ useOutputData: true });
    const data = framework.getData();

    try {
      const configJson = data.getConfigFileItem().item;
      const defaultLanguage = configJson._defaultLanguage || 'en';
      const courseJson = data.getLanguage(defaultLanguage).getCourseFileItem().item;

      // Backwards compatibility for courses missing 'description'
      if (!courseJson.hasOwnProperty('description')) {
        courseJson.description = '';
      }

      // A shim for edge cases where xAPI has not been configured.
      if (!configJson.hasOwnProperty('_xapi')) {
        configJson._xapi = {
          _activityID: '',
          _isEnabled: false
        };
      } else {
        // xAPI has been enabled, check if the activityID has been set.
        if (configJson._xapi.hasOwnProperty('_activityID') && configJson._xapi._activityID === '') {
          grunt.log.writeln('WARNING: xAPI activityID has not been set');
        }
      }

      // Shim to preserve the 'adapt_manifest' identifier.
      const spoor = configJson._spoor;
      if (spoor) {
        spoor._advancedSettings = spoor._advancedSettings || {};
        spoor._advancedSettings._manifestIdentifier = spoor._advancedSettings._manifestIdentifier || 'adapt_manifest';
      }

      // Combine the course, config and build JSON to pass to replace.
      return {
        course: filterNullValues(courseJson),
        config: filterNullValues(configJson),
        build: filterNullValues(Helpers.generateConfigData())
      };
    } catch (ex) {
      return {};
    }
  };

  return {
    dist: {
      options: {
        silent: true,
        patterns: [
          {
            json: function(done) {
              done(generatePatterns());
            }
          }
        ]
      },
      files: [
        {
          expand: true,
          flatten: true,
          src: [
            path.join(options.outputdir, '*.xml'),
            path.join(options.outputdir, '*.html')
          ],
          dest: options.outputdir
        }
      ]
    }
  };
};
