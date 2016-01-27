module.exports = {
    src: [
        'src/**/*.js',
        '!src/core/js/libraries/*.js'
    ],
    options: {
        reporter: require('jshint-stylish'),
        undef: true,
        asi: true,
        eqnull: false,
        sub: true,
        browser: true,
        es3: true,
        jquery: true,
        globals: {
            Backbone: false,
            Handlebars: false,
            _: false,
            define: false,
            require: false,
            JSON: true
        }
    }
}
