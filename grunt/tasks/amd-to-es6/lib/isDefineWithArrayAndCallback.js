'use strict'

module.exports = function (node) {
  var length = node && node.arguments && node.arguments.length
  return length >= 2 &&
        node &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'define' &&
        node.arguments[length - 2].type === 'ArrayExpression' &&
        (
          node.arguments[length - 1].type === 'FunctionExpression' ||
            node.arguments[length - 1].type === 'ArrowFunctionExpression'
        )
}
