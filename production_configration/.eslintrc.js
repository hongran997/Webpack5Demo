module.export = {
  extends: ["eslint:recommended"], // eslint推荐使用的规则
  parser: "@babel/eslint-parser",
  env: {
    node: true, //启动node中全局变量
    browser: true, // 启动浏览器中全局变量
  },
  plugins: ["import"], // eslint不能识别动态导入语法，配置可识别
  parseOptions: {
    ecmaVersion: 6, // 语法环境使用的es6
    sourceType: "module", // es module
  },
  rules: {
    "no-var": 2, // 不能使用var变量，使用了就报错，优先级高于extends的优先级
  }
}