'use strict'

module.exports = function (node) {
  return node.type === 'ReturnStatement'
}
