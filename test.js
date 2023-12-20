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

async function hasInstalledAndBuilt() {
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

async function adaptInstall() {
  return asyncSpawn(`adapt${os.platform() === 'win32' ? '.cmd' : ''}`, 'install');
};

async function gruntDiff() {
  return asyncSpawn(...[
    'node',
    './node_modules/grunt/bin/grunt',
    'diff',
    shouldUseOutputDir && `--outputdir=${outputDir}`
  ].filter(Boolean));
};

async function gruntServer() {
  return backgroundSpawn('node', './node_modules/grunt/bin/grunt', 'server-silent', 'run', `--outputdir=${outputDir}`);
};

async function waitForGruntServer() {
  return waitForExec('node', './node_modules/wait-on/bin/wait-on', 'http://localhost:9001');
};

async function cypressRun() {
  return asyncSpawn('node', './node_modules/cypress/bin/cypress', 'run', '--config', `{"fixturesFolder": "${outputDir}"}`);
};

async function jestRun() {
  config.testEnvironmentOptions.outputDir = outputDir;
  return jest.runCLI(config, [process.cwd().replace(/\\/g, '/')]);
};

async function jestClear() {
  return asyncSpawn('node', './node_modules/jest/bin/jest', '--clearCache');
};

const commands = {
  help: {
    name: 'help',
    description: 'Display this help screen',
    async start() {
      console.log(`
Usage:

    To run prepare with the unit and then e2e tests:
    $ npm test

    To run any of the available commands:
    $ npm test <command>

    To run prepare, e2e or unit with a defined output directory:
    $ npm test <command> --outputdir=./build/

where <command> is one of:

${Object.values(commands).map(({ name, description }) => `    ${name.padEnd(21, ' ')}${description}`).join('\n')}
`);
    }
  },
  prepare: {
    name: 'prepare',
    description: 'Install and build Adapt ready for testing (runs automatically when requied)',
    async start() {
      await adaptInstall();
      await gruntDiff();
    }
  },
  e2e: {
    name: 'e2e',
    description: 'Run prepare and e2e testing',
    async start() {
      const gruntServerRun = await gruntServer();
      waitForGruntServer();
      const cypressCode = await cypressRun();

      if (cypressCode > 0) {
        console.log(`Cypress failed with code '${cypressCode}'`);
        process.exit(1);
      }
      gruntServerRun.kill();
    }
  },
  unit: {
    name: 'unit',
    description: 'Run prepare and unit testing',
    async start() {
      return await jestRun();
    }
  },
  clear: {
    name: 'clear',
    description: 'Clear testing cache',
    async start() {
      return await jestClear();
    }
  }
};

const runTest = async () => {
  const parameters = process.argv.slice(2);
  const hasParameters = Boolean(parameters.length);
  const [ commandName ] = parameters;
  const command = commands[commandName];
  const isCommandNotFound = !command;

  try {
    if (isCommandNotFound && hasParameters) {
      const e = new Error(`Unknown command "${commandName}", please check the documentation. $ npm test help`);
      console.error(e);
      return;
    }

    const isCommandHelp = (commandName === 'help');
    const isCommandPrepare = (commandName === 'prepare');
    const shouldPrepare = (isCommandPrepare || (!isCommandHelp && !await hasInstalledAndBuilt()));
    if (shouldPrepare) {
      await commands.prepare.start();
      if (isCommandPrepare) return;
    }

    if (!hasParameters) {
      await commands.unit.start();
      await commands.e2e.start();
      process.exit(0);
    }

    await command.start();
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runTest();
