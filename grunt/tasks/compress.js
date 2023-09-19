module.exports = function(grunt) {
  grunt.registerTask('compress', 'Optimise course graphics', async function(mode) {
    const done = this.async();
    const options = this.options({});
    const fs = require('fs-extra');
    const globs = require('globs');
    async function compressImages() {
      grunt.log.ok('Compressing images...');
      let imagemin;
      let imageminJpegtran;
      let imageminPngquant;
      let imageminSvgo;
      try {
        imagemin = require('imagemin');
        imageminJpegtran = require('imagemin-jpegtran');
        imageminPngquant = require('imagemin-pngquant');
        imageminSvgo = require('imagemin-svgo');
      } catch (err) {
        grunt.log.error('Optional imagemin dependencies were not installed.');
        return;
      }
      const sourceFiles = globs.sync(options.images.src);
      const destFiles = await imagemin(sourceFiles, {
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8]
          }),
          imageminSvgo({
            plugins: [
              { removeViewBox: false }
            ]
          })
        ]
      });
      destFiles.forEach(file => {
        grunt.log.ok(file.sourcePath);
        fs.writeFileSync(file.sourcePath, file.data);
      });
    }
    switch (mode) {
      case 'images':
        await compressImages();
        break;
      default:
        await compressImages();
    }
    done();
  });
};
