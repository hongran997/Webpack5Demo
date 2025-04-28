module.exports = function loader(content) {
  console.log("hello loader" + content);
  return content;
}