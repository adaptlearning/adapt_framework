module.exports = {
    components: {
        src: '<%= sourcedir %>components',
        dest: '<%= sourcedir %>components/components.js',
        options: {
            baseUrl: '<%= sourcedir %>',
            moduleName: 'components/components'
        }
    },
    extensions: {
        src: '<%= sourcedir %>extensions',
        dest: '<%= sourcedir %>extensions/extensions.js',
        options: {
            baseUrl: '<%= sourcedir %>',
            moduleName: 'extensions/extensions'
        }
    },
    menu: {
        src: '<%= sourcedir %>menu/',
        dest: '<%= sourcedir %>menu/menu.js',
        options: {
            include: '<%= menu %>',
            baseUrl: '<%= sourcedir %>',
            moduleName: 'menu/menu'
        }
    },
    theme: {
        src: '<%= sourcedir %>theme',
        dest: '<%= sourcedir %>theme/theme.js',
        options: {
            include: '<%= theme %>',
            baseUrl: '<%= sourcedir %>',
            moduleName: 'themes/themes'
        }
    }
}
