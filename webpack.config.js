const webpack = require('webpack')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  context: __dirname + "/js",
  entry: "./main.ts",
  output: {
    filename: "./build.js",  // 出力先フォルダ
  },

  // importする際に拡張子を省略できる
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [
      path.resolve('./app/assets/javascripts'),
        `${__dirname}/node_modules`
    ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // /vue$/な名前のmoduleをimportした際に、完全ビルドであるvue/dist/vue.esm.jsを使うようにaliasをつける
    }
  },
  module: {
    rules: [
      {
        test: /(\.tsx?|\.jsx?)$/,
        use: 'ts-loader'
      },
    ]
  },
  devtool: isProd ? 'nosources-source-map': 'inline-source-map',
  cache: !isProd,
  watch: !isProd
};
