const os = require("os");
const { resolve } = require('path');
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const threads = os.cpus().length;
const TerserPlugin = require("terser-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  entry: {
    index: './src/index.js',
    app: './src/app.js'
  },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'static/js/[name].[contenthash:10].js',
    chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
    assetModuleFilename: 'static/media/[contenthash:10][ext][query]',
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', {loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}}}]
          }, 
          {
            test: /\.styl$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', {loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}}},'stylus-loader']
          },
          {
            test: /\.s[ac]ss$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader',{loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}}},'sass-loader'],
          },
          {
            test: /\.less$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader',{loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}}},'less-loader'],
          },
          {
            test: /\.(png|jpe?g|svg|gif|webp)$/,
            type: 'asset',
            parser: {
              // 小于10KB的资源转化为base64
              // 好处是减少http请求，坏处是体积变大了
              dataUrlCondition: {
                maxSize: 10 * 1024
              }
            }
          },
          {
            test: /\.(woff2?|ttf|map3|map4|avi)$/,
            type: 'asset/resource',
          },
          // 使用babel 处理js文件, 如果项目中使用的ES6语法，不使用babel处理，那么在IE浏览器上无法运行，因为IE浏览器不支持ES6语法
          // 相反，如果使用了，就可以在IE上运行了
          {
            test: /\.js$/,
            include: resolve(__dirname, '../src'),
            use: [
              {
                loader: 'thread-loader',
                options: {
                  workers: threads,
                }
              }, 
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,  // 开启babel编译缓存，只有dev环境需要
                  cacheCompression: false,  // 缓存文件不要压缩，只有dev环境需要
                  plugins: ['@babel/plugin-transform-runtime']  // 对babel注释的优化
                }
              }
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: resolve(__dirname, '../src'),
      cache: true, // 只有dev环境需要
      cacheLocation: resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      threads, // 开启多进程和设置进程数量
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../public/index.html'),
    }), 
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename:'static/css/[name].[contenthash:10].chunk.css',
    }),
    new ModuleFederationPlugin({
      name: 'host_app',
      shared: {
        // singleton: true, 表示只共享一个版本，不共享多个版本，优先级高
        // eager: true, 表示立即加载，不延迟加载，优先级高于lazy
        'lodash': {singleton: true, eager: true}
      }
    })
  ],
  optimization: {
    minimize: true, 
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: threads,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      cacheGroups: { // 组，哪些模块要打包到一个组
        defaultVendors: { // 组名
          test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
          priority: -10, // 权重（越大越高）
          reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
        },
        default: { // 其他没有写的配置会使用上面的默认值
          // minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
          minChunks: 2, // 这里的minChunks权重更大
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    }
  },
  // stats: "errors-only",
  devServer: {
    port: 3000, 
    open: true, 
    // 1. 当修改src内文件的时候，自动刷新页面【webpack server自带功能】
    // 2. 这个配置的作用是这是热更新，不会刷新整个页面，只是发生改变的部分会重新编译打包，然后更新到页面上
    // 3. 这个配置只针对于开发环境，prod环境需要重新打包
    // 4. 这个是默认配置为true, 如果想要查看不同，需要修改为false
    // 5. 该配置目前只对css生效，针对js文件，需要额外配置，针对SPA应用，可安装vue-loader，react-hot-loader实现热更新
    hot: true,
  },
  // 以下会被排除到打包过程外，不管是npm 安装的，还是link 引入的，都会被排除
  externals: {
    jquery: 'jQuery',
    react: 'React',
    reactDOM: 'ReactDOM',
  },
  // 这个配置，针对开发环境，不需要他提示错误到列，只会提示到行
  devtool: 'cheap-module-source-map',
  mode: 'development',
}