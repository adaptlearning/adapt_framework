const { execSync } = require('child_process');

const runTest = async () => {
  const type = 'course';
  const contentName = 'test-course';
  const framework = 'v5.22.5';
  const bypassPrompt = true;

  const buildString = `adapt create ${type} '${contentName}' ${framework} ${bypassPrompt}`;
  console.log(`Running command "${buildString}"`);

  await execSync(buildString, { stdio: [0, 1, 2] });

  const serveString = `cd ${contentName} && grunt build && grunt server`;
  return await execSync(serveString, { stdio: [0, 1, 2] });
};

runTest();
