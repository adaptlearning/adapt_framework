# How to contribute

We heartily welcome contributions to the source code for the Adapt Framework
project. This document outlines some contributor guidlines to help you get
started.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Pick an open issue from the list [here](https://github.com/adaptlearning/adapt_framework/issues) OR
* Submit a ticket for an issue you have noticed
  * If submitting a bug, clearly describe the issue including steps to 
    reproduce and add the "bug" label
  * If submitting a request for a new feature, add the "enhancement" 
    label
* Fork the repository on [GitHub](https://github.com/adaptlearning/adapt_framework)
* Follow the developer set-up guide [here](https://github.com/adaptlearning/adapt_framework/wiki/Setting-up-your-development-environment)

We try to add one of the following labels to all our issues to indicate difficulty:

* Easy
* Medium
* Hard
* Insane

Picking up an "Easy" issue is a good way to start contributing if you have
not worked on a nodejs or backbone project before. Otherwise, you should have
no problems working on a "Medium" issue. "Hard" and "Insane" issues are
targeted at contributors that have had extensive experience of developing
for this project.

## Making Changes

* Create a new branch named for the issue that you are fixing, and base it on 
  the target branch (e.g. `git checkout -b issues/123 origin/develop`)
* Make your changes
* Add some tests if your changes warrant it
* Run all tests using `npm test`
* Commit your changes using [best practice](http://www.git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#Commit-Guidelines) in your commit message and take
  advantage of GitHub's built in features to [close issues via commits](https://help.github.com/articles/closing-issues-via-commit-messages/)

## Submitting Changes

* Push your changes to your fork of the adapt_framework repository
* Submit a pull request using the GitHub interface, and reference the issue 
  number
* The core team will be automatically notified of your changes, but you can 
  also bring it to our attention via the [gitter.im channel](https://gitter.im/adaptlearning/adapt_framework)

# Additional Resources

* [The Adapt Framework wiki](https://github.com/adaptlearning/adapt_framework/wiki)
* [Gitter channel](https://gitter.im/adaptlearning/adapt_framework)
* [General GitHub Documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)