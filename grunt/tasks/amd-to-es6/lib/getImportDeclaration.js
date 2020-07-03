module.exports = function (element, param) {
  const specifiers = []
  if (param) {
    if (param.type === 'ObjectPattern') {
      param.properties.forEach(property => {
        specifiers.push({
          type: 'ImportSpecifier',
          imported: { type: 'Identifier', name: property.key.name },
          local: { type: 'Identifier', name: property.value.name }
        })
      })
    } else {
      specifiers.push({
        type: 'ImportDefaultSpecifier',
        local: {
          type: 'Identifier',
          name: param
        }
      })
    }
  }
  return {
    type: 'ImportDeclaration',
    specifiers: specifiers,
    source: {
      type: 'Literal',
      value: element
    }
  }
}
