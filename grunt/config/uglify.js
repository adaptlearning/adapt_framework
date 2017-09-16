module.exports = function (grunt, options) {
    return {
        minify: {
            files: [
                {
                    expand: true,
                    cwd: '<%= outputdir %>libraries/',
                    src: ['*.js', '!*.min.js'],
                    dest: '<%= outputdir %>libraries/'
                },
                {
                    expand: true,
                    cwd: '<%= outputdir %>/adapt/js',
                    src: ['*.js'],
                    dest: '<%= outputdir %>/adapt/js'
                },
                {
                    expand: true,
                    cwd: '<%= outputdir %>',
                    src: ['*.js', '!*.min.js'],
                    dest: '<%= outputdir %>'
                }
            ],
            options: {
                ie8: true
            }
        }
    }
}
