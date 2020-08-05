module.exports = function(grunt, options) {
  return {
    images: {
      options: {
        src: [
          '<%= outputdir %>**/*.{jpg,jpeg,png,svg}'
        ]
      }
    }
  };
};
