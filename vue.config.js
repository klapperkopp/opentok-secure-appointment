const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  configureWebpack: {
    entry: {
      app: "./client2/src/main.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join("client2/public", "index.html"),
        filename: "index.html",
      }),
    ],
  },
  outputDir: "client2/dist",
};
