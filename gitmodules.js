const ChildProcess = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Fetch and parse .gitmodules
 * @returns {Object}
 */
function getModuleConfig() {
  if (!fs.existsSync(path.join(__dirname, './.gitmodules'))) return false;
  const str = fs.readFileSync(path.join(__dirname, './.gitmodules')).toString();
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
for (const subPath in modules) {
  const dirPath = path.join(__dirname, subPath);
  const url = modules[subPath].url;
  const hasPackageJSON = fs.existsSync(path.join(dirPath, 'package.json'));
  if (!hasPackageJSON) {
    console.log(`Removing erroneous files from ${subPath}`);
    fs.rmSync(path.join(dirPath), { recursive: true, force: true });
  }
  if (hasPackageJSON) {
    console.log(`Updating ${subPath} from origin`);
    ChildProcess.execSync(`git fetch --prune`, {
      cwd: dirPath,
      env,
      stdio: 'inherit'
    });
    continue;
  };
  console.log(`Cloning submodule ${url} to ${subPath}`);
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
  if (!fs.existsSync(path.join(dirPath, '.git'))) continue;
  console.log(`Switching submodule ${subPath} to branch ${branch}`);
  ChildProcess.execSync(`git checkout ${branch}`, {
    cwd: dirPath,
    env,
    stdio: 'inherit'
  });
}
