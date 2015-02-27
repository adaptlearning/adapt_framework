//GULP+LIBRARY IMPORTS
    var version = "0.0.5"
    var gulp = require("gulp"),
        _ = require('underscore'),
        chalk = require("chalk"),
        amdOptimize, handlebars, hbs, LESS, minimatch, npm, download, unzip, minifyCSS, sourcemaps, imagesize, jshint, jshintReporter, uglify, tap, path, file, declare, fs, Q, del, gulpif, wrap, concat, collate, deleted, changed, gwatch, filter, source, vinylBuffer, newer, exif, pngjs,
        config = require("./gulpconfig");

    var reloadClient, isReloadClient = false;

    function checkUpdates(version) {
        var request = require("request");
        var url = "https://raw.githubusercontent.com/oliverfoster/adapt_framework_gulp/master/package.json";
        var goUrl = "Please run 'gulp update'";
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.version != version) {
                    console.log(chalk.bgRed("GULP FILE VERSION: Out of date (" + version + "). Latest (" + body.version + ").\n"+goUrl));
                } else {
                    console.log(chalk.bgGreen("GULP FILE VERSION: Latest ("+version+")."));
                }
            }
        });
        checkUpdates.checked = true;
    }


//UTILITY FUNCTIONS
    var walkSync = function(dir, done) {
        var results = [];
        var list = fs.readdirSync(dir);
        var pending = list.length;
        if (!pending) return done(results);
        var red = 0;
        list.forEach(function(file) {
            var subdirpath = path.join(dir, file);
            var stat = fs.statSync(subdirpath);
            red++;
            if (stat && stat.isDirectory()) {
                results.push( file );
            }
            if (red == pending) return done(results);
        });
    };

    var templateCache = {};
    var stringReplace = function(str, context) {
        if (!hbs) hbs = require('handlebars');
        if (!path) path = require("path");

        if (str instanceof Array) {
            var ret = [];
            for (var i = 0, l = str.length; i < l; i++) {
                if (!templateCache[str[i]]) templateCache[str[i]] = hbs.compile(str[i]);
                ret[i] = templateCache[str[i]](context);
            }
            return ret;
        } else {
            if (!templateCache[str]) templateCache[str] = hbs.compile(str);
            return templateCache[str](context);
        }
    };

    
    var destToAll = function(stream, dest, context) {
        if (!context.manyCourses) return destTo.apply(this, arguments);
        
        var destOut = function(stream, dest ) {
            return stream.pipe(gulp.dest(dest));
        };

        //output to each dest folder
        for (var i = 0, l = context.options.length; i < l; i++) {
            var destResolved = stringReplace(dest, context.options[i]);
            stream = destOut(stream, destResolved);
        }

        return stream;
    };


    var destTo = function(stream, dest, context) {
        dest = stringReplace(dest, context);
        return stream.pipe(gulp.dest(dest));
    };

    var destNewerAll = function (stream, dest, context, fileName) {
        if (!context.manyCourses) return destNewer.apply(this, arguments);

        var destCheck = function(stream, dest ) {
            return stream.pipe(tap(function(file){
                    if (!file.stat) file.stat = { mtime: 0 };
                })).pipe(newer(dest));
        };

        for (var i = 0, l = context.options.length; i < l; i++) {
            var destResolved = path.join(process.cwd(), stringReplace(dest, context.options[i]), fileName);
            stream = destCheck(stream, destResolved);
        }

        return stream;
    };

    var destNewer = function (stream, dest, context, fileName) {
        dest = path.join(process.cwd(), stringReplace(dest, context), fileName);
        return stream.pipe(tap(function(file){
                if (!file.stat) file.stat = { mtime: 0 };
            })).pipe(newer(dest));
    };

    var deleteTheseAll = function(paths, context) {
        if (!context.manyCourses) return deleteThese.apply(this, arguments);

        if (!del) del = require('del');

        var delPaths;
        for (var i = 0, l = context.options.length; i < l; i++) {
            delPaths = stringReplace(paths, context.options[i]);
            del.sync(delPaths, {force:true});
        }
    };

    var deleteThese = function(paths, context) {
        if (!del) del = require('del');
        if (context) paths = stringReplace(paths, context);
        del.sync(paths, {force:true});
    };

    var expandAllCourses = function(arr) {
        switch (courseOptions.manyCourses) {
        case true:
            var ret = [];
            for (var c = 0, cl = courseOptions.options.length; c < cl; c++) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    ret.push( stringReplace(arr[i], courseOptions.options[c]) );
                }    
            }
            break;
        case false:
            var ret = [];
            for (var i = 0, l = arr.length; i < l; i++) {
                ret.push( stringReplace(arr[i], courseOptions) );
            }
        }
        ret = _.uniq(ret);
        return ret;
    };


