const ChildProcess = require("child_process");
const fs = require('fs');

/**
 * Fetch and parse .gitmodules
 * @returns {Object}
 */
function getModuleConfig() {
  const str = fs.readFileSync('./.gitmodules').toString();
  const lines = str.split('\n');
  const ret = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const result = line.match(/\[submodule\s+\"(.*?)\"\]/);
    if (!result || result.length < 2) continue;
    const submodule = result[1];
    const obj = {};
    if (!submodule) continue;
    let subline = lines[++i];
    while (subline && subline.trim()) {
      subline = lines[i];
      if (!subline || subline.match(/\[submodule\s+\"(.*?)\"\]/)) {
        i--;
        break;
      }
      subline = subline.trim();
      const [subginal, key, value] = subline.match(/(.*?)\s*=\s*(.*)/);
      if (key && value) obj[key] = value;
      i++;
    }
    ret[submodule] = obj;
  }
  return ret;
}

// Fix PATH environment variables for git bash
const env = Object.assign({}, process.env, {
  Path: `${process.env.Path};${process.env.PROGRAMFILES}\\Git\\mingw64\\libexec\\git-core;`
});

// Download submodules
ChildProcess.execSync('git submodule update --init --remote', {
  env,
  stdio: 'inherit'
});

// Ensure submodules are on the appropriate branch
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

