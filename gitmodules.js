const ChildProcess = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Fetch and parse .gitmodules
 * @returns {Object}
 */
function getModuleConfig() {
  const gitModulesPath = path.join(__dirname, './.gitmodules');
  if (!fs.existsSync(gitModulesPath)) return false;
  const boundaryRegExp = /\[submodule\s+"(.*?)"\]/;
  const propertyRegExp = /(.*?)\s*=\s*(.*)/;
  const str = fs.readFileSync(gitModulesPath).toString();
  const lines = str.split('\n');
  const ret = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const result = line.match(boundaryRegExp);
    if (!result || result.length < 2) continue;
    const submodule = result[1];
    const obj = {};
    if (!submodule) continue;
    let subline = lines[++i];
    while (subline && subline.trim()) {
      subline = lines[i];
      if (!subline || subline.match(boundaryRegExp)) {
        i--;
        break;
      }
      subline = subline.trim();
      const result = subline.match(propertyRegExp);
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
  PATH: `${process.env.PATH};${GITCOMPATIBILITY}`
});

// Clone submodules
for (const subPath in modules) {
  const dirPath = path.join(__dirname, subPath);
  const url = modules[subPath].url;
  const hasPackageJSON = fs.existsSync(path.join(dirPath, 'package.json'));
  if (hasPackageJSON) continue;
  console.log(`Cleaning ${subPath}`);
  // rmSync was introduced in node v14.14.0
  fs[fs.rmSync ? 'rmSync' : 'rmdirSync'](dirPath, { recursive: true, force: true });
  console.log(`Cloning submodule ${url} into ${subPath}`);
  ChildProcess.execSync(`git clone ${url} ${subPath}`, {
    cwd: __dirname,
    env,
    stdio: 'inherit'
  });
}

// Ensure submodules are on the appropriate branch
for (const subPath in modules) {
  const dirPath = path.join(__dirname, subPath);
  const branch = (modules[subPath].installBranch || modules[subPath].branch);
  const hasGit = fs.existsSync(path.join(dirPath, '.git'));
  if (!hasGit) continue;
  console.log(`Switching submodule ${subPath} to branch ${branch}`);
  ChildProcess.execSync(`git checkout ${branch}`, {
    cwd: dirPath,
    env,
    stdio: 'inherit'
  });
}
