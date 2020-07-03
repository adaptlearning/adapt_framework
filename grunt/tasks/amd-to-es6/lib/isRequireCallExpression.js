'use strict'

module.exports = function (node) {
  return node.type === 'ExpressionStatement' &&
    node.expression &&
    node.expression.type === 'CallExpression' &&
    node.expression.callee &&
    node.expression.callee.type === 'Identifier' &&
    node.expression.callee.name === 'require' &&
    node.expression.arguments &&
    node.expression.arguments.length === 1
}
