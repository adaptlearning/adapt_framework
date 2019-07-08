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
        files: ['<%= sourcedir %>course/**/*.<%= jsonext %>'],
        tasks : ['jsonlint', 'check-json', 'copy:courseJson', 'schema-defaults', 'create-json-config']
    },
    courseAssets: {
        files: ['<%= sourcedir %>course/<%=languages%>/*', '!<%= sourcedir %>course/<%=languages%>/*.<%= jsonext %>'],
        tasks : ['copy:courseAssets']
    },
    js: {
        files: ['<%= sourcedir %>**/*.js'],
        tasks: ['javascript:dev']
    },
    componentsAssets: {
        files: ['<%= sourcedir %>components/**/assets/**'],
        tasks: ['copy:componentAssets']
    },
    componentsFonts: {
        files: ['<%= sourcedir %>components/**/fonts/**'],
        tasks: ['copy:componentFonts']
    },
    extensionsAssets: {
        files: ['<%= sourcedir %>extensions/**/assets/**'],
        tasks: ['copy:extensionAssets']
    },
    extensionsFonts: {
        files: ['<%= sourcedir %>extensions/**/fonts/**'],
        tasks: ['copy:extensionFonts']
    },
    menuAssets: {
        files: ['<%= sourcedir %>menu/<%= menu %>/**/assets/**'],
        tasks: ['copy:menuAssets']
    },
    menuFonts: {
        files: ['<%= sourcedir %>menu/<%= menu %>/**/fonts/**'],
        tasks: ['copy:menuFonts']
    },
    themeAssets: {
        files: ['<%= sourcedir %>theme/<%= theme %>/**/assets/**'],
        tasks: ['copy:themeAssets']
    },
    themeFonts: {
        files: ['<%= sourcedir %>theme/<%= theme %>/**/fonts/**'],
        tasks: ['copy:themeFonts']
    },
    libraries: {
        files: ['<%= sourcedir %>core/libraries/**/*','<%= sourcedir %>*/*/libraries/**/*'],
        tasks: ['copy:libraries']
    },
    required: {
        files: ['<%= sourcedir %>core/required/**/*','<%= sourcedir %>*/*/required/**/*'],
        tasks: 'copy:required'
    }
}
