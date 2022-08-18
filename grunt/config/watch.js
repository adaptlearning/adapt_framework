module.exports = {
  courseJson: {
    files: ['<%= outputdir %><%= coursedir %>/**/*.<%= jsonext %>', '<%= outputdir %><%= coursedir %>/*/language_data_manifest.js', '<%= sourcedir %>/node_modules/adapt-*/**/*.schema', '<%= sourcedir %>/node_modules/adapt-*/**/*.schema.json'],
    tasks: ['language-data-manifests', 'jsonlint', 'check-json', 'newer:copy:courseJson', 'schema-defaults']
  },
  packageJson: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/package.json', '<%= sourcedir %>/node_modules/adapt-*/bower.json'],
    tasks: ['dev']
  },
  scripts: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/scripts/**/*.js'],
    tasks: ['dev']
  },
  less: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/**/*.less'],
    tasks: ['less:dev']
  },
  handlebars: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/**/*.hbs'],
    tasks: ['handlebars', 'javascript:dev']
  },
  js: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/**/*.js', '<%= sourcedir %>/node_modules/adapt-*/**/*.jsx'],
    options: { spawn: false },
    tasks: ['javascript:dev', 'clean:temp']
  },
  assets: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/assets/**'],
    tasks: ['newer:copy:componentAssets']
  },
  fonts: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/fonts/**'],
    tasks: ['newer:copy:componentFonts']
  },
  libraries: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/libraries/**'],
    tasks: ['newer:copy:libraries']
  },
  required: {
    files: ['<%= sourcedir %>/node_modules/adapt-*/required/**'],
    tasks: ['newer:copy:required']
  }
};
