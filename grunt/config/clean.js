module.exports = {
    dist: {
        src: [
            '<%= sourcedir %>components/components.js',
            '<%= sourcedir %>extensions/extensions.js',
            '<%= sourcedir %>menu/menu.js',
            '<%= sourcedir %>theme/theme.js',
            '<%= sourcedir %>less',
            '<%= sourcedir %>templates',
            '<%= outputdir %>adapt/js/adapt.min.js.map'
        ]
    },
    output: {
        src: [
            '<%= outputdir %>'
        ]
    }
}
