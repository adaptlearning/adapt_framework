oliver.foster@kineo.com

this module parses javascript into ast and performs define/require/return to import/export
i needed access to the Module class to be able to rebind the ES6 modules to amd on the client-side
looking to turn this into a babel transform plugin to minimize parsing time

source: https://github.com/buxlabs/amd-to-es6

dependencies: 
 abstract-syntax-tree
