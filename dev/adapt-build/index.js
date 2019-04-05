const EventEmitter = require('events');
const grunt = require('grunt');
require('../../Gruntfile')(grunt);

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
    'javascript',
    'less',
    'minify',
    'replace',
    'schema-defaults',
    'scripts',
    'tracking-insert',
    'tracking-remove',
    'tracking-reset',
    'translate'
];

class AdaptBuild extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
    }

    run(task) {
        return new Promise((resolve, reject) => {
            const taskComponents = task.split(':');
            const taskName = taskComponents[0];

            // Check task is valid
            if (!tasks.includes(taskName)) {
                return reject(`Task ${taskName} does not exist`);
            }

            // Set the dev config option to ensure grunt passes output to event instead of saving file
            if (this.options.env === 'development') {
                grunt.task.run('setenv:dev');
            }

            const outputEvent = `${taskName}:output`;
            
            grunt.event.once(outputEvent, (output) => {
                this.emit(outputEvent, output);
                resolve(output);
            });
            grunt.task.run(task);
            grunt.task.start();
        });
    }
}

module.exports = AdaptBuild;