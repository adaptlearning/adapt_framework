module.exports = function(grunt, options) {
  const convertSlashes = /\\/g;
  const path = require('path');

  function alphanumericOrder(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function lengthOrder(a, b) {
    return a.length > b.length ? 1 : a.length < b.length ? -1 : 0;
  }

  function compareFilePaths(a, b) {
    /**
     * If not in the same folder sort alphanumerically
     */
    const aParsed = path.parse(a);
    const bParsed = path.parse(b);
    if (aParsed.dir !== bParsed.dir) return alphanumericOrder(a, b);

    /**
     * If names don't start with the same phrase sort alphanumerically
     */
    const aStartsB = bParsed.name.startsWith(aParsed.name);
    const bStartsA = aParsed.name.startsWith(bParsed.name);
    if (!aStartsB && !bStartsA) return alphanumericOrder(a, b);

    /**
     * If at the same level of nesting
     * In the same directory
     * Where one name starts the other
     * Sort by name length
     */
    return lengthOrder(aParsed.name, bParsed.name);
  }

  function sortLESSFilePaths(filepaths) {
    // convert windows slashes to unix slashes
    filepaths = filepaths.map(function(path) {
      return path.replace(convertSlashes, '/');
    });
    filepaths = filepaths.sort(compareFilePaths);
    filepaths = grunt.option('helpers').orderFilesByPluginType(filepaths);
    return filepaths;
  }

  function includedFilter(filepath) {
    return grunt.option('helpers').includedFilter(filepath);
  }

  const compileOptions = {
    baseUrl: '<%= sourcedir %>',
    mandatory: [
      '<%= sourcedir %>node_modules/adapt-contrib-core/less/**/*.less'
    ],
    src: [
      '<%= sourcedir %>node_modules/adapt-*/less/**/*.less'
    ],
    config: '<%= outputdir %><%= coursedir %>/config.<%= jsonext %>',
    dest: '<%= outputdir %>',
    cssFilename: 'adapt.css',
    mapFilename: 'adapt.css.map',
    filter: includedFilter,
    order: sortLESSFilePaths,
    replaceUrls: [
      {
        action: 'Replace url(../../assets/ with url(assets/',
        find: /\.\.\/\.\.\/assets\//,
        replaceWith: 'assets/'
      }
    ],
    sourcemaps: false,
    compress: true
  };

  const devOptions = {
    ...compileOptions,
    ...{ sourcemaps: true, compress: false }
  };

  return {
    dev: {
      options: devOptions,
      // newer configuration
      files: {
        '<%= outputdir %>adapt.css': [
          '<%= sourcedir %>/core/less/**/*.less',
          '<%= sourcedir %>/*/*/less/**/*.less'
        ]
      }
    },
    compile: {
      options: compileOptions
    }
  };
};
