/*
 * @Descripttion:
 * @Author: 朱东帅
 * @Date: 2023-10-30 13:19:27
 * @LastEditors: 朱东帅
 * @LastEditTime: 2023-10-30 13:29:45
 */
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: "", //dev ./   prod /
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false, //process.env.NODE_ENV === 'development',

  productionSourceMap: false,
  configureWebpack: (config) => {
    config.module.rules.push({
      test: /\.worker.js$/,
      use: {
        loader: "worker-loader",
        options: { inline: true, name: "workerName.[hash].js" },
      },
    });
    config.resolve.alias["@"] = resolve("src");
  },
  parallel: false,
  chainWebpack: (config) => {
    config.output.globalObject("this");
  },
};
