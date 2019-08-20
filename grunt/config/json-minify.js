module.exports = function(grunt, options) {
  return {
    minify: {
      files: '<%= outputdir %>/course/**/*.<%= jsonext %>'
    }
  }
}
