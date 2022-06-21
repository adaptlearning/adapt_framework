module.exports = function(grunt, options) {
  var convertSlashes = /\\/g;
  var path = require('path');

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
    var aParsed = path.parse(a);
    var bParsed = path.parse(b);
    if (aParsed.dir !== bParsed.dir) return alphanumericOrder(a, b);

    /**
     * If names don't start with the same phrase sort alphanumerically
     */
    var aStartsB = bParsed.name.startsWith(aParsed.name);
    var bStartsA = aParsed.name.startsWith(bParsed.name);
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
    return filepaths.sort(compareFilePaths);
  }

  function includedFilter(filepath) {
    return grunt.config('helpers').includedFilter(filepath);
  }

  return {
    dev: {
      options: {
        baseUrl: '<%= sourcedir %>',
        mandatory: [
          '<%= sourcedir %>core/less/**/*.less'
        ],
        src: [
          '<%= sourcedir %>components/**/*.less',
          '<%= sourcedir %>extensions/**/*.less',
          '<%= sourcedir %>menu/<%= menu %>/**/*.less',
          '<%= sourcedir %>theme/<%= theme %>/**/*.less'
        ],
        config: '<%= outputdir %><%= coursedir %>/config.<%= jsonext %>',
        sourcemaps: true,
        compress: false,
        dest: '<%= outputdir %>',
        cssFilename: 'adapt.css',
        mapFilename: 'adapt.css.map',
        filter: includedFilter,
        order: sortLESSFilePaths,
        replaceUrls: [
          {
            'action': 'Replace url(../../assets/ with url(assets/',
            'find': /\.\.\/\.\.\/assets\//,
            'replaceWith': 'assets/'
          }
        ]
      },
      // newer configuration
      files: {
        '<%= outputdir %>adapt.css': [
          '<%= sourcedir %>/**/*.less'
        ]
      }
    },
    compile: {
      options: {
        baseUrl: '<%= sourcedir %>',
        mandatory: [
          '<%= sourcedir %>core/less/**/*.less'
        ],
        src: [
          '<%= sourcedir %>components/**/*.less',
          '<%= sourcedir %>extensions/**/*.less',
          '<%= sourcedir %>menu/<%= menu %>/**/*.less',
          '<%= sourcedir %>theme/<%= theme %>/**/*.less'
        ],
        config: '<%= outputdir %><%= coursedir %>/config.<%= jsonext %>',
        sourcemaps: false,
        compress: true,
        dest: '<%= outputdir %>',
        cssFilename: 'adapt.css',
        mapFilename: 'adapt.css.map',
        filter: includedFilter,
        order: sortLESSFilePaths,
        replaceUrls: [
          {
            'action': 'Replace url(../../assets/ with url(assets/',
            'find': /\.\.\/\.\.\/assets\//,
            'replaceWith': 'assets/'
          }
        ]
      }
    }
  };
};
