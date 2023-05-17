const { spawn, exec } = require('child_process');
const os = require('os');

const runTest = async () => {
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
    const gruntServerRun = await new Promise((resolve, reject) => {
      const gruntServerRun = spawn('node', ['./node_modules/grunt/bin/grunt', 'server-silent', 'run'], { stdio: [0, 1, 2] });
      let hasErrored = false;
      gruntServerRun.on('error', err => {
        hasErrored = true;
        reject(err);
      });
      gruntServerRun.on('close', code => {
        if (!code) return;
        hasErrored = true;
        reject(new Error('Server failed'));
      });
      setTimeout(() => {
        if (hasErrored) return;
        resolve(gruntServerRun);
      }, 1000);
    });
    const cypressCode = await new Promise((resolve, reject) => {
      exec('node ./node_modules/wait-on/bin/wait-on http://localhost:9001', { stdio: [0, 1, 2] }, () => {
        const cypressRun = spawn('node', ['./node_modules/cypress/bin/cypress', 'run'], { stdio: [0, 1, 2] });
        cypressRun.on('error', reject);
        cypressRun.on('close', resolve);
      });
    });

    if (cypressCode > 0) {
      console.log(`Cypress failed with code '${cypressCode}'`);
      process.exit(1);
    }

    gruntServerRun.kill();
  } catch (err) {}
};

runTest();
