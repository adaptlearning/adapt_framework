module.exports = {
    less: {
        src: [
            '<%= sourcedir %>core/less/*.less',
            '<%= sourcedir %>menu/<%= menu %>/**/*.less',
            '<%= sourcedir %>components/**/*.less',
            '<%= sourcedir %>extensions/**/*.less',
            '<%= sourcedir %>theme/<%= theme %>/**/*.less'
        ],
        dest: '<%= sourcedir %>less/adapt.less'
    }
}
