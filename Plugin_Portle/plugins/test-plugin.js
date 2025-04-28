class TestPlugin{
  constructor() {
    console.log('Test Plugin building')  
  }

  apply(compiler) {
    // debugger
    console.log("Test Plugin apply");
    compiler.hooks.environment.tap("TestPlugin", () => {
      console.log("environment Hooks");
    })
    // emit 开始异步串行了
    compiler.hooks.emit.tap("TestPlugin", (compilation) => {
      console.log('emit 111');
    })
    compiler.hooks.emit.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("emit 222");
        callback();
      }, 1000)
    })
    compiler.hooks.emit.tapPromise("TestPlugin", (compilation) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("emit 333");
          resolve();
        }, 1000)
      })
    })
    // make 开始异步并行钩子了
    compiler.hooks.make.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("make 111");
        callback();
      }, 3000)
    })
    compiler.hooks.make.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("make 222");
        callback();
      }, 2000)
    })
    compiler.hooks.make.tapAsync("TestPlugin", (compilation, callback) => {
      compilation.hooks.seal.tap("TestPlugin", () => {
        console.log("seal hook");
      })
      setTimeout(() => {
        console.log("make 333");
        callback();
      }, 1000)
    })
  }

}

module.exports = TestPlugin;