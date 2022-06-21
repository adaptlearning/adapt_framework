const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const csv = require('csv');
const async = require('async');
const globs = require('globs');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const Data = require('./Data');
const Schemas = require('./Schemas');

/**
 * @typedef {import('./Framework')} Framework
 */

/**
 * Pulls together schemas and data to enable both the export and import of data item attributes
 * marked by the schemas as translatable.
 */
class Translate {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {function} options.includedFilter
   * @param {string} options.masterLang
   * @param {string} options.targetLang
   * @param {string} options.format
   * @param {string} options.csvDelimiter
   * @param {boolean} options.shouldReplaceExisting
   * @param {string} options.jsonext
   * @param {string} options.sourcePath
   * @param {string} options.languagePath
   * @param {string} options.outputPath
   * @param {boolean} options.isTest
   * @param {function} options.log
   */
  constructor({
    framework = null,
    includedFilter = function() { return true; },
    masterLang = 'en',
    targetLang = null,
    format = 'csv',
    csvDelimiter = null,
    shouldReplaceExisting = false,
    jsonext = 'json',
    sourcePath = '',
    languagePath = path.join(process.cwd(), 'languagefiles'),
    outputPath = '',
    courseDir = 'course',
    useOutputData = false,
    isTest = false,
    log = console.log,
    warn = console.warn
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {function} */
    this.includedFilter = includedFilter;
    /** @type {string} */
    this.masterLang = masterLang;
    /** @type {string} */
    this.targetLang = targetLang;
    // format can be raw, json or csv
    /** @type {string} */
    this.format = format;
    /** @type {string} */
    this.csvDelimiter = csvDelimiter;
    /** @type {boolean} */
    this.shouldReplaceExisting = shouldReplaceExisting;
    /** @type {string} */
    this.jsonext = jsonext;
    /** @type {string} */
    this.sourcePath = sourcePath.replace(/\\/g, '/');
    /** @type {string} */
    this.outputPath = outputPath.replace(/\\/g, '/');
    /** @type {string} */
    this.courseDir = courseDir;
    /** @type {Framework} */
    this.useOutputData = useOutputData;
    /** @type {string} */
    this.languagePath = languagePath.replace(/\\/g, '/');
    /** @type {Data} */
    this.data = null;
    /** @type {boolean} */
    this.isTest = isTest;
    /** @type {function} */
    this.log = log;
    /** @type {function} */
    this.warn = warn;
  }

  /** @returns {Translate} */
  load() {
    this.data = new Data({
      framework: this.framework,
      sourcePath: this.useOutputData ? this.outputPath : this.sourcePath,
      courseDir: this.courseDir,
      jsonext: this.jsonext,
      trackingIdType: this.framework.trackingIdType,
      log: this.log
    });
    this.data.load();
    return this;
  }

  /**
   * Produces a single JSON file or a series of CSV files representing all of the
   * files and file items in the data structure.
   * @returns {Translate}
   */
  async export() {

    const schemas = new Schemas({ framework: this.framework, includedFilter: this.includedFilter, sourcePath: this.sourcePath });
    schemas.load();

    const exportTextData = [];

    // collection translatable texts
    const language = this.data.getLanguage(this.masterLang);
    language.getAllFileItems().forEach(({ file, item }) => {

      const applicableSchemas = schemas.getSchemasForModelJSON(item);
      const translatablePaths = applicableSchemas.getTranslatablePaths();

      function recursiveJSONProcess(data, level, path, lookupPath, id, file, component) {
        if (level === 0) {
          // at the root
          id = data.hasOwnProperty('_id') ? data._id : null;
          component = data.hasOwnProperty('_component') ? data._component : null;
        }
        if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            recursiveJSONProcess(data[i], level += 1, path + i + '/', lookupPath, id, file, component);
          }
          return;
        }
        if (typeof data === 'object') {
          for (let attribute in data) {
            recursiveJSONProcess(data[attribute], level += 1, path + attribute + '/', lookupPath + attribute + '/', id, file, component);
          }
          return;
        }
        if (data && translatablePaths.includes(lookupPath)) {
          exportTextData.push({
            file: file,
            id: id,
            path: path,
            value: data
          });
        }
      }

      const filename = path.parse(file.path).name.split('.')[0];
      recursiveJSONProcess(item, 0, '/', '/', null, filename, null);

    });

