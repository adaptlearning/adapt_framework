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
        tasks : ['jsonlint', 'check-json', 'newer:copy:courseJson', 'schema-defaults', 'create-json-config']
    },
    courseAssets: {
        files: ['<%= sourcedir %>course/<%=languages%>/*', '!<%= sourcedir %>course/<%=languages%>/*.<%= jsonext %>'],
        tasks : ['newer:copy:courseAssets']
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
            '!<%= sourcedir %>core/js/libraries/**/*.js',
            '!<%= sourcedir %>extensions/*/libraries/**/*.js',
            '!<%= sourcedir %>components/**/libraries/**/*.js',
            '!<%= sourcedir %>menu/<%= menu %>/libraries/**/*.js', 
            '!<%= sourcedir %>theme/<%= theme %>/libraries/**/*.js'
        ],
        tasks: ['javascript:dev']
    },
    index: {
        files: ['<%= sourcedir %>index.html'],
        tasks: ['newer:copy:index']
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
    scriptLoader: {
        files: ['<%= sourcedir %>core/js/scriptLoader.js'],
        tasks: ['newer:copy:scriptLoader']
    },
    libraries: {
        files: ['<%= sourcedir %>core/js/libraries/**/*'],
        tasks: ['newer:copy:libraries']
    },
    required: {
        files: [
            '<%= sourcedir %>extensions/*/required/**/*',
            '<%= sourcedir %>extensions/*/libraries/**/*',
            '<%= sourcedir %>components/**/libraries/**/*',
            '<%= sourcedir %>menu/<%= menu %>/libraries/**/*',
            '<%= sourcedir %>theme/<%= theme %>/libraries/**/*'
        ],
        tasks: 'newer:copy:required'
    }
}
