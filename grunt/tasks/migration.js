module.exports = function(grunt) {

  const Helpers = require('../helpers')(grunt);
  const globs = require('globs');
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('underscore');
  const minimatch = require('minimatch');

  function unix(path) {
    return path.replace(/\\/g, '/');
  }

  function dressPathIndex(fileItem) {
    return {
      ...fileItem.item,
      __index__: fileItem.index,
      __path__: unix(fileItem.file.path)
    };
  }

  function undressPathIndex(object) {
    const clone = { ...object };
    delete clone.__index__;
    delete clone.__path__;
    return clone;
  }

  grunt.registerTask('migration', 'Migrate from one version to another', function(mode) {
    const next = this.async();
    const buildConfig = Helpers.generateConfigData();
    const fileNameIncludes = grunt.option('file');

    (async function() {
      const migrations = await import('adapt-migrations');
      const logger = migrations.Logger.getInstance();
      const cwd = process.cwd();
      const outputPath = path.join(cwd, './migrations/');
      const cache = new migrations.CacheManager();
      const cachePath = await cache.getCachePath({
        outputPath: buildConfig.outputdir,
        tempPath: outputPath
      });

      const framework = Helpers.getFramework();
      logger.debug(`Using ${framework.useOutputData ? framework.outputPath : framework.sourcePath} folder for course data...`);

      const plugins = framework.getPlugins().getAllPackageJSONFileItems().map(fileItem => fileItem.item);
      const migrationScripts = Array.from(await new Promise(resolve => {
        globs([
          '*/*/migrations/**/*.js',
          'core/migrations/**/*.js'
        ], { cwd: path.join(cwd, './src/'), absolute: true }, (err, files) => resolve(err ? null : files));
      })).filter(filePath => {
        if (!fileNameIncludes) return true;
        return minimatch(filePath, '**/' + fileNameIncludes) || filePath.includes(fileNameIncludes);
      });

      if (!migrationScripts.length) {
        console.log('No migration scripts found');
        return next();
      }

      await migrations.load({
        cachePath,
        scripts: migrationScripts,
        logger
      });

      if (mode === 'capture') {

        if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);
        const languages = framework.getData().languages.map((language) => language.name);
        const languageFile = path.join(outputPath, 'captureLanguages.json');
        fs.writeJSONSync(languageFile, languages);
        languages.forEach(async (language, index) => {
          logger.debug(`Migration -- Capture ${language}`);
          const data = framework.getData();
          // get all items from config.json file and all language files, append __index__ and __path__ to each item
          const content = [
            ...data.configFile.fileItems,
            ...data.languages[index].getAllFileItems()
          ].map(dressPathIndex);
          const captured = await migrations.capture({ content, fromPlugins: plugins, logger });
          const outputFile = path.join(outputPath, `capture_${language}.json`);
          fs.writeJSONSync(outputFile, captured);
        });

        logger.output(outputPath, 'capture');
        return next();
      }

      if (mode === 'migrate') {
        try {
          const languagesFile = path.join(outputPath, 'captureLanguages.json');
          const languages = fs.readJSONSync(languagesFile);

          for (const language of languages) {
            logger.debug(`Migration -- Migrate ${language}`);
            const Journal = migrations.Journal;
            if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);
            const outputFile = path.join(outputPath, `capture_${language}.json`);
            const { content, fromPlugins } = fs.readJSONSync(outputFile);
            const originalFromPlugins = JSON.parse(JSON.stringify(fromPlugins));
            const journal = new Journal({
              logger,
              data: {
                content,
                fromPlugins,
                originalFromPlugins,
                toPlugins: plugins
              }
            });
            await migrations.migrate({ journal, logger });

            // group all content items by path
            const outputFilePathItems = _.groupBy(content, '__path__');
            // sort items inside each path
            Object.values(outputFilePathItems).forEach(outputFile => outputFile.sort((a, b) => a.__index__ - b.__index__));
            // get paths
            const outputFilePaths = Object.keys(outputFilePathItems);

            outputFilePaths.forEach(outputPath => {
              const outputItems = outputFilePathItems[outputPath];
              if (!outputItems?.length) return;
              const isSingleObject = (outputItems.length === 1 && outputItems[0].__index__ === null);
              const stripped = isSingleObject
                ? undressPathIndex(outputItems[0]) // config.json, course.json
                : outputItems.map(undressPathIndex); // contentObjects.json, articles.json, blocks.json, components.json
              fs.writeJSONSync(outputPath, stripped, { replacer: null, spaces: 2 });
            });
          }
        } catch (error) {
          logger.error(error.stack);
        }
        logger.output(outputPath, 'migrate');
        return next();
      }

      if (mode === 'test') {
        await migrations.test({ logger });
        return next();
      }

      return next();
    })();
  });

};
