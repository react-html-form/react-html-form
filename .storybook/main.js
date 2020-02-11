const path = require("path");

module.exports = {
  webpackFinal: config => {
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [{ loader: "ts-loader" }]
    });

    config.resolve.alias.src = path.resolve(__dirname, "../src");
    config.resolve.extensions.push(".ts", ".tsx");

    return config;
  }
};
