const { spawn } = require('child_process');
const os = require('os');
const unit = require('./lib/unit');
const e2e = require('./lib/e2e');

const commands = {
  e2e,
  unit
};

const runTestPrepare = async () => {
  try {
    await new Promise((resolve, reject) => {
      const adaptInstall = spawn(`adapt${os.platform() === 'win32' ? '.cmd' : ''}`, ['install'], { stdio: [0, 1, 2] });
      adaptInstall.on('error', reject);
      adaptInstall.on('close', code => {
        if (!code) return resolve();
        reject(new Error('adapt install failed'));
      });
    });
    await new Promise((resolve, reject) => {
      const gruntBuild = spawn('node', ['./node_modules/grunt/bin/grunt', 'build'], { stdio: [0, 1, 2] });
      gruntBuild.on('error', reject);
      gruntBuild.on('close', code => {
        if (!code) return resolve();
        reject(new Error('Grunt build failed'));
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const runTest = async () => {
  const parameters = process.argv.slice(2);

  try {
    if (!commands[parameters[0]] && parameters.length > 0) {
      const e = new Error(`Unknown command "${parameters[0]}", please check the documentation.`);
      console.log(e);
      return;
    }

    await runTestPrepare();

    if (parameters.length === 0) {
      await unit.start();
      await e2e.start();
      process.exit(0);
    }

    await commands[parameters[0]].start();
    process.exit(0);

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

runTest();
