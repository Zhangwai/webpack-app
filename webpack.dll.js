const path = require("path");
const webpack = require("webpack");
const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  entry: {
    lodash: ["lodash"],
  },
  output: {
    filename: "[name].js",
    path: resolve("dll"),
    // 向外暴露的内容名字
    library: "[name]_[hash]",
  },
  plugins: [
    // 打包生成一个manifest.json --> 提供和jquery映射
    new webpack.DllPlugin({
      name: "[name]_[hash]", // 映射库的暴露的内容名称
      path: resolve("dll/manifest.json"), // 输出文件路径
    }),
  ],

  mode: "production",
};
