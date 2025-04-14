// TODO excludes
module.exports = {
  bowerJson: {
    files: ['<%= sourcedir %>*/*/bower.json'],
    tasks: ['build-config', 'dev']
  },
  scripts: {
    files: ['<%= sourcedir %>*/*/scripts/*'],
    tasks: ['build-config', 'dev']
  },
  less: {
    files: ['<%= sourcedir %>**/*.less'],
    tasks: ['build-config', 'less:dev']
  },
  handlebars: {
    files: ['<%= sourcedir %>**/*.hbs'],
    tasks: ['build-config', 'handlebars', 'javascript:dev']
  },
  courseJson: {
    files: ['<%= sourcedir %><%= coursedir %>/**/*.<%= jsonext %>', '<%= outputdir %><%= coursedir %>/*/language_data_manifest.js'],
    tasks: ['build-config', 'language-data-manifests', 'jsonlint', 'check-json', 'newer:copy:courseJson', 'schema-defaults']
  },
  courseAssets: {
    files: ['<%= sourcedir %><%= coursedir %>/<%=languages%>/*', '!<%= sourcedir %><%= coursedir %>/<%=languages%>/*.<%= jsonext %>'],
    tasks: ['build-config', 'newer:copy:courseAssets']
  },
  js: {
    files: ['<%= sourcedir %>**/*.js', '<%= sourcedir %>**/*.jsx'],
    options: {
      spawn: false
    },
    tasks: ['build-config', 'javascript:dev', 'clean:temp']
  },
  componentsAssets: {
    files: ['<%= sourcedir %>components/**/assets/**'],
    tasks: ['build-config', 'newer:copy:componentAssets']
  },
  componentsFonts: {
    files: ['<%= sourcedir %>components/**/fonts/**'],
    tasks: ['build-config', 'newer:copy:componentFonts']
  },
  extensionsAssets: {
    files: ['<%= sourcedir %>extensions/**/assets/**'],
    tasks: ['build-config', 'newer:copy:extensionAssets']
  },
  extensionsFonts: {
    files: ['<%= sourcedir %>extensions/**/fonts/**'],
    tasks: ['build-config', 'newer:copy:extensionFonts']
  },
  menuAssets: {
    files: ['<%= sourcedir %>menu/<%= menu %>/**/assets/**'],
    tasks: ['build-config', 'newer:copy:menuAssets']
  },
  menuFonts: {
    files: ['<%= sourcedir %>menu/<%= menu %>/**/fonts/**'],
    tasks: ['build-config', 'newer:copy:menuFonts']
  },
  themeAssets: {
    files: ['<%= sourcedir %>theme/<%= theme %>/**/assets/**'],
    tasks: ['build-config', 'newer:copy:themeAssets']
  },
  themeFonts: {
    files: ['<%= sourcedir %>theme/<%= theme %>/**/fonts/**'],
    tasks: ['build-config', 'newer:copy:themeFonts']
  },
  libraries: {
    files: ['<%= sourcedir %>core/libraries/**/*', '<%= sourcedir %>*/*/libraries/**/*'],
    tasks: ['build-config', 'newer:copy:libraries']
  },
  required: {
    files: ['<%= sourcedir %>core/required/**/*', '<%= sourcedir %>*/*/required/**/*'],
    tasks: ['build-config', 'newer:copy:required']
  }
};
