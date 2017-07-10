module.exports = function (grunt, options) {
    return {
        build: {
            files: '<%= outputdir %>/course/**/*.json'
        }
    }
}