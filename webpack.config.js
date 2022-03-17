const path = require("path");
// 自动生成html文件插件
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 删除打包文件的插件
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// 提取css文件的插件
const miniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css文件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// PWA
const workboxWebpackPlugin = require("workbox-webpack-plugin");

const { GenerateSW } = workboxWebpackPlugin;

const webpack = require("webpack");

// 添加dll中的工具引到html中
const addAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

// 图片压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

// 打包结果分析插件
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// process.env.NODE_ENV = "development";
console.log(process.env.NODE_ENV);

const CommonCssLoader = [
  // use执行顺序从下往上
  // 创建一个style标签，将js中的样式资源插入进行，添加到head中生效
  // "style-loader",
  // 提取css为单独文件
  {
    loader: miniCssExtractPlugin.loader,
  },

  // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
  "css-loader",

  // 配置写到外面的postcss.config.js
  // "postcss-loader",

  /**
   * css 兼容性处理：postcss postcss-loader postcss-preset-env
   * postcss-preset-env：帮助postcss找到browserslist配置
   */
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: [
          // postcss的插件
          [
            "postcss-preset-env",
            {
              // options
            },
          ],
        ],
      },
    },
  },
];

/**
1.连接路径：path.join([path1][, path2][, ...])
2.路径解析：path.resolve([from ...], to)
  path.join从左到右解析，单纯的拼接，可以写'./xxx'、'/xxx'、'xxx'都随意
  path.resolve从右往左解析直到解析完，遇见'/xxx'，就是解析结束，什么都不写默认当前目录绝对路径，没有遇见'/xxx'，默认在前面拼接目录绝对路径
 */

/**
loader:1、下载 2、使用(配置loader)
plugins:1、下载 2、引入 3、使用
 */
const resolve = (dir) => path.join(__dirname, dir);
// console.log(path.join("./build", "/index"));
// console.log(path.resolve("./build", "index/xx", "aa"));

/**
 * 生产环境
 * 缓存：
 *  1.babel缓存
 *  2.文件资源缓存
 *    hash：每次构建会生成唯一的hash值，给输出名加上hash就可以实现重新请求资源，从而不走强缓存
 *      问题：因为js和css同时使用同一个hash值，重新打包会导致所有缓存失效
 *    chunkhash：根据chunk生成的hash值。如果打包来源于同一个chunk，hash就一样
 *      问题：js和css同时还是使用同一个hash值
 *        因为css是在js中被引入的，所以同属于一个chunk
 *    contenthash：根据文件的内容生成hash值。不同文件hash不同
 */

/**
 * tree shaking: 去除无用代码
 * 前提： 1、使用esm 2、环境为production
 * 作用：减少打包体积
 *
 * 在package.json中配置 可能会因为webpack版本问题导致把部分代码shaking掉了
 *  "sideEffects": false 所有代码都没有副作用（都可以进行tree shaking）
 *  问题：可能会把css文件 / @babel/polyfill（副作用）文件干掉
 *  "sideEffects": ["*.css", "*.less"]
 *
 */
