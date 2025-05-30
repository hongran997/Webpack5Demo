const EslintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebapckPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { resolve } = require('path');
const isProduction = process.env.NODE_ENV === 'production';

const getStyleLoaders = function (preloader) {
  return [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
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
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: resolve(__dirname, '../src'),
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [
            !isProduction && "react-refresh/babel"  //开启js的HMR功能
          ].filter(Boolean)
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
    new EslintWebpackPlugin({
      context: resolve(__dirname, '../src'),
      exclude: "node_modules",
      cache: true,
      cacheLocation: resolve(__dirname, '../node_modules/.cache/.eslintcache'),
    }),
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
    !isProduction && new ReactRefreshWebpackPlugin() // 开发环境下开启react的HMR功能
  ].filter(Boolean),
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  mode: isProduction ? 'production' : 'development',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name: "chunk-react",
          priority: 40
        },
        antd: {
          test: /[\\/]node_modules[\\/]antd(.*)?[\\/]/,
          name: "chunk-antd",
          priority: 30
        },
        libs: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name: "chunk-libs",
          priority: 20
        }
      }
    },
    // 避免因为代码分割导致缓存失效的问题
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
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
    ]
  },
  resolve: {
    extensions: [".jsx", ".js", ".json"]
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
  }
}