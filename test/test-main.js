var tests = [];
for (var file in window.__karma__.files) {
  if (/spec\//.test(file)) {
    tests.push(file);
  }
}

requirejs.config({
  baseUrl: '/base/src',
  paths: {
    lodash: '../bower_components/lodash/dist/lodash.min',
    spec: '../test/spec'
  },
  deps: tests,
  callback: window.__karma__.start
});

/*require.config({
    baseUrl: "src",
    mainConfigFile: "./config.js",
    deps: tests
    callback: window.__karma__.start
});*/