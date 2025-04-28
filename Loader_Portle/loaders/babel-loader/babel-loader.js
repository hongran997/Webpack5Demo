const schema = require('./schema.json');
const babel = require("@babel/core");
module.exports = function babelLoader(content) {
  const options = this.getOptions(schema);
  const callback = this.async();
  babel.transform(content, options, function (err, result) {
    if (err) callback(err);
    else callback(null, result.code);
  });
}