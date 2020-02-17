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
          "targets": {
            "ie": "11"
          }
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