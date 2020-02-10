module.exports = function(grunt, options) {
  return {
    prettify: {
      files: '<%= outputdir %>/course/**/*.<%= jsonext %>',
      options: {
        space: 2,
        replacer: null
      }
    }
  }
}
