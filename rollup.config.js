import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import url from "@rollup/plugin-url"

const plugins = [vue(), postcss(), typescript(), url({
  include: ["**/*.wav"],
  limit: 100000,
})];

const external = ["vue", "@publishvue/chessopsnpmts", "@publishvue/chessground", "lodash"];

const name = "Vue3complib";

export default [
  // Universal Module Definition, works as amd, cjs and iife all in one
  {
    input: "src/index.ts",
    external,
    output: {
      name,
      file: `dist/index.js`,
      format: "umd",
      sourcemap: true,
      exports: "named",
      globals: {
        vue: "Vue",
        "@publishvue/chessground": "Chessground",
        "@publishvue/chessopsnpmts": "Chessopsnpmts",
        "lodash": "lodash",
      },      
    },
    plugins,    
  },
];
