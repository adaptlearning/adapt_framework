module.exports = {
  options: {
    sourceMap: true,
    inputSourceMap: true,
    sourceType: 'script',
    minified: true,
    comments: false,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            ie: 11
          },
          spec: true,
          exclude: [
            'transform-regenerator',
            'transform-async-to-generator'
          ]
        }
      ],
    ],
    plugins: [
      [
        'module:fast-async',
        {
          spec: true
        }
      ]
    ]
  },
  dist: {
    files: [{
      "expand": true,
      "cwd": "<%= tempdir %>",
      "src": [
        "adapt.min.js"
      ],
      "dest": "<%= outputdir %>adapt/js/",
      "ext": ".min.js"
    }]
  }
};
