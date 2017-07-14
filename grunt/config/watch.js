// TODO excludes
module.exports = {
    less: {
        files: ['src/**/*.less'],
        tasks: ['less:dev']
    },
    handlebars: {
        files: ['src/**/*.hbs'],
        tasks: ['handlebars', 'javascript:dev']
    },
    courseJson: {
        files: ['src/course/**/*.json'],
        tasks : ['jsonlint', 'check-json', 'copy:courseJson', 'schema-defaults', 'create-json-config']
    },
    courseAssets: {
        files: ['src/course/<%=languages%>/*', '!src/course/<%=languages%>/*.json'],
        tasks : ['copy:courseAssets']
    },
    js: {
        files: [
            'src/**/*.js',
            '!src/components/components.js',
            '!src/extensions/extensions.js',
            '!src/menu/menu.js',
            '!src/theme/theme.js',
            '!src/templates/templates.js',
            '!src/core/js/scriptLoader.js',
            '!src/core/js/libraries/require.js',
            '!src/core/js/libraries/modernizr.js',
            '!src/core/js/libraries/json2.js',
            '!src/core/js/libraries/consoles.js',
            '!src/core/js/libraries/jquery.js',
            '!src/core/js/libraries/jquery.v2.js'
        ],
        tasks: ['javascript:dev']
    },
    index: {
        files: ['src/index.html'],
        tasks: ['copy:index']
    },
    componentsAssets: {
        files: ['src/components/**/assets/**'],
        tasks: ['copy:componentAssets']
    },
    componentsFonts: {
        files: ['src/components/**/fonts/**'],
        tasks: ['copy:componentFonts']
    },
    extensionsAssets: {
        files: ['src/extensions/**/assets/**'],
        tasks: ['copy:extensionAssets']
    },
    extensionsFonts: {
        files: ['src/extensions/**/fonts/**'],
        tasks: ['copy:extensionFonts']
    },
    menuAssets: {
        files: ['src/menu/<%= menu %>/**/assets/**'],
        tasks: ['copy:menuAssets']
    },
    menuFonts: {
        files: ['src/menu/<%= menu %>/**/fonts/**'],
        tasks: ['copy:menuFonts']
    },
    themeAssets: {
        files: ['src/theme/<%= theme %>/**/assets/**'],
        tasks: ['copy:themeAssets']
    },
    themeFonts: {
        files: ['src/theme/<%= theme %>/**/fonts/**'],
        tasks: ['copy:themeFonts']
    },
    scriptLoader: {
        files: ['src/core/js/scriptLoader.js'],
        tasks: ['copy:scriptLoader']
    },
    libraries: {
        files: [
            'src/core/js/libraries/require.js',
            'src/core/js/libraries/modernizr.js',
            'src/core/js/libraries/json2.js',
            'src/core/js/libraries/consoles.js',
            'src/core/js/libraries/jquery.js',
            'src/core/js/libraries/jquery.v2.js'
        ],
        tasks: ['copy:libraries']
    },
    required: {
        files: ['src/extensions/*/required/**/*'],
        tasks: 'copy:required'
    }
}
