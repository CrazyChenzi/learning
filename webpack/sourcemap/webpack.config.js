const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  // devtool: 'eval',
  devtool: false,
  plugins: [
    new webpack.EvalDevToolModulePlugin({
      exclude: /node_modules/,
      module: true,
      columns: false
    })
  ],
  devServer: {
    contentBase: 'dist',
    open: true,
    hot: true
  },
  output: {
    filename: 'source-map.main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
