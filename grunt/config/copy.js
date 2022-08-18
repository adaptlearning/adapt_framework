module.exports = function(grunt, options) {

  const _ = require('underscore');

  const getUnixPath = function(filepath) {
    // convert to unix style slashes
    return filepath.replace(/\\/g, '/');
  };

  const collate = function(collateAtFolderName, destFolder, srcFileName) {
    destFolder = getUnixPath(destFolder);
    srcFileName = getUnixPath(srcFileName);

    // ignore if the srcFileName ends with the collateAtFolderName
    const nameParts = srcFileName.split('/');
    if (nameParts[nameParts.length - 1] === collateAtFolderName) {
      return destFolder;
    }

    const startOfCollatePath = srcFileName.indexOf(collateAtFolderName) + collateAtFolderName.length + 1;
    const collatedFilePath = destFolder + srcFileName.substr(startOfCollatePath);

    return collatedFilePath;
  };

  const mandatoryTasks = {
    assets: {
      files: [
        {
          expand: true,
          src: ['<%= sourcedir %>node_modules/*/assets/**'],
          dest: '<%= outputdir %>assets/',
          filter: filepath => grunt.option('helpers').includedFilter(filepath),
          rename: _.partial(collate, 'assets'),
          order: grunt.option('helpers').orderFilesByPluginType
        }
      ]
    },
    fonts: {
      files: [
        {
          expand: true,
          src: ['<%= sourcedir %>node_modules/*/fonts/**'],
          dest: '<%= outputdir %>fonts/',
          filter: filepath => grunt.option('helpers').includedFilter(filepath),
          rename: _.partial(collate, 'fonts'),
          order: grunt.option('helpers').orderFilesByPluginType
        }
      ]
    },
    libraries: {
      files: [
        {
          expand: true,
          src: ['<%= sourcedir %>node_modules/**/libraries/**/*'],
          dest: '<%= outputdir %>libraries/',
          filter: filepath => grunt.option('helpers').includedFilter(filepath),
          rename: _.partial(collate, 'libraries'),
          order: grunt.option('helpers').orderFilesByPluginType
        }
      ]
    },
    required: {
      files: [
        {
          expand: true,
          src: ['<%= sourcedir %>node_modules/*/required/**/*'],
          dest: '<%= outputdir %>',
          filter: filepath => grunt.option('helpers').includedFilter(filepath),
          rename: _.partial(collate, 'required'),
          order: grunt.option('helpers').orderFilesByPluginType
        }
      ]
    }
  };

  return mandatoryTasks;

};
