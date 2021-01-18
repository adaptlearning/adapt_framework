module.exports = function(grunt, options) {
  return {
    options: {
      images: {
        src: [
          '<%= configdir %>**/*.{jpg,jpeg,png,svg}'
        ]
      }
    }
  };
};
