The Adapt framework uses [Grunt](http://gruntjs.com/), a JavaScript  task runner, to automate many development and deployment tasks.  

All Adapt grunt commands are run from the root directory of the Adapt course where *Gruntfile.js* is located. 

**help**  
`grunt help`  
Lists out all available tasks along with descriptions. Useful to quickly look up what's available without having to leave the command line. <br/>_**Note**: Simply running `grunt` will have the same effect._ 

**build**  
`grunt build [--languages=xx,yy]`  
Compiles all files in `src` to create a production-ready minified/compressed version of your course. Includes a variety of error-checking tasks. Add the "languages" flag to limit which language/s should be built, e.g, `grunt build --languages="de,fr"`.  

**dev**  
`grunt dev`  
The same as `build`, with a few notable *developer-friendly* differences:  
-Includes [source maps](http://blog.teamtreehouse.com/introduction-source-maps) for both JavaScript and Less.  
-Runs the `watch` task, which monitors the source code for any file changes and updates the build when changes occur.  

**check-json**    
`grunt check-json`  
Validates the course JSON, checks for duplicate IDs, and checks that each element has a parent.  
_**Note**: This task is included in the `build` and `dev` tasks, so there is usually no need to run it manually._ 


**tracking-insert**  
`grunt tracking-insert`  
Adds missing tracking IDs to the *blocks.json* file. Run `tracking-reset` if sequential numbering is desirable.  
_**Note**: this task runs during the `build` and `dev` tasks, so there is usually no need to run it manually._ 

**tracking-remove**  
`grunt tracking-remove`  
Removes all tracking IDs from the *blocks.json* file.  
_**Note**: Unused tracking IDs rarely have a detrimental effect._

**tracking-reset**  
`grunt tracking-reset`  
Resets all tracking IDs in the *blocks.json* file starting sequentially from 0.  

**server**  
`grunt server`  
Runs a local server on your machine and opens a browser window ready for you to test your course locally. Check the output for the URL.  

**`server-scorm`**  
`grunt server-scorm`  
Same as above, but provides a dummy SCORM interface to allow you to test the tracking of your course.  

**`translate:export`**  
`grunt translate:export [--masterLang=xx] [--format=json|raw|csv] [--csvDelimiter=y]`  
Exports translatable text from the master course.  
`--masterLang` Specifies which language folder to export. Can take any value that matches the name of an existing */src/course/* subfolder. Defaults to `en`.  
`--format` Specifies the output file format. Acceptable values are `json`, `raw`, and `csv`. Defaults to `json`.  
`--csvDelimiter` Specifies the character used to separate fields in a CSV file. Defaults to `,`.  

**translate:import**  
`grunt translate:import --targetLang=xx [--masterLang=yy] [--format=json\|raw\|csv] [--csvDelimiter=z] [--replace]`  
Imports translated text files and creates a new language version of the course.  
`--targetLang` Specifies the name of the new language folder.  
`--masterLang` Specifies which language folder to use as the "template". Can take any value that matches the name of an existing */src/course/* subfolder. Defaults to `en`.  
`--format` Specifies the format of the files being imported. Defaults to `json`.  
`--csvDelimiter` Specifies the field delimiter used in CSV files being imported. Defaults to `,`.  
`--replace` Indicates that an existing folder named with the value of targetLang should be overwritten with the imported texts.
