const EventEmitter = require('events');
const bridge = require('./bridge');

module.exports = class AdaptBuild extends EventEmitter {
    constructor(options = {}) {
        super();

        if (!options.outputConfig) {
            options.outputConfig = 'event'
        }

        bridge.setOptions(options);
    }

    get tasks() {
        return [
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
    }

    async runTask(task) {
        const taskComponents = task.split(':');
        const taskName = taskComponents[0];
        const outputEvent = `${taskName}:output`;

        // Check task is valid
        if (!this.tasks.includes(task)) {
            return console.log(`Task ${task} does not exist`);
        }

        const output = await bridge.run(task, this.options);

        this.emit(outputEvent, output);

        return output;

    }

    buildConfig() {
        return this.runTask('build-config');
    }

    styles() {
        return this.runTask('less:dev');
    }

    templates() {
        return this.runTask('handlebars');
    }


};