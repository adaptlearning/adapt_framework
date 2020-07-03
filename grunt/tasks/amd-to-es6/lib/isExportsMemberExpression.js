module.exports = function isExportsMemberExpression (node) {
  return node.type === 'MemberExpression' &&
    node.object &&
    node.object.name === 'exports' &&
    node.property &&
    node.property.type === 'Identifier'
}
