var tests = [];
for (var file in window.__karma__.files) {
  if (/spec\//.test(file)) {
    tests.push(file);
  }
}

require.config({
    baseUrl: "src",
    mainConfigFile: "./config.js",
    deps: tests
    callback: window.__karma__.start
});