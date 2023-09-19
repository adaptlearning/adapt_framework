
const os = require('os');
const { spawn, exec } = require('child_process');
const jest = require('jest');
const config = require('./jest.config');
const globs = require('globs');
const path = require('path');

async function doFilesExist(patterns) {
  return await new Promise(resolve => globs(patterns, (err, matches) => resolve(Boolean(!err && matches?.length))));
}

async function asyncSpawn(command, ...args) {
  return await new Promise((resolve, reject) => {
    spawn(command, args, { stdio: [0, 1, 2] })
      .on('error', reject)
      .on('close', code => {
        if (!code) return resolve();
        reject(new Error(`Command failed: "${command} ${args.join(' ')}"`));
      });
  });
}

async function backgroundSpawn(command, ...args) {
  return await new Promise((resolve, reject) => {
    let hasErrored = false;
    const process = spawn(command, args, { stdio: [0, 1, 2] })
      .on('error', err => {
        hasErrored = true;
        reject(err);
      })
      .on('close', code => {
        if (!code) return;
        hasErrored = true;
        reject(new Error(`Command failed: "${command} ${args.join(' ')}"`));
      });
    setTimeout(() => {
      if (hasErrored) return;
      resolve(process);
    }, 1000);
  });
}

async function waitForExec(command, ...args) {
  return await new Promise(resolve => exec([command, ...args].join(' '), { stdio: [0, 1, 2] }, resolve));
}

const shouldUseOutputDir = Boolean(process.env.npm_config_outputdir);
const outputDir = (process.env.npm_config_outputdir || './build/');

const adaptInstall = async () => {
  return asyncSpawn(`adapt${os.platform() === 'win32' ? '.cmd' : ''}`, 'install');
};
const gruntDiff = async () => {
  return asyncSpawn(...[
    'node',
    './node_modules/grunt/bin/grunt',
    'diff',
    shouldUseOutputDir && `--outputdir=${outputDir}`
  ].filter(Boolean));
};
const gruntServer = () => {
  return backgroundSpawn('node', './node_modules/grunt/bin/grunt', 'server-silent', 'run', `--outputdir=${outputDir}`);
};
const waitForGruntServer = () => {
  return waitForExec('node', './node_modules/wait-on/bin/wait-on', 'http://localhost:9001');
};
const cypressRun = () => {
  return asyncSpawn('node', './node_modules/cypress/bin/cypress', 'run');
};
const jestRun = () => {
  config.testEnvironmentOptions.outputDir = outputDir;
  return jest.runCLI(config, [process.cwd().replace(/\\/g, '/')]);
};
const jestClear = async () => {
  return asyncSpawn('node', './node_modules/jest/bin/jest', '--clearCache');
};

const hasInstalledAndBuilt = async () => {
  const hasInstalled = await doFilesExist([
    'src/components/*',
    'src/extensions/*',
    'src/menu/*',
    'src/theme/*'
  ]);
  const hasBuilt = await doFilesExist([
    path.join(outputDir, 'index.html')
  ]);
  return hasInstalled && hasBuilt;
};

async function e2e () {
  const gruntServerRun = await gruntServer();
  await waitForGruntServer();
  const cypressCode = await cypressRun();

  if (cypressCode > 0) {
    console.log(`Cypress failed with code '${cypressCode}'`);
    process.exit(1);
  }
  gruntServerRun.kill();
};

async function unit () {
  return await jestRun();
};

async function clear () {
  return await jestClear();
};

const commands = {
  e2e,
  unit,
  clear
};

const runTest = async () => {
  const parameters = process.argv.slice(2);
  const hasParameters = Boolean(parameters.length);
  const [ commandName ] = parameters;
  const command = commands[commandName];
  const isCommandNotFound = !command;

  try {
    if (isCommandNotFound && hasParameters) {
      const e = new Error(`Unknown command "${commandName}", please check the documentation.`);
      console.error(e);
      return;
    }

    const isCommandPrepare = (commandName === 'prepare');
    const shouldPrepare = (!await hasInstalledAndBuilt() || isCommandPrepare);
    if (shouldPrepare) {
      await adaptInstall();
      await gruntDiff();
      if (isCommandPrepare) return;
    }

    if (!hasParameters) {
      await commands.unit.start();
      await commands.e2e.start();
      process.exit(0);
    }

    await command();
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runTest();
