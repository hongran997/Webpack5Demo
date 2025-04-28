const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebapckPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

const { resolve } = require('path');

const getStyleLoaders = function (preloader) {
  return [
    MiniCssExtractPlugin.loader,
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
    path: resolve(__dirname, '../dist'),
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash:10][ext][query]',
    clean: true
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
        test: /\.js$/,
        loader: 'babel-loader',
        include: resolve(__dirname, '../src'),
        options: {
          cacheDirectory: true,
          cacheCompression: false
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      }

    ]
  },
  stats: "errors-only",
  plugins: [
    // 处理html文件
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../public/index.html')
    }),
    new VueLoaderPlugin(),
    // 处理js文件
    // new EslintWebpackPlugin({
    //   context: resolve(__dirname, '../src'),
    //   exclude: "node_modules",
    //   cache: true,
    //   cacheLocation: resolve(__dirname, '../node_modules/.cache/.eslintcache'),
    // })
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: resolve(__dirname, "../public"),
          to: resolve(__dirname, "../dist"),
          globOptions: {
            ignore: ["**/index.html"],
          },
        }
      ],
    }),
    new DefinePlugin({
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
    })
  ],
  devtool: 'source-map',
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    // 避免因为代码分割导致缓存失效的问题
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
    minimizer: [
      new CssMinimizerWebapckPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerWebpackPlugin({
        minimizer: {
          implementation: ImageMinimizerWebpackPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ]
  },
  resolve: {
    extensions: [".vue", ".js", ".json"]
  }
}