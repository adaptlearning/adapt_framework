const crypto = require('crypto');
const os = require('os');
const path = require('path');
const globs = require('globs');
const fs = require('fs-extra');

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_WEEK = 7 * 24 * ONE_HOUR;

module.exports = class CacheManager {

  constructor (grunt, maxAge = ONE_WEEK) {
    this.grunt = grunt;
    this.maxAge = maxAge;
    fs.ensureDirSync(this.tempPath);
  }

  static hash (path) {
    return crypto
      .createHash('sha1')
      .update(path, 'utf8')
      .digest('hex');
  }

  get tempPath() {
    return this.grunt.option('cachepath') ?? path.join(os.tmpdir(), 'adapt_framework');
  }

  cachePath(basePath, outputFilePath = process.cwd()) {
    const projectHash = CacheManager.hash(path.join(basePath, outputFilePath));
    const cachePath = path.join(this.tempPath, `${projectHash}.cache`);
    return cachePath;
  }

  get checkFilePath() {
    const checkFilePath = path.join(this.tempPath, 'last.touch');
    return checkFilePath;
  }

  async isCleaningTime() {
    // By default, clean once a day, or with a floor of one hourly intervals
    const checkInterval = Math.max(this.maxAge / 7, ONE_HOUR);
    const checkFilePath = this.checkFilePath;
    // Check if checkFile is older than the cleaning interval
    return (!fs.existsSync(checkFilePath) || Date.now() - (await fs.stat(checkFilePath)).mtime >= checkInterval);
  }

  async clean() {
    if (!await this.isCleaningTime()) return;
    // Touch checkFile
    await fs.writeFile(this.checkFilePath, String(Date.now()));
    this.grunt.log.ok('Clearing compilation caches...');
    // Fetch all cache files except checkFile
    const files = await new Promise((resolve, reject) => globs([
      `${this.tempPath}/**`,
      `!${this.checkFilePath}`
    ], {
      nodir: true
    }, (err, files) => err ? reject(err) : resolve(files)));
    // Fetch file ages
    const fileAges = [];
    const now = Date.now();
    for (const index in files) {
      const file = files[index];
      let age = this.maxAge;
      try {
        const stat = await fs.stat(file);
        age = (now - stat.mtime);
      } catch (err) {}
      fileAges[index] = { file, age };
    }
    // Sort by oldest
    fileAges.sort((a, b) => b.age - a.age);
    // Filter by expired
    const toRemove = fileAges.filter(fileAge => fileAge.age >= this.maxAge);
    // Delete expired cache files
    for (const fileAge of toRemove) {
      try {
        await fs.unlink(fileAge.file);
      } catch (err) {
        this.grunt.log.warn(`Could not clear cache file ${fileAge.file}`);
      }
    }
  }

};
