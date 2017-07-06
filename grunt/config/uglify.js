module.exports = function (grunt, options) {
    return {
        libraries: {
            files: [{
                expand: true,
                cwd: '<%= outputdir %>libraries/',
                src: ['*.js', '!*.min.js'],
                dest: '<%= outputdir %>libraries/'
            }]
        }
    }
}