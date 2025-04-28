/**
 * 给js代码添加文本注释
 * @param {*} content 
 * @returns 
 */
const schema = require('./schema.json');
module.exports = function bannerLoader(content) {
  const options = this.getOptions(schema);
  const prefix = `
  /**
   *Author: ${options.author}
   */
  `;
  return `${prefix} \n ${content}`;
}