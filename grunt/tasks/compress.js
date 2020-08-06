module.exports = function(grunt) {

  grunt.registerTask('compress', 'Compress output folder assets', async function(mode) {
    const done = this.async();
    const options = this.options({});
    const fs = require('fs-extra');
    const globs = require('globs');

    async function compressImages() {
      grunt.log.ok(`Compressing images...`);
      const imagemin = require('imagemin');
      const imageminJpegtran = require('imagemin-jpegtran');
      const imageminPngquant = require('imagemin-pngquant');
      const imageminSvgo = require('imagemin-svgo');
      const sourceFiles = globs.sync(options.images.src);
      const destFiles = await imagemin(sourceFiles, {
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8]
          }),
          imageminSvgo({
            plugins: [
              {removeViewBox: false}
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
        done();
        break;
      default:
        await compressImages();
        done();
    }

  });





};
