module.exports = function(grunt) {

  grunt.registerMultiTask('compress', 'Compress output folder images', async function() {

    const globs = require('globs');
    const fs = require('fs-extra');
    const imagemin = require('imagemin');
    const imageminJpegtran = require('imagemin-jpegtran');
    const imageminPngquant = require('imagemin-pngquant');
    const imageminSvgo = require('imagemin-svgo');

    const done = this.async();
    const options = this.options({});
    const sourceFiles = globs.sync(options.src);
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

    done();

  });

};
