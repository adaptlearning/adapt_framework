module.exports = function(grunt) {
    return {
        components: {
            src: '<%= sourcedir %>components',
            dest: '<%= sourcedir %>components/components.js',
            options: {
                baseUrl: '<%= sourcedir %>',
                moduleName: 'components/components',
                filter: function(filepath) {
                    return grunt.config('helpers').excludedFilter(filepath);
                }
            }
        },
        extensions: {
            src: '<%= sourcedir %>extensions',
            dest: '<%= sourcedir %>extensions/extensions.js',
            options: {
                baseUrl: '<%= sourcedir %>',
                moduleName: 'extensions/extensions',
                filter: function(filepath) {
                    return grunt.config('helpers').excludedFilter(filepath);
                }
            }
        },
        menu: {
            src: '<%= sourcedir %>menu/',
            dest: '<%= sourcedir %>menu/menu.js',
            options: {
                include: '<%= menu %>',
                baseUrl: '<%= sourcedir %>',
                moduleName: 'menu/menu',
                filter: function(filepath) {
                    return grunt.config('helpers').excludedFilter(filepath);
                }
            }
        },
        theme: {
            src: '<%= sourcedir %>theme',
            dest: '<%= sourcedir %>theme/theme.js',
            options: {
                include: '<%= theme %>',
                baseUrl: '<%= sourcedir %>',
                moduleName: 'themes/themes',
                filter: function(filepath) {
                    return grunt.config('helpers').excludedFilter(filepath);
                }
            }
        }
    }
}
