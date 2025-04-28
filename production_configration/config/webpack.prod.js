// TODO eslint 识别有问题
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
                // 小于10KB的资源转化为base64
                // 好处是减少http请求，坏处是体积变大了
                maxSize: 10 * 1024
              }
            },
            // generator: {
            //   filename: "static/images/[hash:10][ext][query]"  // 前面 assetModuleFilename 给设置了
            // }
          },
          // 处理字体文件或其他文件，这类文件会原封不动的输出到打包文件夹
          {
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,   // webpack5 新配置
            type: "asset/resource",
            // generator: {
            //   filename: "static/media/[hash:10][ext][query]"  // 前面 assetModuleFilename 给设置了
            // }
          },
          // 使用babel 处理js文件, 如果项目中使用的ES6语法，不使用babel处理，那么在IE浏览器上无法运行，因为IE浏览器不支持ES6语法
          // 相反，如果使用了，就可以在IE上运行了
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
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: resolve(__dirname, "../src"),
      exclude: "node_modules", 
      threads
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
    }),
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
    new PreloadWebpackPlugin({
      // rel:'preload',
      // as:'script',
      rel: 'prefetch' // 预加载，所有资源都会在浏览器空闲时加载
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
        'lodash': {singleton: true, requiredVersion: false}
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
      chunks: "all", // 对所有模块都进行分割
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
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    }
  },
  // stats: "errors-only",
  mode: "production",
  // 这个配置，针对prod环境，不仅会指出错误发生的行，还会指出错误发生的列
  devtool: "source-map",
  // 以下会被排除到打包过程外
  // <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  // <!-- 这个脚本会在window上挂载 ReactDOM 变量 -->
  // 代码中的引入方式必须是：
  // import ReactDOM from 'reactDOM';  // key必须匹配这里
  externals: {
    // key 是包名，value 是全局变量名
    jquery: 'jQuery',
    react: 'React',
    reactDOM: 'ReactDOM',
  }
}