    // maintain order with original translate tasks
    const typeSortLevel = {
      course: 1,
      contentObjects: 2,
      articles: 3,
      blocks: 4,
      components: 5
    };
    exportTextData.sort((a, b) => {
      const typeSort = ((typeSortLevel[a.file] || 100) - (typeSortLevel[b.file] || 100));
      return typeSort || a.id.length - b.id.length || a.id.localeCompare(b.id);
    });

    // output based upon format options
    const outputFolder = path.join(this.languagePath, this.masterLang);
    fs.mkdirpSync(outputFolder);

    if (this.format === 'json' || this.format === 'raw') {
      const filePath = path.join(outputFolder, `export.json`);
      this.log(`Exporting json to ${filePath}`);
      fs.writeJSONSync(filePath, exportTextData, { spaces: 2 });
      return;
    }

    // create csv for each file
    const outputGroupedByFile = exportTextData.reduce((prev, current) => {
      if (!prev.hasOwnProperty(current.file)) {
        prev[current.file] = [];
      }
      prev[current.file].push([`${current.file}/${current.id}${current.path}`, current.value]);
      return prev;
    }, {});

    const csvOptions = {
      quotedString: true,
      delimiter: this.csvDelimiter || ','
    };

    const fileNames = Object.keys(outputGroupedByFile);
    await async.each(fileNames, (name, done) => {
      csv.stringify(outputGroupedByFile[name], csvOptions, (error, output) => {
        if (error) {
          return done(new Error('Error saving CSV files.'));
        }
        const filePath = path.join(outputFolder, `${name}.csv`);
        this.log(`Exporting csv to ${filePath}`);
        fs.writeFileSync(filePath, `\ufeff${output}`);
        done(null);
      });
    });

