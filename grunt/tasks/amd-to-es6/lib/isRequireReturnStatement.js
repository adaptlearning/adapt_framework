module.exports = function isRequireReturnStatement (node) {
  return node.type === 'ReturnStatement' &&
    node.argument &&
    node.argument.type === 'CallExpression' &&
    node.argument.callee.type === 'Identifier' &&
    node.argument.callee.name === 'require'
}