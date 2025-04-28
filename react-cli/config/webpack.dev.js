// TODO
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const {resolve} = require('path');

const getStyleLoaders = function (preloader) {
  return [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"]
        }
      }
    },
    preloader
  ].filter(Boolean);
}
module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash:10][ext][query]'
  },
  module: {
    rules: [
      // 处理css文件
      {
        test: /\.css$/,
        use: getStyleLoaders(),
      },
      {
        test: /\.less$/,
        use: getStyleLoaders('less-loader'),
      },
      {
        test: /\.s[ac]ss$/,
        use: getStyleLoaders('sass-loader'),
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders('stylus-loader'),
      },
      // 处理图片文件, 小于10k的需要转化为base64
      {
        test: /\.(png|jpe?g|webp|svg|gif)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      },
      // 处理字体文件
      {
        test: /\.(woff2?|ttf|mp4)$/,
        type: "asset/resources",
      },
      // 处理js,jsx文件,react文件
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: resolve(__dirname, '../src'),
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [
            "react-refresh/babel"  //开启js的HMR功能
          ]
        }
      }
      
    ]
  },
  stats: "errors-only",
  plugins: [
    // 处理html文件
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../public/index.html')
    }),
    // 处理js文件
    // new EslintWebpackPlugin({
    //   context: resolve(__dirname, '../src'),
    //   exclude: "node_modules",
    //   cache: true,
    //   cacheLocation: resolve(__dirname, '../node_modules/.cache/.eslintcache'),
    // })
    new ReactRefreshWebpackPlugin()
  ],
  devtool: 'cheap-module-source-map',
  mode: 'development',
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    // 避免因为代码分割导致缓存失效的问题
    runtimeChunk: {
      name : entrypoint => `runtime-${entrypoint.name}`
    }
  },
  resolve: {
    extensions: [".jsx",".js",".json"]
  },
  devServer: {
    host: 'localhost',
    port: '4000',
    open: true,
    hot: true,
    historyApiFallback: true,
  }
}