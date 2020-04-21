module.exports = {
  compile: {
    options: {
      inputSourceMap: false,
      sourceType: 'script',
      minified: true,
      comments: false,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              ie: '11'
            }
          }
        ]
      ]
    },
    files: [{
      expand: true,
      cwd: '<%= tempdir %>',
      src: [
        'adapt.min.js'
      ],
      dest: '<%= outputdir %>adapt/js/',
      ext: '.min.js'
    }]
  },
  dev: {
    options: {
      sourceMap: true,
      inputSourceMap: true,
      sourceType: 'script',
      retainLines: true,
      minified: false,
      compact: false,
      comments: true,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              ie: '11'
            }
          }
        ]
      ]
    },
    files: [{
      expand: true,
      cwd: '<%= tempdir %>',
      src: [
        'adapt.min.js'
      ],
      dest: '<%= outputdir %>adapt/js/',
      ext: '.min.js'
    }]
  }
};
