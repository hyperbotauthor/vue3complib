const path = require("path");

module.exports = {
  devServer: {
    host: "0.0.0.0",
    disableHostCheck: true,
  },
  pages: {
    index: {
      entry: "src/main.ts",
      title: "Vue Analysis Board",
    },
  },
  lintOnSave: false,
  outputDir: path.resolve(__dirname, "appdist")
};
