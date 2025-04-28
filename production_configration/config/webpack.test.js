const os = require('os');
const { resolve } = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const threads = os.cpus().length;

module.exports = {
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, '../dist'),
    filename: 'static/js/[name][contenthash:10].js',
    chunkFilename: 'static/js/[name][contenthash:10].chunk.js',
    assetModuleFilename: 'static/media/[name][contenthash:10][ext][query]',
    clean: true
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.styl$/,
            use: [MiniCssExtractPlugin.plugin, 'css-loader', { loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']} }}, 'stylus-loader']
          }, 
          {
            test: /\.less$/,
            use: [MiniCssExtractPlugin.plugin, 'css-loader', { loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}} }, 'less-loader']
          },
          {
            test: /\.s[ac]ss$/,
            use: [MiniCssExtractPlugin.plugin, 'css-loader', { loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}} }, 'sass-loader']
          },
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.plugin, 'css-loader', { loader: 'postcss-loader', options: {postcssOptions: {plugins: ['postcss-preset-env']}} }]
          },
          {
            test: /\.(png|jpe?g|webp|svg|gif)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 1024 * 10
              }
            }
          },
          {
            test: /\.(ttf|woff2?|mp3|mp4|avg)$/,
            type: 'asset/resource',
          },
          {
            test: /\.js$/,
            use: [
              {
                loader: 'thread-loader',
                options: {
                  workers: threads
                }
              },
              {  
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,
                  cacheCompression: false,
                  plugins: ['@babel/plugin-transform-runtime']
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
      context: resolve(__dirname, '../src'),
      cache: true,
      cacheLocation: resolve(__dirname, '../node_modules/.cache/eslintcache'),
      threads,
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../public/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name][contenthash:10].css',
      chunkFilename: 'static/css/[name][contenthash:10].chunk.css',
    }),
    new ModuleFederationPlugin({
      name: 'host_app',
      shared: {
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
          mangle: true, // 作用：
        },
      })
    ],
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    }
  },
  externals: {
    jquery: 'jQuery',
    react: 'React',
    reactDOM: 'ReactDOM'
  },
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    open: true,
    port: 3000,
  },
  mode:'production'
}