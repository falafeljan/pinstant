const webpack = require('webpack');
const OfflinePlugin = require('offline-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

const debug = process.env.NODE_ENV !== 'production';

const config = {
  entry: ['babel-polyfill', `${__dirname}/app/index.js`],

  output: {
    path: `${__dirname}/public`,
    filename: debug ? 'app.js' : 'app.[hash].js',
  },

  devtool: 'source-map',
  performance: {
    hints: debug ? false : 'warning',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: ['react-hot-loader/webpack', 'babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.(svg|png)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
      {
        test: /\.otf$/,
        use: 'file-loader',
      },
    ],
  },

  devServer: {
    contentBase: `${__dirname}/public`,
    historyApiFallback: true,
    port: 3000,
    hot: true,
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: !debug,
      debug,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        GRAPHQL_ENDPOINT: JSON.stringify(process.env.GRAPHQL_ENDPOINT),
      },
    }),

    new HtmlWebpackPlugin({
      inject: 'body',
      template: `${__dirname}/index.html`,
    }),

    new OfflinePlugin({
      excludes: ['**/*.map'],
      updateStrategy: 'changed',
      autoUpdate: debug ? 1000 * 60 * 2 : false,

      ServiceWorker: {
        events: true,
        navigateFallbackURL: '/',
      },
    }),
  ],
};

if (!debug) {
  const prodPlugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
  ];

  prodPlugins.forEach(plugin => config.plugins.push(plugin));
} else {
  config.entry.unshift('react-hot-loader/patch');
  config.plugins.push(new webpack.NamedModulesPlugin());
}

module.exports = config;
