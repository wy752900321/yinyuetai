var path = require('path');
var openBrowserWebpackPlugin = require('open-browser-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  entry: "./src/main.js",

  output: {
    path: __dirname + '/build/js',
    publicPath: '/build/js/',
    filename: "bundle.js"
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css"
        // test: /\.css$/, loader: ExtractTextPlugin.extract('css-loader')
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass",
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: "url-loader?limit=8192"
      }
    ]
  },

  plugins: [
    // new ExtractTextPlugin("bundle.css"),
    new openBrowserWebpackPlugin({url: 'http://localhost:8080'}),
  ],

  devServer: {
    contentBase: './',
    historyApiFallback: true,
    // host: '192.168.191.1',
    // host:'192.168.1.101',
    inline: true
  }
};