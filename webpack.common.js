const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js'
  },
  module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            },           
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {					
                    outputPath: 'images',
                    name: '[name].[ext]',
                },
            },          
        ]
    },    
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CopyPlugin([
      { from: './src/manifest.json', to: 'manifest.json' },
      { from: './src/assets/images/icons/', to: 'images/icons/' },
    ]),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/service-worker.js'),
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),   
    libraryTarget: 'var',
    library: 'app'
  }
};