    return this;
  }

  /**
   * Imports a single JSON file or multiple CSV files to replace values in the
   * existing data file items.
   * @returns {Translate}
   */
  async import() {

    if (this.isTest) {
      this.log(`!TEST IMPORT, not changing data.`);
    }

    // check that a targetLang has been specified
    if (!this.targetLang) {
      const err = new Error('Target language option is missing. ');
      err.number = 10001;
      throw err;
    }

    // check input folder exists
    const inputFolder = path.join(this.languagePath, this.targetLang);
    if (!fs.existsSync(inputFolder) || !fs.statSync(inputFolder).isDirectory()) {
      const err = new Error(`Folder does not exist. ${inputFolder}`);
      err.number = 10002;
      throw err;
    }

    // auto-detect format if not specified
    let format = this.format;
    if (!format) {
      const filePaths = globs.sync([`${inputFolder}/*.*`]);
      const uniqueFileExtensions = _.uniq(filePaths.map(filePath => path.extname(filePath).slice(1)));
      if (uniqueFileExtensions.length !== 1) {
        throw new Error(`Format autodetection failed, ${uniqueFileExtensions.length} file types found.`);
      }
      format = uniqueFileExtensions[0];
      switch (format) {
        case 'csv':
        case 'json':
          this.log(`Format autodetected as ${format}`);
          break;
        default:
          throw new Error(`Format of the language file is not supported: ${format}`);
      }
    }

    // discover import files
    const langFiles = globs.sync([`${inputFolder}/*.${format}`]);
    if (langFiles.length === 0) {
      throw new Error(`No languagefiles found to process in folder ${inputFolder}`);
    }

    // copy master language files to target language directory if needed
    if (this.targetLang !== this.masterLang) {
      this.data.copyLanguage(this.masterLang, this.targetLang, this.shouldReplaceExisting);
    }

    // get target language data
    const targetLanguage = this.data.getLanguage(this.targetLang);

    if (this.targetLang === this.masterLang && !this.shouldReplaceExisting) {
      const err = new Error(`Folder already exists. ${targetLanguage.path}`);
      err.number = 10003;
      throw err;
    }

    // process import files
    let importData;
    switch (format) {
      case 'json':
        importData = fs.readJSONSync(langFiles[0]);
        break;
      case 'csv':
      default:
        importData = [];
        const lines = [];
        await async.each(langFiles, (filename, done) => {
          const fileBuffer = fs.readFileSync(filename, {
            encoding: null
          });
          const detected = jschardet.detect(fileBuffer);
          let fileContent;
          if (iconv.encodingExists(detected.encoding)) {
            fileContent = iconv.decode(fileBuffer, detected.encoding);
            this.log(`Encoding detected as ${detected.encoding} ${filename}`);
          } else {
            fileContent = iconv.decode(fileBuffer, 'utf8');
            this.log(`Encoding not detected used utf-8 ${filename}`);
          }
          let csvDelimiter = this.csvDelimiter;
          if (!csvDelimiter) {
            const firstLineMatches = fileContent.match(/^[^,;\t| \n\r]+\/"{0,1}[,;\t| ]{1}/);
            if (firstLineMatches && firstLineMatches.length) {
              const detectedDelimiter = firstLineMatches[0].slice(-1);
              if (detectedDelimiter !== this.csvDelimiter) {
                this.log(`Delimiter detected as ${detectedDelimiter} in ${filename}`);
                csvDelimiter = detectedDelimiter;
              }
            }
          }
          if (!csvDelimiter) {
            const err = new Error(`Could not detect csv delimiter ${targetLanguage.path}`);
            err.number = 10014;
            throw err;
          }
          const options = {
            delimiter: csvDelimiter
          };
          csv.parse(fileContent, options, (error, output) => {
            if (error) {
              return done(error);
            }
            let hasWarnedTruncated = false;
            output.forEach(line => {
              if (line.length < 2) {
                throw new Error(`Too few columns detected: expected 2, found ${line.length} in ${filename}`);
              }
              if (line.length !== 2 && !hasWarnedTruncated) {
                this.log(`Truncating, too many columns detected: expected 2, found extra ${line.length-2} in ${filename}`);
                hasWarnedTruncated = true;
              }
              line.length = 2;
            });
            lines.push(...output);
            done(null);
          });
        }).then(() => {
          lines.forEach(line => {
            const [ file, id, ...path ] = line[0].split('/');
            importData.push({
              file: file,
              id: id,
              path: path.filter(Boolean).join('/'),
              value: line[1]
            });
          });
        }, err => {
          throw new Error(`Error processing CSV files: ${err}`);
        });
        break;
    }

    // check import validity
    const item = importData[0];
    const isValid = item.hasOwnProperty('file') && item.hasOwnProperty('id') && item.hasOwnProperty('path') && item.hasOwnProperty('value');
    if (!isValid) {
      throw new Error('Sorry, the imported File is not valid');
    }

    // maintain output order with original translate tasks
    // TODO: could probably improve this with read order rather than file order
    const typeSortLevel = {
      course: 1,
      contentObjects: 2,
      articles: 3,
      blocks: 4,
      components: 5
    };
    importData.sort((a, b) => {
      const typeSort = ((typeSortLevel[a.file] || 100) - (typeSortLevel[b.file] || 100));
      return typeSort || a.id.length - b.id.length || a.id.localeCompare(b.id);
    });

    // update data
    importData.forEach(data => {
      const { file, item } = targetLanguage.getFileItemById(data.id);
      const attributePath = data.path.split('/').filter(Boolean);
      const currentValue = _.get(item, attributePath);
      if (currentValue === data.value) {
        // value is unchanged, skip
        return;
      }
      this.log(`#${data.id}\t${attributePath.join('.')}`);
      this.log(`  '${currentValue}'`);
      this.log(`  '${data.value}'`);
      _.set(item, attributePath, data.value);
      file.changed();
    });
    if (!targetLanguage.hasChanged) {
      this.warn('No changed were found, target and import are identical.');
    }

    // save data
    if (!this.isTest) {
      this.data.save();
    }

    return this;
  }

}

module.exports = Translate;
