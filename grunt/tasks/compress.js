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
        imagemin = (await import('imagemin')).default;
        imageminJpegtran = (await import('imagemin-jpegtran')).default;
        imageminPngquant = (await import('imagemin-pngquant')).default;
        imageminSvgo = (await import('imagemin-svgo')).default;
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
            plugins: [{
              name: 'removeViewBox',
              active: false
            }]
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
