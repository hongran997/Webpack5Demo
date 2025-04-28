const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "js/[name].js",
    path: resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test:/\.js$/,
        // loader: './loaders/simple-loader.js'
        // loader: './loaders/clean-log-loader.js'
        use: [
          './loaders/clean-log-loader.js',
          {
            loader: './loaders/banner-loader/banner-loader.js',
            options: {
              author: 'hongran'
            }
          },
          {
            loader: './loaders/babel-loader/babel-loader.js',
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['./loaders/style-loader.js', 'css-loader']
      },
      {
        test: /\.(img|gif|png|jpe?g)$/,
        loader: './loaders/file-loader.js',
        type: "javascript/auto"
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  mode: 'development'
}