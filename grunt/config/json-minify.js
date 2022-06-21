module.exports = function(grunt, options) {
  return {
    minify: {
      files: '<%= outputdir %>/<%= coursedir %>/**/*.<%= jsonext %>'
    }
  };
};
