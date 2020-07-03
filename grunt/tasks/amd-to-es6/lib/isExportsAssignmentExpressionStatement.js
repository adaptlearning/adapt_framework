'use strict'

const isExportsAssignmentExpression = require('./isExportsAssignmentExpression')

module.exports = function (node) {
  return node.type === 'ExpressionStatement' &&
    isExportsAssignmentExpression(node.expression)
}
