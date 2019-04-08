const EventEmitter = require('events');
const bridge = require('./bridge');

const tasks = [
    'build',
    'build-config',
    'check-json',
    'clean',
    'copy',
    'create-json-config',
    'dev',
    'diff',
    'handlebars',
    'javascript:compile',
    'javascript:dev',
    'less:compile',
    'less:dev',
    'minify',
    'replace',
    'schema-defaults',
    'scripts:adaptpostbuild',
    'tracking-insert',
    'tracking-remove',
    'tracking-reset',
    'translate'
];

class AdaptBuild extends EventEmitter {
    constructor(options = { outputConfig: 'event' }) {
        super();
        Object.assign(this, options);
    }

    async runTask(task) {
        const taskComponents = task.split(':');
        const taskName = taskComponents[0];
        const outputEvent = `${taskName}:output`;

        // Check task is valid
        if (!tasks.includes(task)) {
            return console.log(`Task ${task} does not exist`);
        }

        const output = await bridge.run(task, this.outputConfig);

        this.emit(outputEvent, output);

        return output;

    }

    buildConfig() {
        return this.runTask('build-config');
    }


}

module.exports = AdaptBuild;