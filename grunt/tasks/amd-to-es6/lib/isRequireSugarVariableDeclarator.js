'use strict'

module.exports = function (declaration) {
  return declaration.type === 'VariableDeclarator' &&
        declaration.init &&
        declaration.init.type === 'CallExpression' &&
        declaration.init.callee.type === 'Identifier' &&
        declaration.init.callee.name === 'require'
}