module.exports = {
  // 模式
  mode: "production",
  // 入口文件目录(单入口)
  // entry: resolve("./src/index.js"),
  // 多入口 所有的入口文件最终形成一个chunk输出去只有一个bundle文件
  // --> 只有在HMR功能中让html热更新生效
  entry: [resolve("./src/index.js"), resolve("./src/public/index.html")],
  // entry: [resolve("./src/index.js")],
  // 多入口:有一个入口就有一个bundle 不灵活
  // 想打包成一个chunk就使用[resolve("./src/index.js"), resolve("./src/static/js/print.js")]框起来
  // entry: {
  //   index: resolve("./src/index.js"),
  //   print: resolve("./src/static/js/print.js"),
  // },

  // 入口文件输出地址
  output: {
    // 输出文件名
    filename: "assets/js/[name].[contenthash:10].js",
    // 输出路径 绝对路径
    path: resolve("build"),
    // 非入口chunk的名称
    chunkFilename: "assets/js/[name].[contenthash:10]_chunk.js",
  },
  // 生产环境执行的插件 优化
  optimization: {
    // 压缩方案
    // 开发环境下启用 CSS 优化
    minimizer: [
      // terser库 js压缩
      // 在 webpack@5 中，你可以使用 `...` 语法来扩展现有的 minimizer（即 `terser-webpack-plugin`），将下一行取消注释
      "...",
      new CssMinimizerPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.squooshMinify,
          options: {
            encodeOptions: {
              mozjpeg: {
                quality: 85,
              },
              webp: {
                lossless: 1,
              },
              avif: {
                cqLevel: 0,
              },
            },
          },
        },
      }),
    ],
    // 开发环境下启用 CSS 优化
    // minimize: true,
    // 单入口将引入的node_module中代码单独打包成一个chunk最终输出
    // 多入口自动分析多入口chunk中有没有公共的文件。如果有会打包成单独文件
    splitChunks: {
      chunks: "all",
      // minSize: 30 * 1024, // 分割的chunk最小为30kb
      // maxSize: 0, // 分割的chunk最大没有限制
      cacheGroups: {
        vendors: {
          name: "chunk-vendors",
          test: /[\\/]node_modules[\\/]/,
          // 优先级
          priority: -10,
        },
        default: {
          name: "chunk-default",
          priority: -20,
          // 至少被引用两次
          minChunks: 2,
          // 如果当前要打包的模块和之前已经被提取的模块是同一个复用，而不是重新打包
          reuseExistingChunk: true,
        },
        jquery: {
          name: "chunk-jquery",
          priority: 0,
          test: /[\\/]node_modules[\\/]_?jquery(.*)/,
        },
      },
    },
    // 将当前模块的记录其他模块的hash单独打包为一个文件 runtime
    // 修改a文件保证b文件的contenthash变化
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },
  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动devServer指令为：webpack-dev-server
  devServer: {
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3333,
    open: true,
    // 启动热模块更新
    /**
     * css: 可以热替换
     * js: 没有热替换，可以热更新。添加js代码去处理非入口文件部分实现热替换
     * html: 没有热替换，不能热更新。在entry引入html文件地址，解决热更新（不用做HMR功能）
     */
    hot: true,
    client: {
      // 如果出错, 不要全屏提示
      overlay: false,
      // 不要显示启动服务器日志信息
      logging: "none",
      // 在浏览器中以百分比显示编译进度
      progress: true,
      // 告诉 dev-server 它应该尝试重新连接客户端的次数。当为 true 时，它将无限次尝试重新连接。
      reconnect: true,
    },
    // 除了一些基本的启动信息以外，其他内容都不要显示
    // quiet: true,
    // 服务器代理
    proxy: {},
  },

  // loader配置
  module: {
    rules: [
      {
        // 以下loader只会匹配一个（优化生产环境打包速度）
        // 注意： 不能有两个配置处理同一个类型文件
        oneOf: [
          // 使用style-loader后css样式文件打包后全部在js文件里面了
          {
            test: /\.css$/,
            // 只检查src
            // include: resolve("src"),
            // 优先执行
            // enforce: "pre",
            // 延后执行
            // enforce: "post",
            use: [
              // use执行顺序从下往上
              // 创建一个style标签，将js中的样式资源插入进行，添加到head中生效
              // "style-loader",
              // 提取css为单独文件
              {
                loader: miniCssExtractPlugin.loader,
              },

              // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
              "css-loader",

              // 配置写到外面的postcss.config.js
              // "postcss-loader",

              /**
               * css 兼容性处理：postcss postcss-loader postcss-preset-env
               * postcss-preset-env：帮助postcss找到browserslist配置
               */
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: [
                      // postcss的插件
                      [
                        "postcss-preset-env",
                        {
                          // options
                        },
                      ],
                    ],
                  },
                },
              },
            ],
          },
          // 使用style-loader后less样式文件打包后全部在js文件里面了
          {
            test: /\.less$/,
            use: [
              ...CommonCssLoader,
              // 将less文件编译为css文件
              "less-loader",
            ],
          },
          {
            test: /\.(jpg|png|gif)$/,
            use: [
              {
                loader: "url-loader",
                options: {
                  // 图片大小小于8kb，就会被base64处理
                  // 优点: 减小请求数量
                  // 缺点: 图片体积会变大
                  limit: 1024 * 100,
                  // 重命名
                  name: "[name][hash:10].[ext]",
                  // 不使用esmodule,以防出现[object Module]bug
                  esModule: false,
                  outputPath: "assets/img",
                },
              },
            ],
            type: "javascript/auto",
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            use: [
              {
                loader: "file-loader",
                options: {
                  name: "[name][hash:10].[ext]",
                },
              },
            ],
          },
          {
            test: /\.html$/,
            use: [
              {
                // 用来处理html文件中的图片src问题打包后的src带有hash
                loader: "html-loader",
              },
            ],
          },
          {
            test: /\.js/,
            exclude: /node_modules/,
            use: [
              // 检查语法使用继承的airbnb
              /**
             * 写在package.json
              "eslintConfig": {
                "extends": "airbnb-base"
                }
             */
              // {
              //   loader: "eslint-loader",
              //   options: {
              //     // 自动修复错误
              //     fix: true,
              //   },
              // },
              /**
               * 开启多进程打包
               * 进程启动大概600ms，通信也有开销
               * 只有工作消耗时间比较长才需要多进程打包
               * 现在js项目较小不开启3秒多开启4秒多
               **/
              // "thread-loader",
              /**
               * js兼容性处理 @babel/preset-env @babel/core babel-loader
               * 1、基本js兼容性处理 --> @babel/preset-env
               *    问题：只能转化基本语法。如Promise不能转化
               * 2、解决全部语法 --> @babel/polyfill
               *    问题： 全部引入，体积太大
               * 3、按需加载 --> core-js
               */
              {
                loader: "babel-loader",
                options: {
                  // 预设
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        // 需要兼容到以下浏览器的什么版本
                        targets: {
                          ie: 7,
                          edge: "17",
                          firefox: "60",
                          chrome: "67",
                          safari: "11.1",
                        },
                        // 按需加载
                        useBuiltIns: "usage",
                        // 指定core-js版本 看好了这个地方如果和你安装的包的版本不一样会报错
                        corejs: {
                          version: 3,
                        },
                      },
                    ],
                  ],
                  // 开启babel缓存，生产环境不能用HMR
                  // 第二次构建时候，会读取之前的缓存
                  cacheDirectory: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  // plugins的配置
  plugins: [
    // 默认会创建空的html文件，自动引入打包输出的资源
    new HtmlWebpackPlugin(
      // 以src/public/index.html这个文件为模板，自动引入打包输出资源
      { template: "./src/public/index.html" }
    ),
    new CleanWebpackPlugin(),
    new miniCssExtractPlugin({
      filename: "assets/css/[name][contenthash:10].css",
    }),
    // new GenerateSW({
    //   /**
    //    * 1、帮助serviceWorker快速启动
    //    * 2、删除旧的serviceWorker
    //    * 生成一个serviceWorker的配置文件
    //    */
    //   clientsClaim: true,
    //   skipWaiting: true,
    // }),
    // 告诉webpack哪些库不参与打包，同时使用时的名字也得变
    new webpack.DllReferencePlugin({
      manifest: resolve("dll/manifest.json"),
    }),
    // 将某个文件打包输出并在html自动引入
    new addAssetHtmlWebpackPlugin({
      filepath: resolve("dll/lodash.js"),
      outputPath: "assets/js",
      publicPath: "assets/js",
    }),
    // 分析插件
    new BundleAnalyzerPlugin({
      analyzerMode: "server",
      analyzerHost: "127.0.0.1",
      analyzerPort: "8877",
    }),
  ],

  resolve: {
    // 配置别名
    alias: {
      $static: resolve("src/static"),
    },
    // 配置省略文件路径的后缀名
    extensions: [".js", ".css", ".json"],
    // 告诉webpack模块去哪里找，默认这一层找不到回到上一层的node_module中找，写绝对路径找的会快点
    modules: [resolve("node_modules"), "node_modules"],
  },

  /**
   * source-map: 一种提供源代码到构建后代码映射 技术（如果构建后代码出错可以追踪源代码错误）
   *
   * [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
   * source-map: 外部 提示到错误代码准确位置
   * inline-source-map: 内联构建速度更快 没有.map的外部文件 只生成一个source-map 提示到错误代码准确位置
   * hidden-source-map: 外部 提示到错误代码的原因，提示到构建后代码位置（隐藏源代码）
   * eval-source-map: 内联 每一个文件都生成一个对应的source-map 都在eval中 提示到错误代码准确位置，多了hash值
   * nosources-source-map: 外部 提示到错误代码的原因，没有任何源代码信息（隐藏源代码）
   * cheap-source-map: 外部 提示到错误代码准确行的位置
   * cheap-module-source-map: 外部 提示到错误代码准确行的位置 module会将loader的source map加入
   *
   * 开发环境：速度快，调试友好
   * (eval>inline>cheap>...)
   * 速度快：eval-source-map / eval-cheap-source-map
   * 调试更友好：source-map / cheap-source-map / cheap-module-source-map
   * --> eval-source-map / eval-cheap-module-source-map
   * 生产环境：调试要不要友好 源代码是否隐藏
   * 内联体积会变大一般不用
   * 隐藏全部代码 nosources-source-map
   * 隐藏源代码，显示构建后代码 hidden-source-map
   * --> source-map / cheap-module-source-map
   */
  devtool: "eval-source-map",

  /**
   * 忽略打包文件，需要通过cdn当时引入
   */
  // externals: {
  //   jquery: "jQuery",
  // },
};
