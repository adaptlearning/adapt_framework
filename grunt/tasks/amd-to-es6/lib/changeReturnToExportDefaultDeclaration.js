module.exports = function changeReturnToExportDefaultDeclaration (node) {
  node.type = 'ExportDefaultDeclaration'
  node.declaration = node.argument
  delete node.argument
  return node
}
