const os = require('os');
const fs = require('fs-extra');
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

async function hasInstalled() {
  return await doFilesExist([
    'src/components/*',
    'src/extensions/*',
    'src/menu/*',
    'src/theme/*'
  ]);
};

async function hasBuilt() {
  return await doFilesExist([
    path.join(argumentValues.outputdir, 'index.html')
  ]);
};

async function adaptInstall() {
  return asyncSpawn(`adapt${os.platform() === 'win32' ? '.cmd' : ''}`, 'install');
};

async function gruntDiff() {
  return asyncSpawn(...[
    'node',
    './node_modules/grunt/bin/grunt',
    'diff',
    Boolean(process.env.npm_config_outputdir) && `--outputdir=${argumentValues.outputdir}`
  ].filter(Boolean));
};

async function gruntServer() {
  return backgroundSpawn('node', './node_modules/grunt/bin/grunt', 'server-silent', 'run', `--outputdir=${argumentValues.outputdir}`);
};

async function waitForGruntServer() {
  return waitForExec('node', './node_modules/wait-on/bin/wait-on', 'http://127.0.0.1:9001');
};

function populateTestFiles(testFormat) {
  // accept the user-specified file(s)
  if (argumentValues.testfiles) return argumentValues.testfiles;

  // otherwise, only include test files for plugins present in the course config
  const config = JSON.parse(fs.readFileSync(path.join(argumentValues.outputdir, 'course', 'config.json')));
  const plugins = config?.build?.includes;
  const globSuffix = testFormat === 'e2e' ? 'e2e/*.cy.js' : 'unit/*.js';

  // Set a wider glob as default and limit to included plugins if that is set
  let testFiles = [`**/*/test/${globSuffix}`];

  const hasDefinedIncludes = Boolean(plugins?.length);
  if (hasDefinedIncludes) {
    testFiles = plugins.map(plugin => {
      return `**/${plugin}/test/${globSuffix}`;
    });
  }

  // Add the framework level test files
  if (testFormat === 'e2e') {
    testFiles.push(`./test/${globSuffix}`);
  } else {
    testFiles.push('<rootDir>/test/unit/*.js');
  }

  return testFiles.join(',');
}

async function cypressRun() {
  const testFiles = populateTestFiles('e2e');
  return asyncSpawn('node', './node_modules/cypress/bin/cypress', 'run', '--spec', `${testFiles}`, '--config', `{"fixturesFolder": "${argumentValues.outputdir}"}`);
};

async function jestRun() {
  config.testEnvironmentOptions.outputDir = argumentValues.outputdir;

  const testFiles = populateTestFiles('unit');
  config.testMatch = testFiles.split(',');

  return jest.runCLI(config, [process.cwd().replace(/\\/g, '/')]);
};

async function jestClear() {
  return asyncSpawn('node', './node_modules/jest/bin/jest', '--clearCache');
};

const acceptedArgs = [
  'outputdir',
  'skipinstall',
  'testfiles'
];

const argumentValues = {
  outputdir: (process.env.npm_config_outputdir || './build/'),
  skipinstall: false,
  testfiles: null
};

const commands = {
  help: {
    name: 'help',
    description: 'Display this help screen',
    async start() {
      const helpText = `
Usage:

    To run prepare with the unit and then e2e tests:
    $ npm test

    To run prepare with the unit and then e2e tests without overwriting the ./src/ plugins:
    $ npm test --skipinstall

    To run prepare with specif unit and/or e2e tests:
    $ npm test --testfiles=**/globForTestsToRun/**

    To run any of the available commands:
    $ npm test <command>

    To run prepare, e2e or unit with a defined output directory:
    $ npm test <command> --outputdir=./build/

where <command> is one of:

${Object.values(commands).map(({ name, description }) => `    ${name.padEnd(21, ' ')}${description}`).join('\n')}
`;
      console.log(helpText);
    }
  },
  prepare: {
    name: 'prepare',
    description: 'Install and build Adapt ready for testing (runs automatically when requied)',
    async start() {
      if ((argumentValues.skipinstall !== 'true') && !await hasInstalled()) {
        console.log('Installing latest adapt plugins');
        await adaptInstall();
      }
      if (!await hasBuilt()) {
        console.log(`Performing course build to '${argumentValues.outputdir}'`);
        await gruntDiff();
      }
    }
  },
  e2e: {
    name: 'e2e',
    description: 'Run prepare and e2e testing',
    async start() {
      const gruntServerRun = await gruntServer();
      await waitForGruntServer();

      try {
        const cypressCode = await cypressRun();

        if (cypressCode > 0) {
          console.log(`Cypress failed with code '${cypressCode}'`);
          process.exit(1);
        }
      } catch (cypressErr) {
        console.log('Cypress tests failure');
        console.log(cypressErr);
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
  let [ passedArgs = '' ] = parameters;
  const [ commandName ] = passedArgs.split(' ');
  const command = commands[commandName];
  const isCommandNotFound = !command;

  // Read the input for passed arguments that arent command names
  passedArgs = passedArgs.trim().replaceAll('--', '').split(' ').filter(name => isCommandNotFound || name !== commandName);

  // Update argumentValues array for later use while checking if the command is valid
  const paramsRecognised = passedArgs.every(passedArg => {
    const passedArgParts = passedArg.trim().split('=');
    argumentValues[passedArgParts[0]] = passedArgParts[1];
    return acceptedArgs.includes(passedArgParts[0]);
  });

  try {
    if (isCommandNotFound && hasParameters && !paramsRecognised) {
      const e = new Error(`Unknown command/argument "${parameters[0]}", please check the documentation. $ npm test help`);
      console.error(e);
      return;
    }

    const isCommandHelp = (commandName === 'help');
    const isCommandPrepare = (commandName === 'prepare');
    const shouldPrepare = (isCommandPrepare || !isCommandHelp);

    if (shouldPrepare) {
      await commands.prepare.start();
      if (isCommandPrepare) return;
    }

    // No specific command called - run tests by default
    if (isCommandNotFound) {
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
