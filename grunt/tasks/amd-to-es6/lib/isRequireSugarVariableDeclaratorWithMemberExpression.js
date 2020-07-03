module.exports = function isRequireSugarVariableDeclaratorWithMemberExpression (node) {
  if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'MemberExpression') {
    let expression = node.init
    while (expression.object && expression.object.type === 'MemberExpression') {
      expression = expression.object
    }
    return expression.object.type === 'CallExpression' &&
      expression.object.callee.type === 'Identifier' &&
      expression.object.callee.name === 'require'
  }
  return false
}