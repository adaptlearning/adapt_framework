const path = require('path');

module.exports = function(grunt) {
  return {
    compile: {
      options: {
        amd: 'handlebars',
        namespace: 'Handlebars.templates',
        processName: function(filePath) {
          let newFilePath = filePath.split('/');
          newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, '');
          return newFilePath;
        },
        partialRegex: /.*/,
        partialsPathRegex: /\/partials\//
      },
      files: [
        {
          src: [
            '<%= sourcedir %>/node_modules/adapt-*/templates/**/*.hbs'
          ],
          follow: true,
          dest: '<%= outputdir %>templates.js',
          filter: function(filepath) {
            if (filepath?.indexOf(path.join(grunt.config('sourcedir'), 'adapt-contrib-core')) > -1) {
              // Always include core templates.
              return true;
            }
            return grunt.option('helpers').includedFilter(filepath);
          },
          order: grunt.option('helpers').orderFilesByPluginType
        }
      ]
    }
  };
};
