/**
 * fs = compiler.outputFileSystem;
 * 提供操作文件的一些方法
 */
class CleanWebpackPlugin {
  // debugger
  apply(compiler) {
    const fs = compiler.outputFileSystem;
    const outputPath = compiler.options.output.path;
    compiler.hooks.emit.tap("CleanWebpackPlugin", (compilation) => {
      const err = this.removeFiles(fs, outputPath);
      return err;
    })
  }
  removeFiles(fs, path) {
    try {
      const files = fs.readdirSync(path);
      // console.log(files);
      files.forEach(file => {
        const filePath = `${path}/${file}`;
        const fileStat = fs.statSync(filePath);
        // console.log(fileStat);
        if (fileStat.isDirectory()) {
          this.removeFiles(fs, filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.unlinkSync(path);
    } catch (error) {
      return error;
    }
  }
}
module.exports = CleanWebpackPlugin