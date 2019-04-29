// This module connects the abstracted build API to the current grunt setup

const grunt = require('grunt');
require('../../Gruntfile')(grunt);

const allowedConfig = [
    'outputConfig',
    'sourcedir',
    'coursedir',
    'outputdir'
];

module.exports = {
    /**
     * Set grunt options from a given hash
     * @param {object} options
     */
    setConfig(options) {
        for (let key in options) {
            if (allowedConfig.includes(key)) {
                grunt.config(key, options[key]);
            }
        }
    },

    /**
     * Run a grunt task
     * @param {string} task - the grunt task to run
     * @return {Promise}
     */
    run(task) {
        return new Promise((resolve, reject) => {
            const taskComponents = task.split(':');
            const taskName = taskComponents[0];
            const outputEvent = `${taskName}:output`;

            grunt.event.once(outputEvent, resolve);
            grunt.task.run(task);
            grunt.task.start();

        });
    }
};