const ChildProcess = require("child_process");
const fs = require('fs');

function getModuleConfig() {
  const str = fs.readFileSync('./.gitmodules').toString();
  const ss = str.split('\n');
  const ret = {};
  for (let idx = 0; idx < ss.length; idx++) {
      const line = ss[idx];
      const result = line.match(/\[submodule\s+\"(.*?)\"\]/);
      if (!result || result.length < 2) {
          continue;
      }
      const submodule = result[1];
      const obj = {};
      if (submodule) {
          let subline = ss[++idx];
          while (subline && subline.trim()) {
              subline = ss[idx];
              if (!subline || subline.match(/\[submodule\s+\"(.*?)\"\]/)) {
                  idx--;
                  break;
              }
              subline = subline.trim();
              const [subginal, key, value] = subline.match(/(.*?)\s*=\s*(.*)/);
              if (key && value) {
                  obj[key] = value;
              }
              idx++;
          }
          ret[submodule] = obj;
      }
  }
  return ret;
}

const env = Object.assign({}, process.env, {
  Path: `${process.env.Path};${process.env.PROGRAMFILES}\\Git\\mingw64\\libexec\\git-core;`
});

ChildProcess.execSync('git submodule update --init --remote', {
  env,
  stdio: 'inherit'
});

const modules = getModuleConfig();
for (const path in modules) {
  const branch = (modules[path].branch || 'master');
  console.log(`Switching submodule ${path} to branch ${branch}`)
  ChildProcess.execSync(`git checkout ${branch}`, {
    cwd: `${process.cwd()}/${path}`,
    env,
    stdio: 'inherit'
  });
}

