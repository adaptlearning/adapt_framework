module.exports = function isRequireMemberExpressionAssignment (node) {
  return node.type === 'AssignmentExpression' &&
    node.left.type === 'MemberExpression' &&
    node.right.type === 'CallExpression' &&
    node.right.callee.name === 'require' &&
    node.right.arguments.length === 1 &&
    node.right.arguments[0].type === 'Literal'
}