//JAVASCRIPT BUILD + ASSEMBLE FUNCTIONS
    var buildCore = function(options, config) {
        if (!amdOptimize) amdOptimize = require("gulp-amd-optimize");
        if (!sourcemaps) sourcemaps = require('gulp-sourcemaps');
        if (!jshint) jshint = require('gulp-jshint');
        if (!jshintReporter) jshintReporter = require('jshint-stylish');
        if (!uglify) uglify = require('gulp-uglify');
        if (!file) file = require('gulp-file');
        if (!Q) Q = require('q');
        if (!gulpif) gulpif = require("gulp-if");
        if (!concat) concat = require('gulp-concat');
        if (!filter) filter = require('gulp-filter');
        if (!newer) newer = require('gulp-newer');
        if (!tap) tap = require('gulp-tap');

        var config = {
            globs: config.buildGlobs.javascript.core,
            core: config.coreRequires,
            lintingFilter: config.lintingFilter,
            buildConstructs: config.buildConstructs,
            corePaths: config.corePaths,
            coreShim: config.coreShim,
            coreMap: config.coreMap,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        console.log(chalk.white("* - Building Core..."));
        options = options || {};
        var deferred = Q.defer();

        _.defer(function() {

            var coreFile = "require.config({paths:"+JSON.stringify( config.corePaths, null, "\t")+",map:"+JSON.stringify(config.coreMap, null, "\t")+"});";
            coreFile += "require(" + JSON.stringify( config.core, null, "\t") + ", function() {});";

            var jshintFilter = filter(config.lintingFilter);

            if (options.production) deleteTheseAll( config.globs.cleanPaths, options.courseOptions );

            var ended = false;
            var stream = gulp.src( config.globs.srcPaths , config.gulp )
                .pipe(file( config.globs.srcFilename, coreFile));

                stream = stream.pipe(gulpif(options.sourcemap, sourcemaps.init()))
                .pipe(amdOptimize("core", {
                    paths: config.corePaths,
                    shim: config.coreShim
                }))
                .on("error", function(error) {
                    if (ended) return;
                    displayError.call(this, error, "Core");
                })
                .pipe(gulpif(options.lint, jshintFilter))
                .pipe(gulpif(options.lint, jshint()))
                .pipe(gulpif(options.lint, jshint.reporter(jshintReporter)))
                .pipe(gulpif(options.lint, jshintFilter.restore()))
                .pipe(concat( config.globs.destFilename ))
                .pipe(gulpif(options.uglify && !options.production, uglify({
                        mangle: false,
                        compress: false
                    })))
                .pipe(gulpif(options.sourcemap,sourcemaps.write(".")));

                stream = destToAll(stream, config.globs.destPath, options.courseOptions);

                stream.on("end", function() {
                    ended = true;
                    //console.log(chalk.white("* - Finished Core."));
                    deferred.resolve(options);
                });
        });

        return deferred.promise;
    };

    var buildBundles = function(options, config) {
        if (!amdOptimize) amdOptimize = require("gulp-amd-optimize");
        if (!sourcemaps) sourcemaps = require('gulp-sourcemaps');
        if (!jshint) jshint = require('gulp-jshint');
        if (!jshintReporter) jshintReporter = require('jshint-stylish');
        if (!uglify) uglify = require('gulp-uglify');
        if (!tap) tap = require("gulp-tap");
        if (!file) file = require('gulp-file');
        if (!Q) Q = require('q');
        if (!concat) concat = require('gulp-concat');
        if (!filter) filter = require('gulp-filter');
        if (!newer) newer = require('gulp-newer');

        var config = {
            globs: config.buildGlobs.javascript.bundles,
            core: config.coreRequires,
            lintingFilter: config.lintingFilter,
            buildConstructs: config.buildConstructs,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        var options = _.extend({
            paths: {},
            globs: {},
            inject: {}
        }, options);

        var assembleBundle = function(folderName) {
            console.log(chalk.white("" + options.courseOptions.course + " - Building Bundle (" + folderName + ").."));

            var deferred = Q.defer();

            var globs = {};
            var paths = {};
            var shim = {};
            shim[folderName] = { deps: [] };

            //TODO: stop from fetch any by specified menu + theme
            gulp.src( folderName + "/**/bower.json", config.gulp )
                .pipe(tap(function(file) {
                    var bowerJSON = JSON.parse(file.contents.toString());
                    if (bowerJSON.main === undefined) return;
                    if (bowerJSON.main.indexOf(".js") < 0) return;
                    var pluginName = file.relative.substr(folderName.length+1);
                    pluginName = pluginName.substr(0, pluginName.length - ("/bower.json").length);
                    var fileName = bowerJSON.main.substr(0, bowerJSON.main.indexOf(".js"));
                    paths[pluginName] = folderName + "/" + pluginName + ( fileName.substr(0,1) != "/" ? "/" :"" ) + fileName;
                    globs[ folderName + "/" + pluginName + "/js/**/*.js" ] = true;
                    shim[folderName].deps.push(pluginName);
                }))
                .on("end", function() {
                    var output = 'define("' + folderName + "/" + folderName + '",' + JSON.stringify( _.values(paths) ) + ", function() {});";
                    options.inject[ folderName + "/" + folderName + ".js" ] = output;

                    options.paths = _.extend({}, options.paths, paths);
                    options.globs = _.extend({}, options.globs, globs);
                    //console.log(chalk.white("" + options.courseOptions.course + " - Finished Bundle (" + folderName + ")"));
                    deferred.resolve(options);
                });

            return deferred.promise;
        };

        var mergeBundles = function() {
            var deferred = Q.defer();

            var destPath = stringReplace(config.globs.destPath, options.courseOptions);
            var destFilename = stringReplace(config.globs.destFilename, options.courseOptions);
            var srcFilename = config.globs.srcFilename;
            var srcPaths = config.globs.srcPaths;
            var srcPathMap = config.globs.srcPathMap;
            var nullPath = srcPathMap['null'];

            var coreFiles = srcPaths.concat(_.keys(options.globs));       

            for (var i = 0, l = config.core.length; i < l; i++) {
                options.paths[config.core[i]] = nullPath;
            }
            for (var k in srcPathMap) {
                options.paths[k] = srcPathMap[k];    
            }

            var pathsString = JSON.stringify(_.uniq(_.values(options.paths)), null, "\t");
            var bundlesFile = "define('bundles', function () { return "+pathsString+"; });\n\nrequire(" + pathsString + ", function() {});";
            options.paths["bundles"] = srcFilename.substr(srcFilename,srcFilename.length-3);

            var jshintFilter = filter(config.lintingFilter); 

            console.log(chalk.white("" + options.courseOptions.course + " - Merging Bundles..."));
        
            if (options.production) deleteThese(stringReplace(config.globs.cleanPaths, options.courseOptions));

            var ended = false;
            var stream = gulp.src(coreFiles, config.gulp )
                .pipe(file( srcFilename, bundlesFile))
                .pipe(file( nullPath+".js", config.buildConstructs['null.js'] ));

                for (var fileName in options.inject) {
                    stream = stream.pipe(file(fileName, options.inject[fileName]));
                }

                stream = stream.pipe(gulpif(options.sourcemap,sourcemaps.init()))
                .pipe(amdOptimize( "bundles", {
                    paths: options.paths,
                    exclude: config.core
                }))
                .on("error", function(error) {
                    if (ended) return;
                    displayError.call(this, error, "Bundles");
                })

                stream = stream.pipe(gulpif(options.lint, jshintFilter))
                .pipe(gulpif(options.lint, jshint()))
                .pipe(gulpif(options.lint, jshint.reporter(jshintReporter)))
                .pipe(gulpif(options.lint, jshintFilter.restore()))
                .pipe(concat( destFilename ))
                .pipe(gulpif(options.uglify && !options.production, uglify({
                        mangle: false,
                        compress: false
                    })))
                .pipe(gulpif(options.sourcemap,sourcemaps.write(".")));

                stream = destTo(stream, destPath, options.courseOptions);

                stream.on("end", function() {
                    ended = true;
                    //console.log(chalk.white("" + options.courseOptions.course + " - Finished Bundles."));
                    deferred.resolve(options);
                });

            return deferred.promise;

        };


        return Q.all([
                assembleBundle('components'),
                assembleBundle('extensions'),
                assembleBundle('theme'),
                assembleBundle('menu'),
            ])
            .then(function() {
                return mergeBundles();
            });
    };

    var buildLoader = function(options, config) {
        if (!uglify) uglify = require('gulp-uglify');
        if (!path) path = require("path");
        if (!file) file = require('gulp-file');
        if (!Q) Q = require('q');
        if (!gulpif) gulpif = require("gulp-if");
        if (!concat) concat = require('gulp-concat');
        if (!source) source = require('vinyl-source-stream');
        if (!vinylBuffer) vinylBuffer = require('vinyl-buffer');

        var config = {
            globs: config.buildGlobs.javascript,
            buildConstructs: config.buildConstructs,
            gulp: { base: ".", cwd: "."}
        };

        if (options.production) {
            console.log(chalk.white("" + options.courseOptions.course + " - Building Loader..."));
        } else {
            console.log(chalk.white("* - Building Loader..."));
        }

        var deferred = Q.defer();

        var adaptJS = config.buildConstructs['adapt.min.js'];

        if (options.production) {

            var jsFiles = [];
            for (var k in config.globs) {
                jsFiles.push( 
                    path.join( 
                        stringReplace(config.globs[k].destPath, options.courseOptions), 
                        stringReplace(config.globs[k].destFilename, options.courseOptions) 
                    ) 
                );
            }
    
            var stream = gulp.src(jsFiles, config.gulp )
                .pipe(file("adapt.js", adaptJS))
                .pipe(concat("adapt.min.js"))
                .pipe(gulpif(options.uglify, uglify({
                    mangle: false,
                    compress: false
                })));

                stream = destTo(stream, "build/{{courseDestPath}}/adapt/js/", options.courseOptions);

                stream.on("end", function() {
                    deleteThese(jsFiles);
                    //console.log(chalk.white("" + options.courseOptions.course + " - Finished loader."));
                    deferred.resolve();
                });

        } else {

            var streamSource = source("adapt.min.js");
                streamSource.write(adaptJS);
                process.nextTick(function() {
                  streamSource.end();
                });

                stream = streamSource
                    .pipe(vinylBuffer());

                stream = destToAll(stream, "build/{{courseDestPath}}/adapt/js/", options.courseOptions);

                stream.on("end", function() {
                    //console.log(chalk.white("* - Finished Loader."));
                    deferred.resolve();
                });

        }

        return deferred.promise;

    };


//HANDLEBARS BUILD FUNCTIONS
    var buildHandlebars = function(options, config) {
        if (!handlebars) handlebars = require('gulp-handlebars');
        if (!sourcemaps) sourcemaps = require('gulp-sourcemaps');
        if (!uglify) uglify = require('gulp-uglify');
        if (!declare) declare = require("gulp-declare");
        if (!Q) Q = require('q');
        if (!gulpif) gulpif = require("gulp-if");
        if (!wrap) wrap = require('gulp-wrap');
        if (!concat) concat = require('gulp-concat');
        if (!tap) tap = require('gulp-tap');

        var config = {
            globs: config.buildGlobs.javascript,
            core: config.coreRequires,
            buildConstructs: config.buildConstructs,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        var performBuild = function(options, config, style) {
            console.log(chalk.white("" + options.courseOptions.course + " - Building "+style.name+"..."));
            options = options || {};
            var deferred = Q.defer();

            var handlebarsFiles = stringReplace(config.globs[style.config].srcPaths, options.courseOptions);
            var destFilename = stringReplace(config.globs[style.config].destFilename, options.courseOptions);
            var destPath = stringReplace(config.globs[style.config].destPath, options.courseOptions);

            if (options.production) deleteThese(config.globs[style.config].cleanPaths, options.courseOptions);

            var ended;
            var stream = gulp.src(handlebarsFiles, config.gulp );
                stream = destNewerAll(stream, destPath, options.courseOptions, destFilename );
                
                stream = stream.pipe(gulpif(options.sourcemap,sourcemaps.init()))
                .pipe(handlebars({}))
                .on("error", function(error) {
                    displayError.call(this, error, style.name);
                })
                .pipe(wrap('Handlebars.template(<%= contents %>)'))
                .pipe(declare({
                    namespace: style.namespace,
                    noRedeclare: true,
                }))
                .pipe(concat( destFilename ))
                .pipe(wrap( config.buildConstructs[ destFilename ] ))
                .pipe(gulpif(options.uglify && !options.production, uglify({
                        mangle: false,
                        compress: false
                    })))
                .pipe(gulpif(options.sourcemap,sourcemaps.write(".")))
                
                stream = destTo(stream, destPath, options.courseOptions);

                stream.on("end", function() {
                    ended = true;
                    //console.log(chalk.white("" + options.courseOptions.course + " - Finished "+style.name+"."));
                    deferred.resolve(options);
                });

            return deferred.promise;
        };

        var partialsStyle = {
            name: "Partials",
            namespace: "Handlebars.partial",
            config: "partials"
        };

        var templatesStyle = {
            name: "Templates",
            namespace: "Handlebars.templates",
            config: "templates"
        };

        return Q.all([
            performBuild(options, config, partialsStyle),
            performBuild(options, config, templatesStyle)
        ]);
    };

//LESS BUILD
    var buildLESS= function(options, config) {
        if (!LESS) LESS = require('gulp-less');
        if (!minifyCSS) minifyCSS = require('gulp-minify-css');
        if (!sourcemaps) sourcemaps = require('gulp-sourcemaps');
        if (!tap) tap = require("gulp-tap");
        if (!path) path = require("path");
        if (!Q) Q = require('q');
        if (!gulpif) gulpif = require("gulp-if");
        if (!source) source = require('vinyl-source-stream');
        if (!vinylBuffer) vinylBuffer = require('vinyl-buffer');

        var config = {
            globs: config.buildGlobs.less,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath},
            srcPath: config.buildGlobs.srcPath
        };

        console.log(chalk.white("" + options.courseOptions.course + " - Building LESS..."));
        options = options || {};
        var deferred = Q.defer();

        var lessFiles = stringReplace(config.globs.srcPaths, options.courseOptions);
        var destPath =  stringReplace(config.globs.destPath, options.courseOptions);
        var destFilename =  stringReplace(config.globs.destFilename, options.courseOptions);

        var importDirectives = [];
        
        if (options.production) deleteThese(config.globs.cleanPaths, options.courseOptions);

        gulp.src(lessFiles, config.gulp )
            .pipe(tap(function(file) {
                importDirectives.push('@import "'+file.relative+'";');
            }))
            .on("end", function() {
                var importString = importDirectives.join("\n");

                var streamSource = source( path.join(config.srcPath, "adapt.less") );
                streamSource.write(importString);
                process.nextTick(function() {
                  streamSource.end();
                });

                stream = streamSource
                    .pipe(vinylBuffer());

                    stream = stream.pipe(tap(function(file) {
                        var srcPath = config.srcPath;
                        file.cwd = file.base = srcPath;
                    }))
                    .pipe(gulpif(options.sourcemap, sourcemaps.init()))
                    .pipe(LESS({
                        paths: [ path.join(__dirname, 'src') ]
                    }))
                    .on("error", function(error) {
                        displayError.call(this, error, "LESS");
                    })
                    .pipe(gulpif(options.uglify,minifyCSS()))
                    .pipe(gulpif(options.sourcemap, sourcemaps.write(".")));
                    
                    stream = destTo(stream, destPath, options.courseOptions);

                    stream.on("end", function() {
                        //console.log(chalk.white("" + options.courseOptions.course + " - Finished LESS."));
                        deferred.resolve(options);
                    });
            });


        return deferred.promise;

    };

//ASSET FUNCTIONS
    var fileCheck = function(options, config) {
        if (!Q) Q = require('q');
        if (!imagesize) imagesize = require('image-size');
        if (!path) path = require('path');
        if (!tap) tap = require('gulp-tap');

        var config = {
            globs: config.buildGlobs.files,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        var pathCheck = function(srcPath, options) {
            var deferred = Q.defer();

            var srcPath = stringReplace( srcPath , options.courseOptions);
            var fcOpts = options.filecheck.options;

            var suspects = [];
            gulp.src(srcPath, { base: "build", cwd:"."})
                .pipe(tap(function(file) {
                    var extension = path.extname(file.path).substr(1);;
                    switch ( extension ) {
                    case "jpeg":
                    case "jpg":
                    case "png":
                        var data = imagesize(file.path);
                        file.width = data.width;
                        file.height = data.height;
                        break;
                    case "mp4":
                    case "ogv":
                        file.width = 0;
                        file.height = 0;
                        break
                    default:
                        return;
                    }

                    var settings = fcOpts[extension];
                    if(settings) {
                        if(file.size > settings.size) {
                            if(!file.flaggedProps) file.flaggedProps = [];
                            file.flaggedProps.push("filesize:" + (Math.round(file.size/100)/10) + "mb");
                        }
                        else if(file.width > settings.width) {
                            if(!file.flaggedProps) file.flaggedProps = [];
                            file.flaggedProps.push("width:" + file.width + "px");
                        }
                        else if(file.height > settings.height) {
                            if(!file.flaggedProps) file.flaggedProps = [];
                            file.flaggedProps.push("height:" + file.height + "px");
                        }
                        if(file.flaggedProps !== undefined) {
                            suspects.push(file);
                        }
                    }

                }))
                .on("end", function() {
                    if(suspects.length > 0) {
                        for(var i = 0, length = suspects.length; i < length; i++) {
                            console.log(chalk.bgMagenta("" + options.courseOptions.course + " - '" + suspects[i].relative + "' (" + suspects[i].flaggedProps + ")"));
                        }
                    }
                    deferred.resolve();
                });

            return deferred.promise;
        };

        console.log(chalk.white("" + options.courseOptions.course + " - Checking Files..."));

        var promises = [];
        
        for (var i = 0, l = options.filecheck.srcPaths.length; i < l; i++) {
            var srcPath = options.filecheck.srcPaths[i];
            promises.push(pathCheck(srcPath, options));
        }

        return Q.all(promises).then(function() {
            //console.log(chalk.white("" + options.courseOptions.course + " - Finished Checking Files."));
        });
    };

    var buildFiles = function(options, config) {

        if (!Q) Q = require('q');
        if (!gulpif) gulpif = require("gulp-if");
        if (!collate) collate = require('gulp-collate');
        if (!deleted) deleted = require('gulp-deleted');
        if (!changed) changed = require('gulp-changed');
        if (!tap) tap = require('gulp-tap');

        var oconfig = config;
        var config = {
            globs: config.buildGlobs.files,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        var copyFiles = function(paths, collateTo, dest, destPatterns, options, force) {
            var deferred = Q.defer();

            var pathsResolved = stringReplace(paths, options.courseOptions);
            var destResolved = stringReplace(dest, options.courseOptions);
            var collateToResolved = stringReplace(collateTo, options.courseOptions);
            var destPatternsResolved = stringReplace(destPatterns, options.courseOptions);

            var stream = gulp.src(pathsResolved, config.gulp )
                .pipe(gulpif(collateTo !== undefined, collate(collateToResolved)))
                if (force !== true && destPatternsResolved !== undefined) {
                    stream = stream.pipe(deleted(destResolved, destPatternsResolved ))
                    .pipe(changed(dest));
                }
                stream.pipe(gulp.dest( destResolved ))
                .on("end", function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        
        console.log(chalk.white("" + options.courseOptions.course + " - Managing Files..."));
        var filesList = [];

        for (var itemName in config.globs) {
            filesList.push(
                copyFiles(
                    config.globs[itemName].srcPaths,
                    config.globs[itemName].srcCollate, 
                    config.globs[itemName].dest,
                    config.globs[itemName].destPaths,
                    options,
                    config.globs[itemName].force
                )
            );
        }
        
        var queue = Q.all(filesList)

        queue.then(function() {
            //console.log(chalk.white("" + options.courseOptions.course + " - Finished Files."));
        });

        return queue;

    };


//TRACKING IDS
    var tracking = function(options, config) {
        if (!path) path = path = require("path");
        if (!fs) fs = require('fs');

        var courseBasePath = path.join( process.cwd(), config.buildGlobs.srcPath, stringReplace(options.trackingconfig.courseBasePath, options.courseOptions));

        var languages;
        walkSync(courseBasePath, function(subdirs) {
            languages = subdirs;
        });

        var insertTrackingIds = function (options) {
            console.log(chalk.white("" + options.courseOptions.course + " - Inserting tracking...."));
            var course = JSON.parse(fs.readFileSync(options.trackingconfig.courseFilePath));
            var blocks = JSON.parse(fs.readFileSync(options.trackingconfig.blocksFilePath));

            options._latestTrackingId = course._latestTrackingId || -1;
            options._trackingIdsSeen = [];
            
            for(var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                console.log("block: " + block._id + ": " + (block._trackingId !== undefined ? block._trackingId : "not set"));
                if(block._trackingId === undefined) {
                    block._trackingId = ++options._latestTrackingId;
                    console.log("Adding tracking ID: " + block._trackingId + " to block " + block._id);
                } else {
                    if(options._trackingIdsSeen.indexOf(block._trackingId) > -1) {
                        console.log(chalk.bgRed("Warning: " + block._id + " has the tracking ID " + block._trackingId + ", but this is already in use. Changing to " + (options._latestTrackingId + 1) + "."));
                        block._trackingId = ++options._latestTrackingId;
                    } else {
                        options._trackingIdsSeen.push(block._trackingId);
                    }
                }
                if(options._latestTrackingId < block._trackingId) {
                    options._latestTrackingId = block._trackingId;
                }
                    
            }
            course._latestTrackingId = options._latestTrackingId;
            console.log("Task complete. The latest tracking ID is " + course._latestTrackingId);
            fs.writeFileSync(options.trackingconfig.courseFilePath, JSON.stringify(course, null, "    "));
            fs.writeFileSync(options.trackingconfig.blocksFilePath, JSON.stringify(blocks, null, "    "));
            //console.log(chalk.white("" + options.courseOptions.course + " - Finished tracking."));
        };

        var removeTrackingIds = function (options) {
            console.log(chalk.white("" + options.courseOptions.course + " - Removing tracking...."));
            var course = JSON.parse(fs.readFileSync(options.trackingconfig.courseFilePath));
            var blocks = JSON.parse(fs.readFileSync(options.trackingconfig.blocksFilePath));

            for(var i = 0; i < blocks.length; i++) {
                delete blocks[i]._trackingId;
            }
            delete course._latestTrackingId;
            console.log("Tracking IDs removed.");
            fs.writeFileSync(options.trackingconfig.courseFilePath, JSON.stringify(course, null, "    "));
            fs.writeFileSync(options.trackingconfig.blocksFilePath, JSON.stringify(blocks, null, "    "));
            //console.log(chalk.white("" + options.courseOptions.course + " - Finished tracking."));
        };

        var resetTrackingIds = function (options) {
            console.log(chalk.white("" + options.courseOptions.course + " - Resetting tracking...."));
            options._latestTrackingId = -1;

            var course = JSON.parse(fs.readFileSync(options.trackingconfig.courseFilePath));
            var blocks = JSON.parse(fs.readFileSync(options.trackingconfig.blocksFilePath));
                
            for(var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                block._trackingId = ++options._latestTrackingId;
                console.log("Adding tracking ID: " + block._trackingId + " to block " + block._id);
                options._latestTrackingId = block._trackingId;
            }
            course._latestTrackingId = options._latestTrackingId;
            console.log("The latest tracking ID is " + course._latestTrackingId);
            fs.writeFileSync(options.trackingconfig.courseFilePath, JSON.stringify(course, null, "    "));
            fs.writeFileSync(options.trackingconfig.blocksFilePath, JSON.stringify(blocks, null, "    "));
            //console.log(chalk.white("" + options.courseOptions.course + " - Finished tracking...."));
        };

        for (var i = 0, l = languages.length; i < l; i++) {
            var language = languages[i];

            options.trackingconfig.courseFilePath = path.join(courseBasePath, language, "course.json");
            options.trackingconfig.blocksFilePath = path.join(courseBasePath, language, "blocks.json");

            switch (options['tracking-command']) {
            case "insert":
                insertTrackingIds(options);
                break;
            case "remove":
                removeTrackingIds(options);
                break;
            case "reset":
                resetTrackingIds(options);
                break;
            default:
                throw "Tracking command not supported: " + options.perform;
            }
        }
    };

//JSON CHECK
    var checkJson = function(options, config) {
        var idRegExp;
        function check(options) {
            var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];
            var storedParentChildrenIds = {};
            var idFile = {};
            var storedIds = [];
            var storedFileParentIds = {};
            var storedFileIds = {};
            var hasOrphanedParentIds = false;
            var orphanedParentIds = [];
            var courseId;

            // method to check json ids
            function checkJsonIds() {
                console.log(chalk.white("" + options.courseOptions.course + " - Checking JSON..."));
                var currentCourseFolder;
                // Go through each course folder inside the src/course directory
                walkSync( options.jsonconfig.courseBasePath, function(subdirs) {
                    _.each(subdirs, function(subdir) {
                        var dir = path.join(options.jsonconfig.courseBasePath, subdir);
                        // Stored current path of folder - used later to read .json files
                        currentCourseFolder = dir;
                        storedParentChildrenIds = {};
                        // Go through each list of declared course files
                        listOfCourseFiles.forEach(function(jsonFileName) {
                            // Make sure course.json file is not searched
                            if (jsonFileName !== "course") {
                                
                                storedFileParentIds[jsonFileName] = [];
                                storedFileIds[jsonFileName] = [];
                                // Read each .json file
                                var currentJsonFile = JSON.parse(fs.readFileSync(currentCourseFolder + "/" + jsonFileName + ".json"));
                                currentJsonFile.forEach(function(item) {
                                    idFile[item._id] = jsonFileName;
                                    // Store _parentIds and _ids to be used by methods below
                                    if (!storedParentChildrenIds[item._parentId]) storedParentChildrenIds[item._parentId] = [];
                                    storedParentChildrenIds[item._parentId].push(item._id);
                                    if (item._type !== "component") {
                                        storedParentChildrenIds[item._id] = [];
                                    }
                                    storedFileParentIds[jsonFileName].push(item._parentId);
                                    storedFileIds[jsonFileName].push(item._id);
                                    storedIds.push(item._id);
                                });

                            } else {
                                var currentJsonFile = JSON.parse(fs.readFileSync(currentCourseFolder + "/" + jsonFileName + ".json"));

                                courseId = currentJsonFile._id
                            }
                            
                        });
                    });

                    checkIds();
                    
                    checkEachParentHasChildren();

                    checkDuplicateIds();

                    checkEachElementHasParentId();

                });
                
                //console.log(chalk.white("" + options.courseOptions.course + " - Finished Checking JSON."));

            }

            function checkIds () {
                var badIds = [];
                for (var i = 0, l = storedIds.length; i < l; i++) {
                    if (storedIds[i].match(idRegExp) === null) {
                        badIds.push(storedIds[i]);
                    }
                }
                if (badIds.length > 0) {
                    console.log(chalk.bgCyan("Unconventional IDs " + badIds));
                }
            }

            function checkEachParentHasChildren() {
                var emptyIds = [];
                for (var id in storedParentChildrenIds) {
                    if (storedParentChildrenIds[id].length === 0) {
                        emptyIds.push( idFile[id] + ": " + id );
                    }
                }
                if (emptyIds.length > 0) {
                    console.log(chalk.bgRed("Empty " + emptyIds));
                }
            }

            function checkDuplicateIds() {
                // Change _ids into an object of key value pairs that contains _ids as keys and a number count of same _ids
                var countIdsObject = _.countBy(storedIds);
                var hasDuplicateIds = false;
                var duplicateIds = [];
                _.each(countIdsObject, function(value, key) {
                    // Check value of each _ids is not more than 1
                    if (value > 1) {
                        hasDuplicateIds = true;
                        duplicateIds.push(key);
                    }
                });

                // Check if any duplicate _ids exist and return error
                if (hasDuplicateIds) {
                    console.log(chalk.bgRed("Duplicate ids " + duplicateIds));
                }
            }

            function checkIfOrphanedElementsExist(value, parentFileToCheck) {
                _.each(value, function(parentId) {
                    if (parentId === courseId) {
                        return;
                    }
                    if (_.indexOf(storedFileIds[parentFileToCheck], parentId) === -1) {
                        hasOrphanedParentIds = true;
                        orphanedParentIds.push(parentId);
                    }
                });
            }

            function checkEachElementHasParentId() {
                _.each(storedFileParentIds, function(value, key) {
                    switch(key){
                        case "contentObjects":
                            return checkIfOrphanedElementsExist(value, "contentObjects");
                        case "articles":
                            return checkIfOrphanedElementsExist(value, "contentObjects");
                        case "blocks":
                            return checkIfOrphanedElementsExist(value, "articles");
                        case "components":
                            return checkIfOrphanedElementsExist(value, "blocks");
                    }

                });

                if (hasOrphanedParentIds) {
                    console.log(chalk.bgRed("Orphaned objects " + orphanedParentIds));
                }
            }
            checkJsonIds();
        }

        
        var opts = _.extend({}, options, { jsonconfig: _.extend({}, options.jsonconfig) });
        opts.jsonconfig.courseBasePath = path.join(process.cwd(), config.buildGlobs.srcPath, stringReplace(opts.jsonconfig.courseBasePath, opts.courseOptions));
        idRegExp = new RegExp(opts.jsonconfig.idRegExp);
        check(opts);
            
    };

//ASSET CHECK
    var checkAssets = function(options, config) {        
        var assetRegExp;
        function check(options) {
            var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];
            var assetListPaths = [];

            // method to check json ids
            function checkAssetsExists() {
                console.log(chalk.white("" + options.courseOptions.course + " - Checking Assets..."));
                var currentCourseFolder;
                // Go through each course folder inside the src/course directory
                walkSync( options.assetcheckconfig.courseBasePath, function(subdirs) {
                    _.each(subdirs, function(subdir) {
                        var dir = path.join(options.assetcheckconfig.courseBasePath, subdir);
                        // Stored current path of folder - used later to read .json files
                        var currentCourseFolder = dir;
                        // Go through each list of declared course files
                        listOfCourseFiles.forEach(function(jsonFileName) {
                            // Make sure course.json file is not searched
                                                            
                            assetListPaths[jsonFileName] = [];
                            // Read each .json file
                            var currentJsonFile = ""+ fs.readFileSync(currentCourseFolder + "/" + jsonFileName + ".json");
                            var matches = currentJsonFile.match(assetRegExp);
                            matches = _.uniq(matches);
                            if (matches === null) return;
                            for (var i = 0, l = matches.length; i < l; i++) {
                                switch (matches[i].substr(0,2)) {
                                case "\\'": case '\\"':
                                    matches[i] = matches[i].substr(2);
                                }
                                switch (matches[i].substr(matches[i].length-2,2)) {
                                case "\\'": case '\\"':
                                    matches[i] = matches[i].substr(0, matches[i].length-2);
                                }
                                switch (matches[i].substr(0,1)) {
                                case "'": case '"':
                                    matches[i] = matches[i].substr(1);
                                }
                                switch (matches[i].substr(matches[i].length-1,1)) {
                                case "'": case '"':
                                    matches[i] = matches[i].substr(0, matches[i].length-1);
                                }
                                assetListPaths.push(matches[i]);

                                var filePath = path.join(opts.assetcheckconfig.courseDestPath, matches[i]);
                                if (!fs.existsSync( filePath )  && matches[i].substr(0,4) != "data") {
                                    var outputpath = path.join(opts.assetcheckconfig.courseDestPath,  "course", subdir, jsonFileName + ".json");
                                    currentJsonFile = currentJsonFile.replace(matches[i], missingImage({resourceUri:matches[i]}) );
                                    fs.writeFileSync(outputpath, currentJsonFile);
                                }

                            }

                        });
                    });
                });
                assetListPaths = _.uniq(assetListPaths);

                for (var i = 0, l = assetListPaths.length; i < l; i++ ){
                    if (assetListPaths[i].substr(0,4) === "http") {
                        console.log(chalk.bgCyan("" + options.courseOptions.course + " - External: ", assetListPaths[i]))
                        continue;
                    }
                    var filePath = path.join(opts.assetcheckconfig.courseDestPath, assetListPaths[i]);
                    if (!fs.existsSync( filePath )) {
                        console.log(chalk.bgRed("" + options.courseOptions.course + " - Missing: ", assetListPaths[i]))
                    }
                }                
                //console.log(chalk.white("" + options.courseOptions.course + " - Finished Checking Assets."));

            }

            checkAssetsExists();
        }

        
        var opts = _.extend({}, options, { assetcheckconfig: _.extend({}, options.assetcheckconfig) });
        opts.assetcheckconfig.courseBasePath = path.join(process.cwd(), config.buildGlobs.srcPath, stringReplace(opts.jsonconfig.courseBasePath, opts.courseOptions));
        opts.assetcheckconfig.courseDestPath = path.join(process.cwd(), stringReplace(opts.assetcheckconfig.courseDestPath, opts.courseOptions));
        var missingImage = hbs.compile(opts.assetcheckconfig.missingImage);
        assetRegExp = new RegExp(opts.assetcheckconfig.assetRegExp, "g");
        check(opts);
            
    };

//STRING REPLACEMENT
    var stringReplacement = function(options, config) {
        console.log(chalk.white("" + options.courseOptions.course + " - String replacement..."));
        var q = Q.defer();
        var config = {
            globs: config.buildGlobs,
            gulp: { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath}
        };

        var performStringReplacements = function(sconfig, options, config, done) {

            var firstConfig;
            var context = stringReplace(sconfig.context, options.courseOptions);
            gulp.src(context, config.gulp)
                .pipe(tap(function(file){
                    if (firstConfig === undefined) firstConfig = file.contents.toString();
                }))
                .on("end", function() {
                    if (firstConfig === undefined) return done();

                    var JSONContext = JSON.parse(firstConfig);

                    var src = stringReplace(sconfig.src, options.courseOptions);
                    var dest  = stringReplace(sconfig.dest, options.courseOptions);
                    gulp.src(src, config.gulp)
                        .pipe(tap(function(file){
                            var temp = file.contents.toString();
                            file.contents = new Buffer(hbs.compile(temp)(JSONContext));
                        }))
                        .pipe(collate(sconfig.collateTo))
                        .pipe(gulp.dest(dest))
                        .on("end", function() {
                            done();
                        });

                });
        };

        var stringreplacementconfig = options.stringreplacementconfig;

        var doneCount = 0;
        function done() {
            doneCount++;
            if (doneCount == stringreplacementconfig.length) {
                q.resolve();
            }
        }

        for (var i = 0, l = stringreplacementconfig.length; i < l; i++) {
            performStringReplacements(stringreplacementconfig[i], options, config, done);
        }

        return q.promise;

    };


//PRODUCE THEME+CONFIG.JSON
    var configThemeJSON = function(options, config) {
        var q = Q.defer();
        console.log(chalk.white("" + options.courseOptions.course + " - Merging Theme JSON..."));
        var themeJsonFile = '';

        var themeBasePath = path.join(process.cwd(), config.buildGlobs.srcPath, stringReplace(options.themejsonconfig.themeBasePath, options.courseOptions));
        // As any theme folder may be used, we need to first find the location of the
        // theme.json file
        walkSync( themeBasePath, function (subdirs) {
            if (subdirs.length > 1) throw "More than one theme installed";
            if (subdirs.length === 0) throw "No theme installed";

            var themeJsonFile = path.join(themeBasePath, subdirs[0], "theme.json") 

            if (!fs.existsSync(themeJsonFile)) {
                throw "Unable to locate theme.json, please ensure a valid theme exists";
            }

            var courseBasePath = path.join(process.cwd(), config.buildGlobs.srcPath, stringReplace(options.themejsonconfig.courseBasePath, options.courseOptions));

            var configJson = JSON.parse(fs.readFileSync( path.join(courseBasePath, "config.json")) );
            var themeJson = JSON.parse(fs.readFileSync( themeJsonFile ));

            // This effectively combines the JSON   
            for (var prop in themeJson) {           
                configJson[prop] = themeJson[prop];
            }

            var outputConfigPath = path.join(process.cwd(), stringReplace(options.themejsonconfig.outputConfigPath, options.courseOptions), "config.json");
            fs.writeFile( outputConfigPath, JSON.stringify(configJson, null, "\t"), function() {
                q.resolve();    
            });
        });

        //console.log(chalk.white("" + options.courseOptions.course + " - Finished Theme JSON."));
        return q.promise;
    };



//ERROR OUTPUT
    var displayError = function(error, from) {
        console.log(chalk.bgRed("ERROR in " + from + ":"));
        console.log(chalk.bgRed(error.toString()));
        this.emit('end');
    };


//TASK RUNNER
    var build = function(options) {

        if (!Q) Q = require('q');

        var buildCourseModule = function(options, i, config) {
            var courseOptions = _.extend({}, options.courseOptions.options[i]);
            var inst = _.extend({}, options, { courseOptions: courseOptions });
            return buildCourse(inst, config);
        };

        var buildCourse = function(options, config) {
            var queue = [];

            if (options['tracking-command']) {
                tracking(options, config);
            }

            if (options.jsoncheck) {
                checkJson(options, config);
            }

            if (options.bundles && options.javascript) {
                queue.push(buildBundles(options, config));
            }

            if (options.bundles && options.handlebars) {
                queue.push(buildHandlebars(options, config));
            }
            if (options.bundles && options.less) {
                queue.push(buildLESS(options, config));
            }

            if (options.files ) {
                var fqueue = buildFiles(options, config);
                
                if (options.themejson) {
                    fqueue = fqueue.then(function() {
                        return configThemeJSON(options, config);
                    });
                }

                if (options.filecheck) {
                    fqueue = fqueue.then(function() {
                        return fileCheck( options, config );
                    });
                }

                if (options.assetcheck) {
                    fqueue = fqueue.then(function() {
                        return checkAssets( options, config );
                    });
                }

                if (options.stringreplacement) {
                    fqueue = fqueue.then(function() {
                        return stringReplacement( options, config );
                    });
                }

                queue.push(fqueue);
            } else {
                var fqueue;
                if (options.filecheck) {
                    fqueue = fileCheck( options, config );
                }
                if (options.assetcheck) {
                    if (fqueue) fqueue = fqueue.then(function() {
                            return checkAssets( options, config );
                        });
                    else fqueue = checkAssets( options, config );
                }
                if (options.stringreplacement) {
                    if (fqueue) fqueue = fqueue.then(function() {
                            return stringReplacement( options, config );
                        });
                    else fqueue = stringReplacement( options, config );
                }

                if (fqueue) queue.push(fqueue);
            }

            queue = Q.all(queue);

            if (options.core && options.javascript && options.production) {
                queue = queue.then(function() {
                    return buildLoader(options, config);
                });
            }

            return queue
        }

        var queue = [];
        if (options.core && options.javascript) {
            queue.push(buildCore(options, config));
        }

        if (options.core && options.javascript && !options.production) {
            queue.push(buildLoader(options, config));
        }

        if (options.courseOptions.manyCourses) {
            for (var i = 0, l = options.courseOptions.options.length; i < l; i++) {
                queue.push(buildCourseModule(options, i, config));
            }
        } else {
            queue.push(buildCourse(options, config));
        }

        queue = Q.all(queue);

        return queue;
    };


//SERVER TASKS
    gulp.task("server", ['dev-watch'], function() {
        var browserSync = require('browser-sync'),
            serveIndex = require('serve-index');

        reloadClient = browserSync.reload;

        var index = serveIndex("build", {'icons': true})
        isReloadClient = true;
        var srv = browserSync({
            server: {
                baseDir: "build",
                middleware: function (req, res, next) {
                    if (req.url == "/") index(req, res, next);
                    else next();
                }
            },
            notify: true,
            ghostMode: {
                clicks: true,
                location: true,
                forms: true,
                scroll: true
            }
        });
    });

    gulp.task("server-fast", ['fast-watch'], function() {
        var browserSync = require('browser-sync'),
            serveIndex = require('serve-index');

        reloadClient = browserSync.reload;

        var index = serveIndex("build", {'icons': true})
        isReloadClient = true;
        var srv = browserSync({
            server: {
                baseDir: "build",
                middleware: function (req, res, next) {
                    if (req.url == "/") index(req, res, next);
                    else next();
                }
            },
            notify: true,
            ghostMode: {
                clicks: true,
                location: true,
                forms: true,
                scroll: true
            }
        });
    });

//GULP UPDATE
    gulp.task("update", function() {
        if (!download) download = require("gulp-download");
        if (!unzip) unzip = require("gulp-unzip");
        if (!minimatch) minimatch = require('minimatch');
        if (!tap) tap = require('gulp-tap');
        if (!npm) npm = require('npm');
        if (!Q) Q = require('q');
        if (!fs) fs = require('fs');

        var q = Q.defer();

        var file = "https://github.com/oliverfoster/adapt_framework_gulp/archive/master.zip";
        download(file)
            .pipe(unzip({
              filter : function(entry){
                return !minimatch(entry.path, "**/README.md");
              }
            }))
            .pipe(tap(function(file) {
                file.path = file.path.substr(file.path.indexOf("/")+1);
                console.log("Updating: ", file.path);
            }))
            .pipe(gulp.dest("."))
            .on("end", function() {
                console.log("Running npm install...")
                var npm = require("npm");
                npm.load(function (err) {
                  // catch errors
                  npm.commands.install(function (er, data) {
                    
                    var pJSON = JSON.parse(fs.readFileSync("package.json"));
                    console.log("Version " + pJSON.version + " installed.");

                    q.resolve();
                  });
                  npm.on("log", function (message) {
                    // log the progress of the installation
                    console.log(message);
                  });
                });
            });

        return q.promise;

    });


//GULP WATCHES
    var createWatcher = function(type) {
        var watcher = function() {
            if (!path) path = require("path");
            if (!gulpif) gulpif = require("gulp-if");
            if (!gwatch) gwatch = gulp.watch;

            var buildGlobs = config.buildGlobs;
            var configGulp = { base: config.buildGlobs.srcPath, cwd: config.buildGlobs.srcPath};

            var watchers = [];

            var bundlesJavascript = buildGlobs.javascript.bundles.watchPaths;
            bundlesJavascript = expandAllCourses(bundlesJavascript);
            watchers.push(gwatch( bundlesJavascript, configGulp, function() {
                gulp.start([type+'-bundles-javascript'], function() {
                    console.log("Waiting for changes...");
                    if(isReloadClient) reloadClient();
                });
            }));


            var bundlesLess = buildGlobs.less.watchPaths;
            bundlesLess = expandAllCourses(bundlesLess);
            watchers.push(gwatch( bundlesLess, configGulp, function() {
                gulp.start([type+'-less'], function() {
                    console.log("Waiting for changes...");
                    if(isReloadClient) {
                        var dest = expandAllCourses([buildGlobs.less.destPath]);
                        for (var i = 0, l = dest.length; i < l; i++){
                            gulp.src( path.join(dest[i], buildGlobs.less.destFilename) )
                                .pipe(gulpif(isReloadClient, reloadClient({stream:true})))
                        }
                    }
                });
            }));

            var bundlesHandlebars = [].concat(buildGlobs.javascript.templates.watchPaths).concat(buildGlobs.javascript.partials.watchPaths);
            bundlesHandlebars = expandAllCourses(bundlesHandlebars);
            watchers.push(gwatch( bundlesHandlebars, configGulp, function() {
                gulp.start([type+'-handlebars'], function() {
                    console.log("Waiting for changes...");
                    if(isReloadClient) reloadClient();
                });
            }));

            var bundlesFiles = [];
            for (var itemName in buildGlobs.files) {
                bundlesFiles = bundlesFiles.concat(buildGlobs.files[itemName].watchPaths);
            }
            bundlesFiles = expandAllCourses(bundlesFiles);
            watchers.push(gwatch( bundlesFiles, configGulp, function() {
                gulp.start(['files'], function() {
                    console.log("Waiting for changes...");
                    if(isReloadClient) reloadClient();
                });
            }));

            var coreGlob = buildGlobs.javascript.core.watchPaths;
            coreGlob = expandAllCourses(coreGlob);
            watchers.push(gwatch( coreGlob, configGulp, function() {
                gulp.start([type+'-core'], function() {
                    console.log("Waiting for changes...");
                    if(isReloadClient) reloadClient();
                });
            }));

            _.defer(function() {
                console.log("Awaiting changes...");
            });

        };
        return watcher;
    };

    gulp.task('fast-watch', ['fast'], createWatcher('fast'));
    gulp.task('dev-watch', ['dev'], createWatcher('dev'));
    gulp.task('verbose-watch', ['verbose'], createWatcher('verbose'));


//INITIALIZATION
    var courseOptions, coursesConfig;
    var scriptInitialize = function() {   

        var processCommandLineArguments = function(argv) {
            if (!path) path = require("path");
            if (!fs) fs = require('fs');

            var processSingleCourseMode = function() {
                console.log("Single Course Mode.");
                if (argv.m !== undefined) throw "Single Course Mode: Cannot specify modules!";

                courseOptions.courseDestPath = "";
                courseOptions.courseSrcPath = "course";
                courseOptions.course = "course";
                courseOptions.menu = "*";
                courseOptions.theme = "*";
            };

            var processMultipleCourseMode = function() {
                console.log("Multiple Course Mode.");
                if (fs.exists("coursesconfig.json")) {
                    coursesConfig = JSON.parse(fs.readFileSync("grunt_config.json"));
                } else {
                    coursesConfig = {
                        "defaults": {
                          "theme": "*",
                          "menu": "*"
                        }
                    };
                }

                courseOptions.courseOrNullString = "";
                if (argv.modules) {
                    var courses;
                    walkSync("src/courses", function(dirs) {
                        courses = dirs;
                    });
                    courseOptions.courses = _.intersection(courses, argv.modules.split(","));
                    
                } else if (argv.m) {

                    var courses;
                    walkSync("src/courses", function(dirs) {
                        courses = dirs;
                    });
                    courseOptions.courses = _.intersection(courses, argv.m.split(","));
                } else {
                    walkSync("src/courses", function(dirs) {
                        courseOptions.courses = dirs;
                    });
                }
                
                courseOptions.options = [];
                for (var i = 0, l = courseOptions.courses.length; i < l; i++) {
                    var courseName = courseOptions.courses[i];
                    courseOptions.options.push({
                        courseDestPath: courseName,
                        courseSrcPath: "courses/" + courseName,
                        course: courseName,
                        menu: "*",
                        theme: "*"
                    });
                }
            };

            courseOptions = {};
            if (fs.existsSync("src/course")) {
                courseOptions.manyCourses = false;
                processSingleCourseMode();

            } else if (fs.existsSync("src/courses")) {
                courseOptions.manyCourses = true;
                processMultipleCourseMode();

            } else {
                throw "No course folder found!";
            }

        };
        processCommandLineArguments( require('minimist')(process.argv.slice(2)) );
        
        var createTaskFromConfigFunction = function(taskName, task) {
            return function() {
                if (!checkUpdates.checked) checkUpdates(version);
                var options = _.extend(
                    {}, 
                    task, 
                    { courseOptions:courseOptions }, 
                    { jsonconfig: config.jsoncheck },
                    { themejsonconfig: config.themejson },
                    { trackingconfig: config.tracking },
                    { assetcheckconfig: config.assetcheck },
                    { stringreplacementconfig: config.stringreplacement }
                );
                return build(options, config);
            };
        };

        var tasks = config.tasks;
        for (var taskName in tasks) {
            var task = tasks[taskName];
            gulp.task(taskName, createTaskFromConfigFunction(taskName, task) );
        }

    };
    scriptInitialize();