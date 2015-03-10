Multiple Course VS. Single Course Modes:

	Multiple Course Project (CGKineo):

		/src/courses/
			m01/
				config.json
				en/
			m02/
				config.json
				en/
			m03/
				config.json
				en/

	Single Course Project (Open Source):

		/src/course/
			config.json
			en/



Terminal Commands:
  
	gulp [%command%] [-m|--modules=][%courses%]  
  
  	%command%:  
  		files 			= assets, JSON and fonts  
  		dev 			= files + handlebars, less, javascript + sourcemaps  
  		fast 			= dev - sourcemaps
  		dev-watch 		= dev + watch  
  		fast-watch		= dev - sourcemaps + watch
  		prodution 		= dev - sourcemaps + minification  
  		server 			= dev-watch + live-reload  
  
  	%courses%: list of courses  
  
  		name1[,name2[,name3]]  



Example Commands:

	ALL COURSES:

		gulp dev
			-Source Mapping etc

		gulp production
			-Minified, no sourcemaps

		gulp server
			-Gulp dev + watch + live-reload



	MULTIPLE COURSES

		gulp dev -mp101,m005,m010

		gulp dev-watch -mp101,m005,m010

		gulp production -mp101,m005,m010

		gulp server -mp101,m005,m010



	SINGLE COURSE

		gulp dev-watch -mp101

		gulp dev -mp101

		gulp production -mp101

		gulp server -mp101



One time install:

	1. Run 'npm install -g gulp' to install gulp
	2. Run 'npm install' to get gulp modules



Patch for older projects to use new build process:

	Run 'gulp patch gulp-core-libraries-1' (update handlebars & underscore and add jquery.a11y)
	Run 'gulp patch restore-backbonemodel-1' (restore deleted backboneModel.js)


Update gulp:

	Run 'gulp update'



Mac OSX:

	Use 'gulp [command] [--modules=name]'

	This syntax needs fixing on mac: 'gulp [command] [-mname]'	


Note:

	Build folder is 'build' not 'builds' to keep gulp and grunt separate.


