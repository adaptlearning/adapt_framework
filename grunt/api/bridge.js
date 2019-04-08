const grunt = require('grunt');
require('../../Gruntfile')(grunt);

module.exports = {
    /**
     * Run a grunt task
     * @param {string} task - the grunt task to run
     * @param {string} outputConfig - file || event
     * @return {Promise}
     */
    run(task, outputConfig = 'file') {
        return new Promise((resolve, reject) => {
            const taskComponents = task.split(':');
            const taskName = taskComponents[0];
            const outputEvent = `${taskName}:output`;

            grunt.task.run(`setoutput:${outputConfig}`);
            grunt.event.once(outputEvent, resolve);
            grunt.task.run(task);
            grunt.task.start();

        });
    }
};