class AnalyzeWebpackPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap("AnalyzeWebpackPlugin", (compilation) => {
      const assets = Object.entries(compilation.assets);
      let content = `| 资源名称 | 资源大小 |
| --- | --- |`;
      assets.forEach(([filename, file]) => {
        content = content + `\n| ${filename} | ${Math.ceil(file.size()/1024)}Kb |`
      })
      compilation.assets["analyze.md"] = {
        source() {
          return content
        },
        size() {
          return content.length;
        }
      }
    })
  }
}
module.exports = AnalyzeWebpackPlugin