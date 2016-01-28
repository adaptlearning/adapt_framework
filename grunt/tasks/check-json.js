module.exports = function(grunt) {
      grunt.registerTask('check-json', 'Validates the course json, checks for duplicate IDs, and that each element has a parent', function() {
          // validates JSON files
          grunt.task.run('jsonlint');

          var _ = require('underscore');
          var chalk = require('chalk'); // for some nice colouring

          var listOfCourseFiles = ['course', 'contentObjects', 'articles', 'blocks', 'components'];
          var listOfObjectTypes = ['course', 'menu', 'page', 'article', 'block', 'component' ];

          // Go through each course folder inside the <%= sourcedir %>course directory
          grunt.file.expand({filter: 'isDirectory'}, grunt.config('sourcedir') + 'course/*').forEach(function(path) {

              var courseItemObjects = [];

              // Go through each list of declared course files
              listOfCourseFiles.forEach(function(jsonFileName) {
                  var currentJson = grunt.file.readJSON(path + '/' + jsonFileName + '.json');

                  //collect all course items in a single array
                  switch (jsonFileName) {
                  case "course":
                      //course file is a single courseItemObject
                      courseItemObjects.push(currentJson);
                      break;
                  default:
                      //all other files are arrays of courseItemObjects
                      courseItemObjects = courseItemObjects.concat(currentJson);
                      break;
                  }

              });

              //index and group the courseItemObjects
              var idIndex = _.indexBy(courseItemObjects, "_id");
              var idGroups = _.groupBy(courseItemObjects, "_id");
              var parentIdGroups = _.groupBy(courseItemObjects, "_parentId");

              //setup error collection arrays
              var orphanedIds = [];
              var emptyIds = [];
              var duplicateIds = [];
              var missingIds = [];

              for (var i = 0, l = courseItemObjects.length; i < l; i++) {
                  var contentObject = courseItemObjects[i];
                  var id = contentObject._id;
                  var parentId = contentObject._parentId;
                  var typeName = contentObject._type;
                  var typeIndex = listOfObjectTypes.indexOf(typeName);

                  var isRootType = typeIndex === 0;
                  var isBranchType = typeIndex < listOfObjectTypes.length - 1;
                  var isLeafType = !isRootType && !isBranchType;

                  if (!isLeafType) { //(course, contentObjects, articles, blocks)
                      if (parentIdGroups[id] === undefined) emptyIds.push(id); //item has no children
                  }

                  if (!isRootType) { //(contentObjects, articles, blocks, components)
                      if (idGroups[id].length > 1) duplicateIds.push(id); //id has more than one item
                      if (!parentId || idIndex[parentId] === undefined) orphanedIds.push(id); //item has no defined parent id or the parent id doesn't exist
                      if (idIndex[parentId] === undefined) missingIds.push(parentId); //referenced parent item does not exist
                  }

              }

              //output only unique entries
              orphanedIds = _.uniq(orphanedIds);
              emptyIds = _.uniq(emptyIds);
              duplicateIds = _.uniq(duplicateIds);
              missingIds = _.uniq(missingIds);

              //output for each type of error
              var hasErrored = false;
              if (orphanedIds.length > 0) {
                  hasErrored = true;
                  grunt.log.writeln(chalk.yellow('Orphaned _ids: ' + orphanedIds));
              }

              if (missingIds.length > 0) {
                  hasErrored = true;
                  grunt.log.writeln(chalk.yellow('Missing _ids: ' + missingIds));
              }

              if (emptyIds.length > 0) {
                  hasErrored = true;
                  grunt.log.writeln(chalk.yellow('Empty _ids: ' + emptyIds));
              }

              if (duplicateIds.length > 0) {
                  hasErrored = true;
                  grunt.log.writeln(chalk.yellow('Duplicate _ids: ' + duplicateIds));
              }

              //if any error has occured, stop processing.
              if (hasErrored) {
                  grunt.fail.fatal('Oops, looks like you have some json errors.');
              }
              else {
                  grunt.log.ok('No issues found, your JSON is a-ok!');
              }

          });

      });
}
