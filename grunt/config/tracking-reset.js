module.exports = function(grunt) {
  return {
    options: {
      courseFile: 'course/*/course.<%= jsonext %>',
      blocksFile: 'course/*/blocks.<%= jsonext %>'
    }
  };
};
