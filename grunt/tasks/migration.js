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
      __path__: unix(fileItem.file.path),
      __jsonext__: fileItem.file.jsonext
    };
  }

  function undressPathIndex(object) {
    const clone = { ...object };
    delete clone.__index__;
    delete clone.__path__;
    delete clone.__jsonext__;
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
      const tempPath = path.join(cwd, './migrations/');
      const cache = new migrations.CacheManager();
      const cachePath = await cache.getCachePath({
        outputPath: buildConfig.outputdir,
        tempPath
      });

      if (mode === 'capture') {
        const capturePath = grunt.option('capturedir') || tempPath;
        if (!fs.existsSync(capturePath)) fs.mkdirSync(capturePath);
        const fromFramework = Helpers.getFramework({
          rootDir: path.resolve(grunt.option('rootdir') || process.cwd())
        });
        const fromPlugins = fromFramework.getPlugins().getAllPackageJSONFileItems().map(fileItem => fileItem.item);
        const languages = fromFramework.getData().languages.map((language) => language.name);
        const languageFile = path.join(capturePath, 'captureLanguages.json');
        fs.writeJSONSync(languageFile, languages);
        languages.forEach(async (language, index) => {
          logger.debug(`Migration -- Capture ${language}`);
          const data = fromFramework.getData();
          // get all items from config.json file and all language files, append __index__ and __path__ to each item
          const content = [
            ...data.configFile.fileItems,
            ...data.languages[index].getAllFileItems()
          ].map(dressPathIndex).map(obj => {
            // reduce __path__ to relative paths about src/course/ or build/course/ so
            // that they're easier to restore elsewhere later
            obj.__path__ = obj.__path__.slice(data.coursePath.length).replace(/^\//, '');
            return obj;
          });
          const captured = await migrations.capture({ content, fromPlugins, logger });
          const outputFile = path.join(capturePath, `capture_${language}.json`);
          fs.writeJSONSync(outputFile, captured);
        });

        logger.output(capturePath, 'capture');
        return next();
      }

      const toFramework = Helpers.getFramework();
      logger.debug(`Using ${toFramework.useOutputData ? toFramework.outputPath : toFramework.sourcePath} folder for course data...`);
      const plugins = toFramework.getPlugins().getAllPackageJSONFileItems().map(fileItem => fileItem.item);
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

      if (mode === 'migrate') {
        const capturePath = grunt.option('capturedir') || tempPath;
        const toFrameworkData = toFramework.getData({ performLoad: false });
        const coursePath = toFrameworkData.coursePath;
        try {
          const languagesFile = path.join(capturePath, 'captureLanguages.json');
          const languages = fs.readJSONSync(languagesFile);

          for (const language of languages) {
            logger.debug(`Migration -- Migrate ${language}`);
            const Journal = migrations.Journal;
            if (!fs.existsSync(capturePath)) fs.mkdirSync(capturePath);
            const outputFile = path.join(capturePath, `capture_${language}.json`);
            let { content, fromPlugins } = fs.readJSONSync(outputFile);
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

            // change out jsonext
            content = content.map(item => {
              item.__path__ = item.__path__.replace('.' + item.__jsonext__, '.' + buildConfig.jsonext);
              return item;
            });
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
              // write files to specified --outputdir= location
              const outputFilePath = path.join(coursePath, outputPath);
              const outputDir = path.parse(outputFilePath).dir;
              fs.ensureDirSync(outputDir);
              fs.writeJSONSync(outputFilePath, stripped, { replacer: null, spaces: 2 });
            });
          }
        } catch (error) {
          logger.error(error.stack);
        }
        logger.output(capturePath, 'migrate');
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
