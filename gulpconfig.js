//JAVASCRIPT ENVIRONMENT + BUILD VARIABLES
module.exports = {
    "tasks": {
        "assetcheck": {
            "assetcheck": true
        },
        "filecheck": {
            "filecheck": {
                "srcPaths": [
                    "build/{{courseDestPath}}/adapt/css/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/course/**/*.@(jpg|jpeg|png|ogv|mp4)",
                ],
                "options": {
                    "png": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "jpg": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "mp4": {
                        "size": 10240
                    },
                    "ogv": {
                        "size": 10240
                    }
                }
            },
            "assetcheck": true,
            "jsoncheck": true
        },
        "files": {
            "files": true,
            "filecheck": {
                "srcPaths": [
                    "build/{{courseDestPath}}/adapt/css/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/course/**/*.@(jpg|jpeg|png|ogv|mp4)",
                ],
                "options": {
                    "png": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "jpg": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "mp4": {
                        "size": 10240
                    },
                    "ogv": {
                        "size": 10240
                    }
                }
            },
            "stringreplacement": true,
            "jsoncheck": true,
            "assetcheck": true,
            "themejson": true
        },
        "fast-less": {
            "sourcemap": false,
            "uglify": false,
            "bundles": true,
            "less": true
        },
        "fast-handlebars": {
            "sourcemap": false,
            "uglify": false,
            "bundles": true,
            "handlebars": true
        },
        "fast-bundles-javascript": {
            "sourcemap": false,
            "uglify": false,
            "bundles": true,
            "javascript": true
        },
        "fast-core": {
            "sourcemap": false,
            "uglify": false,
            "core": true,
            "javascript": true
        },
        "fast-bundles-nofiles": {
            "sourcemap": false,
            "uglify": false,
            "bundles": true,
            "less": true,
            "handlebars": true,
            "javascript": true
        },
        "fast-bundles": {
            "sourcemap": false,
            "uglify": false,
            "bundles": true,
            "files": true,
            "less": true,
            "handlebars": true,
            "javascript": true
        },
        "fast": {
            "sourcemap": false,
            "uglify": false,
            "core": true,
            "bundles": true,
            "files": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "stringreplacement": true
        },
        "dev-less": {
            "sourcemap": true,
            "uglify": false,
            "bundles": true,
            "less": true
        },
        "dev-handlebars": {
            "sourcemap": true,
            "uglify": false,
            "bundles": true,
            "handlebars": true,
        },
        "dev-bundles-javascript": {
            "sourcemap": true,
            "uglify": false,
            "bundles": true,
            "javascript": true
        },
        "dev-core": {
            "sourcemap": true,
            "uglify": false,
            "core": true,
            "bundles": false,
            "javascript": true
        },
        "dev-bundles-nofiles": {
            "sourcemap": true,
            "uglify": false,
            "bundles": true,
            "less": true,
            "handlebars": true,
            "javascript": true
        },
        "dev-bundles": {
            "sourcemap": true,
            "uglify": false,
            "core": false,
            "bundles": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "files": true,
            "jsoncheck": true
        },
        "dev": {
            "sourcemap": true,
            "uglify": false,
            "core": true,
            "bundles": true,
            "filecheck": {
                "srcPaths": [
                    "build/{{courseDestPath}}/adapt/css/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/assets/**/*.@(jpg|jpeg|png|ogv|mp4)",
                    "build/{{courseDestPath}}/course/**/*.@(jpg|jpeg|png|ogv|mp4)",
                ],
                "options": {
                    "png": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "jpg": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "mp4": {
                        "size": 10240
                    },
                    "ogv": {
                        "size": 10240
                    }
                }
            },
            "less": true,
            "handlebars": true,
            "javascript": true,
            "files": true,
            "jsoncheck": true,
            "assetcheck": true,
            "stringreplacement": true
        },
         "verbose-less": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "bundles": true,
            "less": true
        },
        "verbose-handlebars": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "bundles": true,
            "handlebars": true,
        },
        "verbose-bundles-javascript": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "bundles": true,
            "javascript": true
        },
        "verbose-core": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "core": true,
            "bundles": false,
            "javascript": true
        },
        "verbose-bundles-nofiles": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "bundles": true,
            "less": true,
            "handlebars": true,
            "javascript": true
        },
        "verbose-bundles": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "core": false,
            "bundles": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "files": true,
            "jsoncheck": true
        },
        "verbose": {
            "sourcemap": true,
            "uglify": false,
            "lint": true,
            "core": true,
            "bundles": true,
            "filecheck": {
                "srcPaths": [
                    "build/{{courseDestPath}}/adapt/css/assets",
                    "build/{{courseDestPath}}/assets",
                    "build/{{courseDestPath}}/course",
                ],
                "options": {
                    "png": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "jpg": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "mp4": {
                        "size": 10240
                    },
                    "ogv": {
                        "size": 10240
                    }
                }
            },
            "less": true,
            "handlebars": true,
            "javascript": true,
            "files": true,
            "jsoncheck": true,
            "stringreplacement": true
        },
        "build-core": {
            "sourcemap": false,
            "uglify": true,
            "core": true,
            "bundles": false,
            "javascript": true
        },
        "build-bundles": {
            "sourcemap": false,
            "uglify": true,
            "core": false,
            "bundles": true,
            "files": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "jsoncheck": false
        },
        "build": {
            "sourcemap": false,
            "uglify": true,
            "core": true,
            "bundles": true,
            "files": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "jsoncheck": false,
            "filecheck": {
                "srcPaths": [
                    "build/{{courseDestPath}}/adapt/css/assets/**/*(.jpg|.jpeg|.png|.ogv|.mp4)",
                    "build/{{courseDestPath}}/assets/**/*(.jpg|.jpeg|.png|.ogv|.mp4)",
                    "build/{{courseDestPath}}/course/**/*(.jpg|.jpeg|.png|.ogv|.mp4)",
                ],
                "options": {
                    "png": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "jpg": {
                        "size": 500,
                        "width": 1440,
                        "height": 1025
                    },
                    "mp4": {
                        "size": 10240
                    },
                    "ogv": {
                        "size": 10240
                    }
                }
            },
            "stringreplacement": true
        },
        "production": {
            "sourcemap": false,
            "uglify": true,
            "core": true,
            "bundles": true,
            "files": true,
            "less": true,
            "handlebars": true,
            "javascript": true,
            "production": true,
            "jsoncheck": true,
            "tracking-command": "reset",
            "stringreplacement": true
        },
        "tracking-insert": {
            "tracking-command": "insert"
        },
        "tracking-remove": {
            "tracking-command": "remove"
        },
        "tracking-reset": {
            "tracking-command": "reset"
        },
        "jsoncheck": {
            "jsoncheck": true
        }
    },
    "coreRequires": [
        "coreJS/accessibility",
        "coreJS/adapt",
        "coreJS/adaptCollection",
        "coreJS/device",
        "coreJS/drawer",
        "coreHelpers", //must be referenced as such to keep reference uniformity
        "coreJS/notify",
        "coreJS/popupManager",
        "coreJS/router",
        "coreModels/adaptModel",
        "coreModels/articleModel",
        "coreModels/backboneModel",
        "coreModels/blockModel",
        "coreModels/componentModel",
        "coreModels/configModel",
        "coreModels/contentObjectModel",
        "coreModels/courseModel",
        "coreModels/notifyModel",
        "coreModels/routerModel",
        "coreViews/accessibilityView",
        "coreViews/adaptView",
        "coreViews/articleView",
        "coreViews/buttonsView",
        "coreViews/componentView",
        "coreViews/drawerView",
        "coreViews/menuView",
        "coreViews/navigationView",
        "coreViews/notifyPushView",
        "coreViews/notifyView",
        "coreViews/pageView",
        "coreViews/questionView",
        "a11y",
        "backbone",
        "coreJS/libraries/bowser",  //must be referenced as such to keep reference uniformity
        "handlebars",
        "imageReady",
        "inview",
        "jquery",
        "modernizr",
        "scrollTo",
        "underscore",
        "velocity"
    ],
    "corePaths": {
        "a11y": "core/js/libraries/jquery.a11y",
        "backbone": "core/js/libraries/backbone",
        "core": "core/js/build/core",
        "handlebars": "core/js/libraries/handlebars",
        "imageReady": "core/js/libraries/imageReady",
        "inview": "core/js/libraries/inview",
        "jquery": "core/js/libraries/jquery",
        "modernizr": "core/js/libraries/modernizr",
        "scrollTo": "core/js/libraries/scrollTo",
        "underscore": "core/js/libraries/underscore",
        "velocity": "core/js/libraries/velocity",
        "coreJS": "core/js",
        "coreViews": "core/js/views",
        "coreModels": "core/js/models",
        "coreCollections": "core/js/collections",
        "coreHelpers": "core/js/helpers"
    },
    "coreMap": {
        "*": {
            "coreModels/backboneModel": "core/js/models/backboneModel",
            "coreModels/contentObjectModel": "core/js/models/contentObjectModel",
            "coreModels/routerModel": "core/js/models/routerModel",
            "coreModels/notifyModel": "core/js/models/notifyModel",
            "coreModels/adaptModel": "core/js/models/adaptModel",
            "coreModels/courseModel": "core/js/models/courseModel",
            "coreModels/configModel": "core/js/models/configModel",
            "coreModels/articleModel": "core/js/models/articleModel",
            "coreModels/blockModel": "core/js/models/blockModel",
            "coreModels/componentModel": "core/js/models/componentModel",
            "coreViews/accessibilityView": "core/js/views/accessibilityView",
            "coreViews/buttonsView": "core/js/views/buttonsView",
            "coreViews/drawerView": "core/js/views/drawerView",
            "coreViews/menuView": "core/js/views/menuView",
            "coreViews/questionView": "core/js/views/questionView",
            "coreViews/componentView": "core/js/views/componentView",
            "coreViews/adaptView": "core/js/views/adaptView",
            "coreViews/blockView": "core/js/views/blockView",
            "coreViews/articleView": "core/js/views/articleView",
            "coreViews/pageView": "core/js/views/pageView",
            "coreViews/notifyView": "core/js/views/notifyView",
            "coreViews/navigationView": "core/js/views/navigationView",
            "coreViews/notifyPushView": "core/js/views/notifyPushView",
            "coreJS/adapt": "core/js/adapt",
            "coreJS/accessibility": "core/js/accessibility",
            "coreJS/device": "core/js/device",
            "coreJS/drawer": "core/js/drawer",
            "coreJS/router": "core/js/router",
            "coreJS/adaptCollection": "core/js/adaptCollection",
            "coreJS/notify": "core/js/notify",
            "coreJS/popupManager": "core/js/popupManager",
            "coreJS/libraries/bowser": "core/js/libraries/bowser"
        }
    },
    "coreShim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "imageReady": {
            "deps": [
                "jquery"
            ]
        },
        "inview": {
            "deps": [
                "jquery"
            ]
        },
        "a11y": {
            "deps": [
                "jquery"
            ]
        }
    },
    "buildGlobs": {
        "srcPath": "src",
        "javascript": {
            "core": {
                "srcFilename": "core/js/build/core.js",
                "srcPaths": [ 
                    "core/js/**/*.js",
                    "core/js/*.js" 
                ],
                "watchPaths": [ 
                    "core/js/**/*.js",
                    "core/js/*.js" 
                ],
                "cleanPaths": [
                    "build/{{courseDestPath}}/adapt/js/core.js.map"
                ],
                "destPath": "build/{{courseDestPath}}/adapt/js/",
                "destFilename": "core.js"
            },
            "templates": {
                "srcFilename": "core/js/build/bundles.js",
                "srcPaths": [ 
                    "core/templates/*.hbs",
                    "components/*/templates/*.hbs",
                    "extensions/*/templates/*.hbs",
                    "menu/{{menu}}/templates/*.hbs",
                    "theme/{{theme}}/templates/*.hbs"
                ],
                "watchPaths": [ 
                    "core/templates/*.hbs",
                    "components/*/templates/*.hbs",
                    "extensions/*/templates/*.hbs",
                    "menu/{{menu}}/templates/*.hbs",
                    "theme/{{theme}}/templates/*.hbs"
                ],
                "cleanPaths": [
                    "build/{{courseDestPath}}/adapt/js/templates.js.map"
                ],
                "destPath": "build/{{courseDestPath}}/adapt/js/",
                "destFilename": "templates.js"
            },
            "partials": { 
                "srcFilename": "core/js/build/bundles.js",
                "srcPaths": [ 
                    "core/templates/partials/*.hbs",
                    "components/*/templates/partials/*.hbs",
                    "extensions/*/templates/partials/*.hbs",
                    "menu/{{menu}}/templates/partials/*.hbs",
                    "theme/{{theme}}/templates/partials/*.hbs"
                ],
                "watchPaths": [ 
                    "core/templates/partials/*.hbs",
                    "components/*/templates/partials/*.hbs",
                    "extensions/*/templates/partials/*.hbs",
                    "menu/{{menu}}/templates/partials/*.hbs",
                    "theme/{{theme}}/templates/partials/*.hbs"
                ],
                "cleanPaths": [
                    "build/{{courseDestPath}}/adapt/js/partials.js.map"
                ],
                "destPath": "build/{{courseDestPath}}/adapt/js/",
                "destFilename": "partials.js"
            },
            "bundles": {
                "srcFilename": "core/js/build/bundles.js",
                "srcPaths": [ 
                    "core/js/app.js"
                ],
                "srcPathMap": {
                    "null": "core/js/build/null",
                    "app": "core/js/app",
                    "templates": "core/js/build/null",
                },
                "watchPaths": [ 
                    "components/*/js/**/*.js",
                    "extensions/*/js/**/*.js",
                    "menu/{{menu}}/js/**/*.js",
                    "theme/{{theme}}/js/**/*.js"
                ],
                "cleanPaths": [
                    "build/{{courseDestPath}}/adapt/js/bundles.js.map"
                ],
                "destPath": "build/{{courseDestPath}}/adapt/js/",
                "destFilename": "bundles.js"
            }
        },
        "less": {
            "srcPaths": [ 
                "core/less/**/*.less",
                "components/*/less/**/*.less",
                "extensions/*/less/**/*.less",
                "menu/{{menu}}/less/**/*.less",
                "theme/{{theme}}/less/**/*.less"
            ],
            "watchPaths": [ 
                "core/less/**/*.less",
                "components/*/less/**/*.less",
                "extensions/*/less/**/*.less",
                "menu/{{menu}}/less/**/*.less",
                "theme/{{theme}}/less/**/*.less"
            ],
            "cleanPaths": [
                "build/{{courseDestPath}}/adapt/css/adapt.css.map"
            ],
            "destPath": "build/{{courseDestPath}}/adapt/css",
            "destFilename": "adapt.css"
        },
        "files": {
            "libraries": {
                "srcPaths": [
                    "core/js/libraries/consoles.js",
                    "core/js/libraries/json2.js",
                    "core/js/libraries/modernizr.js",
                    "core/js/libraries/require.js",
                    "core/js/libraries/swfObject.js"
                ],
                "watchPaths": [
                    "core/js/libraries/consoles.js",
                    "core/js/libraries/json2.js",
                    "core/js/libraries/modernizr.js",
                    "core/js/libraries/require.js",
                    "core/js/libraries/swfObject.js"
                ],
                "srcCollate": "libraries",
                "dest": "build/{{courseDestPath}}/libraries",
                "destPaths": [
                    "*.*"
                ]
            },
            "scriptLoader": {
                "srcPaths": [
                    "core/js/scriptLoader.js"
                ],
                "watchPaths": [
                    "core/js/scriptLoader.js"
                ],
                "srcCollate": "js",
                "dest": "build/{{courseDestPath}}/adapt/js",
                "destPaths": [
                    "scriptLoader.js"
                ]
            },
            "courseAssets": {
                "srcPaths": [
                    "{{courseSrcPath}}/**/*",
                    "!{{courseSrcPath}}/**/*.json"
                ],
                "watchPaths": [
                    "{{courseSrcPath}}/**/*",
                    "!{{courseSrcPath}}/**/*.json"
                ],
                "srcCollate": "{{course}}",
                "dest": "build/{{courseDestPath}}/course",
                "destPaths": [
                    "**/*",
                    "!**/*.json",
                    "!config.json"
                ]
            },
            "courseJSON": {
                "force": true,
                "srcPaths": [
                    "{{courseSrcPath}}/**/*.json"
                ],
                "watchPaths": [
                    "{{courseSrcPath}}/**/*.json"
                ],
                "srcCollate": "{{course}}",
                "dest": "build/{{courseDestPath}}/course",
                "destPaths": [
                    "**/*.json"
                ]
            },
            "themeAssets": {
                "srcPaths": [
                    "theme/{{theme}}/assets/**/*.*"
                ],
                "watchPaths": [
                    "theme/{{theme}}/assets/**/*.*"
                ],
                "srcCollate": "assets",
                "dest": "build/{{courseDestPath}}/adapt/css/assets",
                "destPaths": [
                    "**/*"
                ]
            },
            "themeFonts": {
                "srcPaths": [
                    "theme/{{theme}}/fonts/**/*.*"
                ],
                "watchPaths": [
                    "theme/{{theme}}/fonts/**/*.*"
                ],
                "srcCollate": "fonts",
                "dest": "build/{{courseDestPath}}/adapt/css/fonts",
                "destPaths": [
                    "**/*"
                ]
            },
            "required": {
                "srcPaths": [
                    "components/*/required/**/*.*",
                    "extensions/*/required/**/*.*",
                    "menu/{{menu}}/required/**/*",
                    "theme/{{theme}}/required/**/*"
                ],
                "watchPaths": [
                    "components/*/required/**/*.*",
                    "extensions/*/required/**/*.*",
                    "menu/{{menu}}/required/**/*",
                    "theme/{{theme}}/required/**/*"
                ],
                "srcCollate": "required",
                "dest": "build/{{courseDestPath}}",
                "destPaths": [
                    "**/*.*", 
                    "!adapt/**/*.*",
                    "!assets/**/*.*",
                    "!course/**/*.*",
                    "!libraries/**/*.*",
                    "!index.html"
                ]
            },
            "assets": {
                "srcPaths": [
                    "components/*/assets/**/*.*",
                    "extensions/*/assets/**/*.*",
                    "menu/{{menu}}/assets/**/*"
                ],
                "watchPaths": [
                    "components/*/assets/**/*.*",
                    "extensions/*/assets/**/*.*",
                    "menu/{{menu}}/assets/**/*"
                ],
                "srcCollate": "assets",
                "dest": "build/{{courseDestPath}}/assets",
                "destPaths": [
                    "**/*"
                ]
            },
            "indexHtml": {
                "srcPaths": [
                    "index.html"
                ],
                "watchPaths": [
                    "index.html"
                ],
                "srcCollate": "src",
                "dest": "build/{{courseDestPath}}",
                "destPaths": [
                    "index.html"
                ]
            }
        }
    },
    "buildConstructs": {
        "templates.js": 'define("templates", ["require", "handlebars"], function(require, Handlebars){\nthis.Handlebars = Handlebars;\n<%= contents %>\n});\n',
        "partials.js": 'define("partials", ["require", "handlebars"], function(require, Handlebars){\nthis.Handlebars = Handlebars;\n<%= contents %>\n});\n',
        "adapt.min.js": 'require(["core"], function() { \n\trequire(["templates", "partials"], function() {\n\t\t_.each(Handlebars.partial, function(item,k) { \n\t\t\tHandlebars.registerPartial(k, item); \n\t\t}); \n\t\trequire(["bundles"],function(){});\n\t});\n});\n',
        "null.js": "(function() {})();"
    },
    "lintingFilter": [
        "**/*", 
        "!core/js/libraries/**/*", 
        "!**/*.min.js"
    ],
    "tracking": {
        "courseBasePath": "{{courseSrcPath}}"
    },
    "assetcheck": {
        "missingImage": "data:image/svg+xml;utf8,<svg width=\\\"100%\\\" xmlns:dc=\\\"http://purl.org/dc/elements/1.1/\\\" xmlns:cc=\\\"http://creativecommons.org/ns#\\\" xmlns:rdf=\\\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\\\" xmlns:svg=\\\"http://www.w3.org/2000/svg\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" xmlns:xlink=\\\"http://www.w3.org/1999/xlink\\\" xmlns:sodipodi=\\\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\\\" xmlns:inkscape=\\\"http://www.inkscape.org/namespaces/inkscape\\\" version=\\\"1.1\\\" enable-background=\\\"new 0 0 16 16\\\" id=\\\"svg3678\\\" inkscape:version=\\\"0.47pre4 r22446\\\" sodipodi:docname=\\\"delete.svg\\\">  <metadata id=\\\"metadata3702\\\">    <rdf:RDF>      <cc:Work rdf:about=\\\"\\\">        <dc:format>image/svg+xml</dc:format>        <dc:type rdf:resource=\\\"http://purl.org/dc/dcmitype/StillImage\\\"/>        <dc:title/>      </cc:Work>    </rdf:RDF>  </metadata>  <rect x=\\\"0\\\" y=\\\"0\\\" width=\\\"100%\\\" height=\\\"100%\\\" fill=\\\"white\\\"/>  <text x=\\\"24\\\" y=\\\"14\\\" font-size=\\\"14px\\\" font-family=\\\"monospace\\\"><tspan x=\\\"0\\\" dy=\\\"1.2em\\\">Missing resource:</tspan><tspan x=\\\"0\\\" dy=\\\"1.2em\\\">{{resourceUri}}</tspan></text>  <defs id=\\\"defs3700\\\">    <inkscape:perspective sodipodi:type=\\\"inkscape:persp3d\\\" inkscape:vp_x=\\\"0 : 8 : 1\\\" inkscape:vp_y=\\\"0 : 1000 : 0\\\" inkscape:vp_z=\\\"16 : 8 : 1\\\" inkscape:persp3d-origin=\\\"8 : 5.3333333 : 1\\\" id=\\\"perspective3704\\\"/>    <inkscape:perspective id=\\\"perspective4278\\\" inkscape:persp3d-origin=\\\"0.5 : 0.33333333 : 1\\\" inkscape:vp_z=\\\"1 : 0.5 : 1\\\" inkscape:vp_y=\\\"0 : 1000 : 0\\\" inkscape:vp_x=\\\"0 : 0.5 : 1\\\" sodipodi:type=\\\"inkscape:persp3d\\\"/>    <inkscape:perspective id=\\\"perspective4349\\\" inkscape:persp3d-origin=\\\"0.5 : 0.33333333 : 1\\\" inkscape:vp_z=\\\"1 : 0.5 : 1\\\" inkscape:vp_y=\\\"0 : 1000 : 0\\\" inkscape:vp_x=\\\"0 : 0.5 : 1\\\" sodipodi:type=\\\"inkscape:persp3d\\\"/>    <inkscape:perspective id=\\\"perspective4394\\\" inkscape:persp3d-origin=\\\"0.5 : 0.33333333 : 1\\\" inkscape:vp_z=\\\"1 : 0.5 : 1\\\" inkscape:vp_y=\\\"0 : 1000 : 0\\\" inkscape:vp_x=\\\"0 : 0.5 : 1\\\" sodipodi:type=\\\"inkscape:persp3d\\\"/>    <inkscape:perspective id=\\\"perspective4230\\\" inkscape:persp3d-origin=\\\"0.5 : 0.33333333 : 1\\\" inkscape:vp_z=\\\"1 : 0.5 : 1\\\" inkscape:vp_y=\\\"0 : 1000 : 0\\\" inkscape:vp_x=\\\"0 : 0.5 : 1\\\" sodipodi:type=\\\"inkscape:persp3d\\\"/>    <linearGradient inkscape:collect=\\\"always\\\" xlink:href=\\\"#linearGradient4120\\\" id=\\\"linearGradient4138\\\" gradientUnits=\\\"userSpaceOnUse\\\" x1=\\\"570.01251\\\" y1=\\\"1174.8934\\\" x2=\\\"554.6095\\\" y2=\\\"1161.4905\\\" gradientTransform=\\\"matrix(1.0430378,0,0,1.0430378,-13.512043,-35.591919)\\\"/>    <linearGradient id=\\\"linearGradient4120\\\">      <stop style=\\\"stop-color:#c16803;stop-opacity:1;\\\" offset=\\\"0\\\" id=\\\"stop4122\\\"/>      <stop style=\\\"stop-color:#eec75d;stop-opacity:1;\\\" offset=\\\"1\\\" id=\\\"stop4124\\\"/>    </linearGradient>  </defs>  <sodipodi:namedview pagecolor=\\\"#ffffff\\\" bordercolor=\\\"#666666\\\" borderopacity=\\\"1\\\" objecttolerance=\\\"10\\\" gridtolerance=\\\"10\\\" guidetolerance=\\\"10\\\" inkscape:pageopacity=\\\"0\\\" inkscape:pageshadow=\\\"2\\\" inkscape:window-width=\\\"1680\\\" inkscape:window-height=\\\"1007\\\" id=\\\"namedview3698\\\" showgrid=\\\"false\\\" inkscape:zoom=\\\"5.2149125\\\" inkscape:cx=\\\"-39.851517\\\" inkscape:cy=\\\"-9.9191911\\\" inkscape:window-x=\\\"0\\\" inkscape:window-y=\\\"24\\\" inkscape:window-maximized=\\\"1\\\" inkscape:current-layer=\\\"svg3678\\\"/>  <linearGradient id=\\\"outer\\\" gradientUnits=\\\"userSpaceOnUse\\\" x1=\\\"2.2\\\" y1=\\\"2.2\\\" x2=\\\"12.8\\\" y2=\\\"12.8\\\">    <stop offset=\\\"0\\\" style=\\\"stop-color:#d86a69;stop-opacity:1;\\\" id=\\\"stop3681\\\"/>    <stop offset=\\\"1\\\" style=\\\"stop-color:#c14d33;stop-opacity:1;\\\" id=\\\"stop3683\\\"/>  </linearGradient>  <linearGradient id=\\\"inner\\\" gradientUnits=\\\"userSpaceOnUse\\\" x1=\\\"2.9\\\" y1=\\\"2.9\\\" x2=\\\"12.1\\\" y2=\\\"12.1\\\">    <stop offset=\\\"0\\\" style=\\\"stop-color:#d67e7d;stop-opacity:1;\\\" id=\\\"stop3688\\\"/>    <stop offset=\\\"1\\\" style=\\\"stop-color:#e9594d;stop-opacity:1;\\\" id=\\\"stop3690\\\"/>  </linearGradient>  <g transform=\\\"matrix(0.9336544,0,0,0.9336544,-526.98357,-1096.3978)\\\" id=\\\"g4144\\\">    <path sodipodi:nodetypes=\\\"cccc\\\" id=\\\"path4111\\\" d=\\\"m 572.99957,1176.6182 -7.30126,12.5165 14.60252,0 c 0,0 -7.30126,-12.5165 -7.30126,-12.5165 z\\\" style=\\\"fill:#f4d74e;fill-opacity:1;stroke:url(#linearGradient4138);stroke-width:1.46338189;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none\\\"/>    <path style=\\\"fill:#f4d74e;fill-opacity:1;stroke:#ffffff;stroke-width:1.17175627;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none\\\" d=\\\"m 572.99958,1178.3286 -5.84626,10.0221 11.69249,0 c 0,0 -5.84623,-10.0221 -5.84623,-10.0221 z\\\" id=\\\"path4140\\\" sodipodi:nodetypes=\\\"cccc\\\"/>    <path id=\\\"rect4104\\\" d=\\\"m 572.20153,1181.5289 0,3.7429 1.62217,0 0,-3.7429 -1.62217,0 z m -0.0261,4.7156 0,0.9725 1.62217,0 0,-0.9725 -1.62217,0 z\\\" style=\\\"fill:#d5a23e;fill-opacity:1;stroke:none\\\"/>  </g></svg>",
        "courseDestPath": "build/{{courseDestPath}}",
        "assetRegExp": "((\\\\\"|\"|'){1}([^\"']*(\\.png|\\.jpg|\\.jpeg|\\.mp4|\\.ogv|\\.mp3|\\.ogg|\\.pdf)+)(\\\\\"|\"|'){1})"
    },
    "jsoncheck": {
        "courseBasePath": "{{courseSrcPath}}",
        "idRegExp": "((co|b|a|c){1}\-{1}[0-9]{1,5}[a-zA-Z]{1})|((co|b|a|c){1}\-{1}[0-9]{1,5})"
    },
    "themejson": {
        "themeBasePath": "theme",
        "courseBasePath": "{{courseSrcPath}}",
        "outputConfigPath": "build/{{courseDestPath}}/course"
    },
    "stringreplacement": [
        {
            "context": "{{courseSrcPath}}/**/course.json",
            "src": "extensions/adapt-contrib-spoor/required/imsmanifest.xml",
            "collateTo": "required",
            "dest": "build/{{courseDestPath}}"
        }
    ],
};