/**
 * 用来清理js代码中的注释
 * @param {*} content 
 * @returns 
 */
module.exports = function cleanLogLoader(content) {
  // ？表示有没有；都可
  // .* 中的. 不需要转移
  // g 表示全局匹配
  return content.replace(/console\.log\(.*\);?/g, "");
}