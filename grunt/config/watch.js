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
        files: ['<%= sourcedir %>course/**/*.<% jsonext %>'],
        tasks : ['jsonlint', 'check-json', 'copy:courseJson', 'schema-defaults', 'create-json-config']
    },
    courseAssets: {
        files: ['<%= sourcedir %>course/<%=languages%>/*', '!<%= sourcedir %>course/<%=languages%>/*.<% jsonext %>'],
        tasks : ['copy:courseAssets']
    },
    js: {
        files: [
            '<%= sourcedir %>**/*.js',
            '!<%= sourcedir %>components/components.js',
            '!<%= sourcedir %>extensions/extensions.js',
            '!<%= sourcedir %>menu/menu.js',
            '!<%= sourcedir %>theme/theme.js',
            '!<%= sourcedir %>templates/templates.js',
            '!<%= sourcedir %>core/js/scriptLoader.js',
            '!<%= sourcedir %>core/js/libraries/require.min.js',
            '!<%= sourcedir %>core/js/libraries/modernizr.js',
            '!<%= sourcedir %>core/js/libraries/jquery.min.js'
        ],
        tasks: ['javascript:dev']
    },
    index: {
        files: ['<%= sourcedir %>index.html'],
        tasks: ['copy:index']
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
    scriptLoader: {
        files: ['<%= sourcedir %>core/js/scriptLoader.js'],
        tasks: ['copy:scriptLoader']
    },
    libraries: {
        files: [
            '<%= sourcedir %>core/js/libraries/require.min.js',
            '<%= sourcedir %>core/js/libraries/modernizr.js',
            '<%= sourcedir %>core/js/libraries/jquery.min.js'
        ],
        tasks: ['copy:libraries']
    },
    required: {
        files: ['<%= sourcedir %>extensions/*/required/**/*', '<%= sourcedir %>extensions/*/libraries/**/*'],
        tasks: 'copy:required'
    }
}
