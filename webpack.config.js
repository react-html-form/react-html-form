const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  resolve: {
    extensions: [".js", ".jsx", ".ts", "tsx"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "react-html-form.js",
    library: "react-html-form",
    libraryTarget: "umd"
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "react"
    }
  },
  module: {
    rules: [{ test: /\.tsx?$/, exclude: /node_modules/, loader: "ts-loader" }]
  }
};
