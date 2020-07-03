module.exports = function isMemberRequireCallExpression (node) {
  return node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'CallExpression' &&
    node.callee.object.callee.name === 'require' &&
    node.callee.object.arguments.length === 1 &&
    node.callee.object.arguments[0].type === 'Literal'
}
