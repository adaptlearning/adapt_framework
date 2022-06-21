// TODO excludes
module.exports = {
  bowerJson: {
    files: ['<%= sourcedir %>*/*/bower.json'],
    tasks: ['dev']
  },
  scripts: {
    files: ['<%= sourcedir %>*/*/scripts/*'],
    tasks: ['dev']
  },
  less: {
    files: ['<%= sourcedir %>**/*.less'],
    tasks: ['less:dev']
  },
  handlebars: {
    files: ['<%= sourcedir %>**/*.hbs'],
    tasks: ['handlebars', 'javascript:dev']
  },
  courseJson: {
    files: ['<%= sourcedir %><%= coursedir %>/**/*.<%= jsonext %>', '<%= outputdir %><%= coursedir %>/*/language_data_manifest.js'],
    tasks: ['language-data-manifests', 'jsonlint', 'check-json', 'newer:copy:courseJson', 'schema-defaults']
  },
  courseAssets: {
    files: ['<%= sourcedir %><%= coursedir %>/<%=languages%>/*', '!<%= sourcedir %><%= coursedir %>/<%=languages%>/*.<%= jsonext %>'],
    tasks: ['newer:copy:courseAssets']
  },
  js: {
    files: ['<%= sourcedir %>**/*.js', '<%= sourcedir %>**/*.jsx'],
    options: {
      spawn: false
    },
    tasks: ['javascript:dev', 'clean:temp']
  },
  componentsAssets: {
    files: ['<%= sourcedir %>components/**/assets/**'],
    tasks: ['newer:copy:componentAssets']
  },
  componentsFonts: {
    files: ['<%= sourcedir %>components/**/fonts/**'],
    tasks: ['newer:copy:componentFonts']
  },
  extensionsAssets: {
    files: ['<%= sourcedir %>extensions/**/assets/**'],
    tasks: ['newer:copy:extensionAssets']
  },
  extensionsFonts: {
    files: ['<%= sourcedir %>extensions/**/fonts/**'],
    tasks: ['newer:copy:extensionFonts']
  },
  menuAssets: {
    files: ['<%= sourcedir %>menu/<%= menu %>/**/assets/**'],
    tasks: ['newer:copy:menuAssets']
  },
  menuFonts: {
    files: ['<%= sourcedir %>menu/<%= menu %>/**/fonts/**'],
    tasks: ['newer:copy:menuFonts']
  },
  themeAssets: {
    files: ['<%= sourcedir %>theme/<%= theme %>/**/assets/**'],
    tasks: ['newer:copy:themeAssets']
  },
  themeFonts: {
    files: ['<%= sourcedir %>theme/<%= theme %>/**/fonts/**'],
    tasks: ['newer:copy:themeFonts']
  },
  libraries: {
    files: ['<%= sourcedir %>core/libraries/**/*', '<%= sourcedir %>*/*/libraries/**/*'],
    tasks: ['newer:copy:libraries']
  },
  required: {
    files: ['<%= sourcedir %>core/required/**/*', '<%= sourcedir %>*/*/required/**/*'],
    tasks: ['newer:copy:required']
  }
};
