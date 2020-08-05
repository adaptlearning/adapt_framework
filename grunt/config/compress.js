module.exports = function(grunt, options) {
  return {
    options: {
      images: {
        src: [
          '<%= outputdir %>**/*.{jpg,jpeg,png,svg}'
        ]
      }
    }
  };
};
