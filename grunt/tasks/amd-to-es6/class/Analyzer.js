'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')

function getIdentifier (array) {
  let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  let index = 0
  while (array.indexOf(alphabet[index]) !== -1) {
    index += 1
    if (index === alphabet.length) {
      index = 0
      alphabet = alphabet.map(character => '_' + character)
    }
  }
  return alphabet[index]
}

module.exports = class Analyzer extends AbstractSyntaxTree {
  constructor (source, options) {
    super(source, options)
    this.identifiers = this.getIdentifiers()
  }

  getIdentifiers () {
    return [...new Set(this.find('Identifier').map(identifier => identifier.name))]
  }

  createIdentifier () {
    const identifier = getIdentifier(this.identifiers)
    this.identifiers.push(identifier)
    return identifier
  }
}
