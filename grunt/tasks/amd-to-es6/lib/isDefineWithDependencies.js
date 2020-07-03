'use strict'

const isDefineWithFunctionExpression = require('./isDefineWithFunctionExpression')
const isDefineWithArrayAndCallback = require('./isDefineWithArrayAndCallback')

module.exports = function (node) {
  return isDefineWithFunctionExpression(node) ||
        isDefineWithArrayAndCallback(node)
}
