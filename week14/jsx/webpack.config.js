const path = require('path')

module.exports = {
  entry: "./animation-demo.js",
  output: {
    filename: 'animation-demo.js', // 必须设置output，默认输出到mian.js
    path: path.resolve(__dirname, 'dist'),
  },
  // devtool: 'source-map', // 启动调试模式
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env'],
            plugins: [["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]]
          }
        }
      }
    ]
  },
  mode: "development", // 开发模式
  devtool: 'source-map', // 启动调试
  devServer: {
    contentBase: './dist',
    hot: true,
  }
}