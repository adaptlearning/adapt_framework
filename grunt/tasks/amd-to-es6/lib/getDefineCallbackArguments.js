'use strict'

module.exports = function (node) {
  return node.arguments[node.arguments.length - 1]
}
