const { execSync } = require('child_process');
const fs = require('fs');
const packageJson = require('./package.json');

const runTest = async () => {
  const type = 'course';
  const contentName = 'test-course';
  const framework = packageJson.version;
  const bypassPrompt = true;

  if (fs.existsSync(contentName)) {
    console.log('Removing previously built course');
    await fs.rmdirSync(contentName, { recursive: true });
  }

  const buildString = `adapt create ${type} '${contentName}' v${framework} ${bypassPrompt}`;
  console.log(`Running command "${buildString}"`);

  await execSync(buildString, { stdio: [0, 1, 2] });

  const serveString = `cd ${contentName} && grunt build && grunt server`;
  return await execSync(serveString, { stdio: [0, 1, 2] });
};

runTest();
