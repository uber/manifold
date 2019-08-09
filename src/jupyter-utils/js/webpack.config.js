require("dotenv").config();
const { resolve } = require("path");
const webpack = require("webpack");
const jupyterExternals = require("./jupyter-externals");

const externals = [...jupyterExternals];

module.exports = {
  entry: {
    app: [resolve("./src/index.js")]
  },
  devtool: "source-maps",
  output: {
    path: resolve("../mlvis/static"),
    filename: "index.js",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: [`babel-loader?${JSON.stringify(settings)}`],
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
  externals
};
