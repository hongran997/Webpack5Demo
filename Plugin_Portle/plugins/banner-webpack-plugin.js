class BannerWebpackPlugin {
  // debugger
  constructor(options = {}) {
    this.options = options;
  }
  apply(compiler) {
    const extensions = ['js', 'css'];
    compiler.hooks.emit.tapAsync("BannerWebpackPlugin", (compilation, callback) => {

      const assetPaths = Object.keys(compilation.assets).filter(path => {
        const splitted = path.split('.');
        return extensions.includes(splitted[splitted.length - 1]);
      })

      assetPaths.forEach(assetPath => {
        const asset = compilation.assets[assetPath].source();
        const source = `/*
        *Author: ${this.options.author}
        */\n${asset}
        `;
        compilation.assets[assetPath] = {
          source() {
            return source;
          },
          size() {
            return source.length
          }
        }
      })

      callback()

    })

  }
}
module.exports = BannerWebpackPlugin