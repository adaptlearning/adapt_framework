const ChildProcess = require('child_process');
const fs = require('fs');

/**
 * Fetch and parse .gitmodules
 * @returns {Object}
 */
function getModuleConfig() {
  if (!fs.existsSync('./.gitmodules')) return false;
  const str = fs.readFileSync('./.gitmodules').toString();
  const lines = str.split('\n');
  const ret = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const result = line.match(/\[submodule\s+"(.*?)"\]/);
    if (!result || result.length < 2) continue;
    const submodule = result[1];
    const obj = {};
    if (!submodule) continue;
    let subline = lines[++i];
    while (subline && subline.trim()) {
      subline = lines[i];
      if (!subline || subline.match(/\[submodule\s+"(.*?)"\]/)) {
        i--;
        break;
      }
      subline = subline.trim();
      const result = subline.match(/(.*?)\s*=\s*(.*)/);
      const key = result[1];
      const value = result[2];
      if (key && value) obj[key] = value;
      i++;
    }
    ret[submodule] = obj;
  }
  return ret;
}

const modules = getModuleConfig();
if (!modules) process.exit();

// Fix PATH environment variables for git bash in both the terminal and AAT
const GITCOMPATIBILITY = `${process.env.PROGRAMFILES}\\Git\\bin;${process.env.PROGRAMFILES}\\Git\\mingw64\\libexec\\git-core;${process.env.APPDATA}\\..\\Local\\Programs\\Git\\mingw64\\libexec\\git-core`;
const env = Object.assign({}, process.env, {
  Path: `${process.env.Path};${GITCOMPATIBILITY}`,
  PATH: `${process.env.PATH};${GITCOMPATIBILITY}`,
});

// Clone submodules
for (const path in modules) {
  if (fs.existsSync(`${path}/package.json`)) continue;
  const url = modules[path].url;
  if (fs.existsSync(`${path}/.git`)) continue;
  console.log(`Cloning submodule ${url} to ${path}`);
  ChildProcess.execSync(`git clone ${url} ${path}`, {
    cwd: process.cwd(),
    env,
    stdio: 'inherit'
  });
}

// Ensure submodules are on the appropriate branch
for (const path in modules) {
  const branch = (modules[path].branch || 'master');
  if (!fs.existsSync(`${path}/.git`)) continue;
  console.log(`Switching submodule ${path} to branch ${branch}`);
  ChildProcess.execSync(`git checkout ${branch}`, {
    cwd: `${process.cwd()}/${path}`,
    env,
    stdio: 'inherit'
  });
}
