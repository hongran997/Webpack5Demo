/** @type {import('webpack').Configuration} */
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebapckPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin, PrefetchPlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const { resolve } = require('path');
const isProduction = process.env.NODE_ENV === 'production';

const getStyleLoaders = function (preloader) {
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
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
    path: isProduction ? resolve(__dirname, '../dist') : undefined,
    filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
    chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
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
        options: {
          cacheDirectory: resolve(__dirname, "node_modules/.cache/vue-loader")
        }
      }

    ]
  },
  plugins: [
    new DefinePlugin({
      __VUE_OPTIONS_API__: "false", // 使用composition-api
      __VUE_PROD_DEVTOOLS__: "false", // 关闭vue-devtools
    }),
    new VueLoaderPlugin(),
    // 处理html文件
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../public/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
    }),
    // 处理js文件
    new EslintWebpackPlugin({
      context: resolve(__dirname, '../src'),
      exclude: "node_modules",
      cache: true,
      cacheLocation: resolve(__dirname, '../node_modules/.cache/.eslintcache'),
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
    new PrefetchPlugin({
      rel: 'prefetch',
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
    new ModuleFederationPlugin({  
      shared: {
        lodash: { singleton: true, requiredVersion: false }
      }
    }),
  ],
  optimization: {
    usedExports: true, // 只打包用到的代码, 移除项目和第三方依赖中未使用的代码，主要影响代码级别的优化
    sideEffects: true, // 启用文件级别优化，默认值是 true，表示开启对 package.json 中 sideEffects 的读取
    minimize: isProduction,
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
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        elementUI: {
          name: "chunk-elementPlus",
          test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
          priority: 30,
        },
        vue: {
          name: "chunk-vue",
          test: /[\\/]node_modules[\\/]_?vue(.*)/,
          priority: 20,
        },
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
        },
      }
    },
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
  },
  resolve: {
    extensions: [".vue", ".js", ".json"],
    alias: {
      "@": resolve(__dirname, "../src")
    }
  },
  devServer: {
    host: 'localhost',
    port: '4000',
    open: true,
    hot: true,
    historyApiFallback: true,
  },
  performance: {
    hints: 'warning', // 在生产环境下给出警告，开发环境禁用
    maxEntrypointSize: 512000, // 入口文件最大大小（字节）
    maxAssetSize: 512000 // 单个资源文件最大大小（字节）
  },
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    'vuex': 'Vuex'
  },
  stats: "errors-only",
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  mode: isProduction ? 'production' : 'development',
}