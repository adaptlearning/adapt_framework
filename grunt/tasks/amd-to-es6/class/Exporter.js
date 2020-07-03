'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const isDefineWithExports = require('../lib/isDefineWithExports')
const isExportsMemberExpression = require('../lib/isExportsMemberExpression')

module.exports = class Exporter extends AbstractSyntaxTree {
  constructor (source, options) {
    super(source, options)
    this.analyzer = options.analyzer
  }

  harvest () {
    const node = this.first('CallExpression[callee.name="define"]')
    if (!isDefineWithExports(node)) { return [] }
    return this.getExports()
  }

  getExports () {
    const nodes = this.find('AssignmentExpression')
    const exports = []
    const specifiers = []
    const used = []
    nodes.forEach(node => {
      if (!isExportsMemberExpression(node.left)) return
      node.remove = true
      if (node.right.type === 'Identifier' && node.right.name === 'undefined') return
      const identifier = this.analyzer.createIdentifier()
      exports.push({
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: identifier },
            init: node.right
          }
        ],
        kind: 'var'
      })
      used.push(node.left.property.name)
      const index = used.indexOf(node.left.property.name)
      const specifier = {
        type: 'ExportSpecifier',
        local: { type: 'Identifier', name: identifier },
        exported: { type: 'Identifier', name: node.left.property.name }
      }
      if (index >= 0) {
        specifiers[index] = specifier
      } else {
        specifiers.push(specifier)
      }
    })
    return exports.concat([{ type: 'ExportNamedDeclaration', specifiers }])
  }
}
