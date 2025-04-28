const loaderUtils = require("loader-utils");

/**
 * 1. 将文件名通过hash进行重命名-更新他的文件目录，
 * 2. 输出
 * 3. 向外暴露
 * @param {*} content 
 * @returns 
 */
function fileLoader(content) {
  // 根据文件内容生产一个新的文件名称
  let filename = loaderUtils.interpolateName(this, "[hash].[ext]", {
    content,
  });
  filename = `images/${filename}`;
  console.log(filename);
  // 输出文件  具体指的是输出到webpac.config.js指定的output下
  this.emitFile(filename, content);
  // 暴露出去，给js引用 
  // 记得加上'', 不可以是export default，export default 是一个对象， module.exports = 才是一个文件名
  return `module.exports = '${filename}'`;
}

// loader 解决的是二进制的内容
// 图片是 Buffer 数据
fileLoader.raw = true;

module.exports = fileLoader;