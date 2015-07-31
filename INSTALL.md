## Introduction  
* The framework may be installed manually, or it may be installed with assistance from the Adapt-CLI. The CLI downloads and installs the latest public release of the Adapt framework obtained from adaptlearning/adapt_framework. If you are installing code obtained from a different repository, install it manually.  
* Installing the Adapt framework also installs within it a sample e-learning course.  

##To Install Manually  

###1. Install Prerequisites

Install the following before proceeding:
* [Git](http://git-scm.com/downloads)
* [Node](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
* [Adapt-CLI](https://github.com/adaptlearning/adapt-cli) 

> **Tips:**   
> + Windows users should run these commands in Git Bash if Git was installed using default settings.
> + Mac and Linux users may need to prefix the commands with `sudo` or give yourself elevated permissions on the */usr/local directory* as documented [here](http://foohack.com/2010/08/intro-to-npm/#what_no_sudo).

###2. Download the Framework.

Download the Adapt framework as a ZIP and extract the files. (If you are a Windows user, you may need to [unblock the ZIP archive][1] before you extract it.  
[1]: http://answers.microsoft.com/en-us/windows/forum/windows_7-security/windows-found-that-this-file-is-potentially/cab2b576-2074-4b26-bf54-571fe03f9ef8

Open a console interface (e.g. Git Bash, Terminal on OSX, Powershell or CMD.exe) and navigate to the extracted folder (typically adapt_framework-master, but you can safely rename this). 

###3. Install Module Dependencies.  

From within the extracted folder, run the following command.     
`npm install`  

This will install all of the package dependencies of the framework. If this command completes successfully, run the following command.  
`adapt install`  

This will download all of the Adapt plug-ins to the correct locations in the framework.

###4. Run the Application 

Build the included sample course by running the following command:  
`grunt build`  

Start a server by running the following command:   
`grunt server`  

To view the course, open a browser to the following URL:
[http://localhost:9001/](http://localhost:9001/)   
To terminate the server, press ctrl+C .  

##To Install with Adapt-CLI  

###1. Install Prerequisites  

Install the following before proceeding:
* [Git](http://git-scm.com/downloads)
* [Node](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
* [Adapt-CLI](https://github.com/adaptlearning/adapt-cli) 

> **Tips:**   
> + Windows users should run these commands in Git Bash if Git was installed using default settings.
> + Mac and Linux users may need to prefix the commands with `sudo` or give yourself elevated permissions on the */usr/local directory* as documented [here](http://foohack.com/2010/08/intro-to-npm/#what_no_sudo).

###2. Download and Install the Framework  

Open a console interface (e.g. Git Bash, Terminal on OSX, Powershell or CMD.exe) and navigate to the folder where you'd like to install the framework. The CLI will create a root folder using the name you supply as the course name. Run the following command substituting your course name for "My Course Name".  
`adapt create course "My Course Name"`

To create an Adapt course from a specific branch, run:
`adapt create course "My Course Name" develop`

This will open a dialogue. Pressing `enter` or `return` will accept the default displayed. Package dependencies and core plug-ins will be installed.

###3. Run the Application 

Navigate the terminal into the newly created course folder. Build the included sample course by running the following command:  
`grunt build`  

Start a server by running the following command:   
`grunt server`  

To view the course, open a browser to the following URL:
[http://localhost:9001/](http://localhost:9001/)   
To terminate the server, press ctrl+C .  

##Troubleshooting  
Consult the Adapt community's [Technical Discussion Forum] (https://community.adaptlearning.org/mod/forum/view.php?id=4).  