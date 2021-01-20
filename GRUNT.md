The Adapt framework uses [Grunt](http://gruntjs.com/), a JavaScript  task runner, to automate many development and deployment tasks.  

All Adapt grunt commands are run from the root directory of the Adapt course where *Gruntfile.js* is located. 

**help**  
`grunt help`  
Lists out all available tasks along with descriptions. Useful to quickly look up what's available without having to leave the command line. <br/>_**Note**: Simply running `grunt` will have the same effect._ 

**build**  
`grunt build [--languages=xx,yy] [--menu=xx] [--theme=xx] [--sourcedir=xx] [--outputdir=xx] [--jsonext=xxx]`  
Compiles all files in `src` to create a production-ready minified/compressed version of your course. Includes a variety of error-checking tasks.  
`--languages` Specifies which language folder/s should be built. Can take any value that matches the name of an existing */src/course/* subfolder. Defaults to `en`.  
`--menu` If more than one menu is present in the */src/menu* folder, specifies the name of the menu to include in the build.  
`--theme` If more than one theme is present in the */src/theme* folder, specifies the name of the theme to include in the build.  
`--sourcedir` Specifies the absolute path to parent folder of the code to be processed. Defaults to the path to */src*.  
`--outputdir`  Specifies the absolute path to parent folder where the build will be written. Defaults to the path to */build*.  
`--jsonext` Specifies the file extension your JSON files use. Defaults to *json*. If the server your content is hosted on doesn't support the JSON mime-type you can use *txt* here to use the .txt file extension instead. You will need to manually amend the extension of all your JSON files to .txt initially.

**dev**  
`grunt dev [--languages=xx,yy] [--menu=xx] [--theme=xx] [--sourcedir=xx] [--outputdir=xx] [--jsonext=xxx]`   
The same as `build`, with a few notable *developer-friendly* differences:  
-Includes [source maps](http://blog.teamtreehouse.com/introduction-source-maps) for both JavaScript and Less.  
-Runs the `watch` task, which monitors the source code for any file changes and updates the build when changes occur.  

**compress**  
`grunt compress [--outputdir=xx]`  
Optimises the course's images for web delivery using [imagemin](https://www.npmjs.com/package/imagemin). Supported image types are JPEG, PNG & SVG. Operates on images found in */src/course* by default, use the `--outputdir` switch to change this e.g.:
```console
grunt compress --outputdir=build
```

**diff**  
`grunt diff [--languages=xx,yy] [--menu=xx] [--theme=xx] [--sourcedir=xx] [--outputdir=xx] [--jsonext=xxx]`   
Similar to `dev`, except that the `watch` task is not run and handlebars, JavaScript and Less files will only be recompiled if they have been changed - making this task very quick to run.

**check-json**    
`grunt check-json`  
Validates the course JSON, checks for duplicate IDs, and checks that each element has a parent.  
_**Note**: This task is included in the `build` and `dev` tasks, so there is usually no need to run it manually._ 

**tracking-insert**  
`grunt tracking-insert`  
Adds missing tracking IDs to the *blocks.json* file. Run `tracking-reset` if sequential numbering is desirable.  
_**Note**: This task runs during the `build` and `dev` tasks, so there is usually no need to run it manually._ 

**tracking-remove**  
`grunt tracking-remove`  
Removes all tracking IDs from the *blocks.json* file.  
_**Note**: Unused tracking IDs rarely have a detrimental effect._

**tracking-reset**  
`grunt tracking-reset`  
Resets all tracking IDs in the *blocks.json* file starting sequentially from 0.  

**server**  
`grunt server [--host=x.x.x.x] [--port=xxxx]`  
Runs a local server on your machine and opens a browser window ready for you to test your course locally. Check the output for the URL.  
`--host` Specifies the host. Defaults to `"localhost"`.  
`--port` Specifies the port. Defaults to `9001`.

**`server-scorm`**  
`grunt server-scorm [--host=x.x.x.x] [--port=xxxx]`  
Same as above, but provides a dummy SCORM interface to allow you to test the tracking of your course.  

**`translate:export`**  
`grunt translate:export [--masterLang=xx] [--format=json|raw|csv] [--csvDelimiter=y]`  
Exports translatable text from the master course.  
`--masterLang` Specifies which language folder to export. Can take any value that matches the name of an existing */src/course/* subfolder. Defaults to `en`.  
`--format` Specifies the output file format. Acceptable values are `json`, `raw`, and `csv`. Defaults to `csv`.  
`--csvDelimiter` Specifies the character used to separate fields in a CSV file. Defaults to `,`.  

**translate:import**  
`grunt translate:import --targetLang=xx [--masterLang=yy] [--format=json|raw|csv] [--csvDelimiter=z] [--replace]`  
Imports translated text files and creates a new language version of the course.  
`--targetLang` Specifies the name of the new language folder.  
`--masterLang` Specifies which language folder to use as the "template". Can take any value that matches the name of an existing */src/course/* subfolder. Defaults to `en`.  
`--format` Specifies the format of the files being imported. Defaults to `csv`.  
`--csvDelimiter` Specifies the field delimiter used in CSV files being imported. Defaults to `,`.  
`--replace` Indicates that an existing folder named with the value of `targetLang` should be overwritten with the imported texts.  

**Additional Build Notes**  
By default, all installed plug-ins are included in the build process. Sometimes the developer may install plug-ins that are used only during development or that are not yet being used by the content. Doing so bloats the build needlessly. This can be avoided by adding a `build` object to *course/config.json*. It allows the developer to specify explicitly which plug-ins will be included in the build or excluded from the build. The `build` object contains values for one of two arrays: `excludes` or `includes`.  
Example:
```json
"build": {
    "excludes": [
        "adapt-inspector",
        "adapt-contrib-assessmentResultsTotal"
    ]
}
```
