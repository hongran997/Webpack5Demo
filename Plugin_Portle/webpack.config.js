const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TestPlugin = require('./plugins/test-plugin');
const BannerWebpackPlugin = require('./plugins/banner-webpack-plugin');
const CleanWebpackPlugin = require('./plugins/clean-webpack-plugin');
const AnalyzeWebpackPlugin = require('./plugins/analyze-webpack-plugin');
const InlineChunkWebpackPlugin = require('./plugins/inline-chunk-webpack-plugin');
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "js/[name].js",
    path: resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test:/\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env"]
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    // new TestPlugin(),
    new BannerWebpackPlugin({
      author: "hongran"
    }),
    new CleanWebpackPlugin(),
    new AnalyzeWebpackPlugin(),
    // new InlineChunkWebpackPlugin([/runtime(.*)\.js/g]) // TODO 什么浏览器不支持
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    // 避免因为代码分割导致缓存失效的问题
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    }, 
  },
  mode: 'production'
}