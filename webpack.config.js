/** @type {import('webpack').Configuration} */
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
const isProduction = process.env.NODE_ENV === 'production';

function getStyleLoaders(preLoader) {
  return [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    preLoader
  ].filter(Boolean);
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'static/js/[name].[contenthash:10].js',
    chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
    assetModuleFilename: "static/media/[name].[hash:10][ext]",
    path: resolve(__dirname, '../dist'),
    clean: true, // webpack5 新配置
  },
  module: {
    rules: [
      {
        oneOf: [
          //处理.stylus文件
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader')
          },
          //处理.sass,.scss文件
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader'),
          },
          //处理.less文件
          {
            test: /\.less$/,
            use: getStyleLoaders('less-loader'),
          },
          //处理.css文件
          {
            test: /\.css$/,
            use: getStyleLoaders()
          },
          // 处理图片
          {
            test: /\.(png|jpe?g|svg|gif|webp)$/,    // webpack5 新配置，内置file-loader, url-loader， 无需再配置安装
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024
              }
            },
          },
          // 处理字体+媒体文件
          {
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,   
            type: "asset/resource",
          },
          // 处理js 文件
          {
            test: /\.js$/,
            // exclude: /node_modules/,
            include: resolve(__dirname, '../src'),
            use: [
              {
                loader: "thread-loader",
                options: {
                  workers: threads,
                }
              },
              {
                loader: "babel-loader",
                options: {
                  cacheDirectory: true, // 开启babel编译缓存
                  cacheCompression: false, // 缓存文件不要压缩
                  plugins: ["@babel/plugin-transform-runtime"]  // 对babel注释的优化
                }
              },
            ]
          },
        ]
      } 
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
    }),
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: resolve(__dirname, "../src"),
      exclude: "node_modules", 
      threads
    }),
    new PreloadWebpackPlugin({
      rel: 'preload', // 预加载
      include: ['app', 'vendors'], // 预加载主页文件
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // ServiceWorkers 的生命周期： 安装--> 等待 ---> 激活 --> 控制页面
      skipWaiting: true, // 确保跳过等待直接激活
      clientsClaim: true, // 确保激活后立即接管页面
    }),
    new ModuleFederationPlugin({
      shared: {
        // singleton: true, 表示只共享一个版本，不共享多个版本，优先级高
        // eager: true, 表示立即加载，不延迟加载，优先级高于lazy
        // 不会导致主包变大
        'lodash': {singleton: true, requiredVersion: false, eager: false},
      }
    })
  ],
  optimization: {
    usedExports: true, // 只打包用到的代码, 移除项目和第三方依赖中未使用的代码，主要影响代码级别的优化
    sideEffects: true, // 启用文件级别优化，默认值是 true，表示开启对 package.json 中 sideEffects 的读取
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
          format: {
            comments: true, // 移除所有注释的代码
          },
          mangle: true,
        }
      }),
      // 通过继承各种图片压缩工具，将图片压缩后输出
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
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
          }
        },
    }),
    ],
    splitChunks: {
      chunks: "async", // 只对异步模块进行分割
      minSize: 20000, // 只要大于20kb就进行分割
      maxSize: 100000, // chunk 的最大体积
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
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    }
  },
  devServer: {
    contentBase: resolve(__dirname, '../dist'),
    compress: true,
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  externals: {
    // key 是包名，value 是全局变量名
    jquery: 'jQuery',
    react: 'React',
    reactDOM: 'ReactDOM',
  },
  resolve: {
    extensions: [".js", ".json", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": resolve(__dirname, "../src")
    }
  },
  performance: {
    hints: "warning", // 在生产环境下给出警告，开发环境禁用
    maxEntrypointSize: 512000, // 入口文件最大大小（字节）
    maxAssetSize: 512000, //
  },
  stats: "errors-only",
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  mode: isProduction ? 'production' : 'development',
}