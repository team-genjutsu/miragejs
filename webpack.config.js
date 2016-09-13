const webpack = require('webpack');
const path = require('path');

// NODE_ENV set to production in heroku, so defaulting to 'development' here
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: [
<<<<<<< HEAD
    './src/index.js',
=======
    './public/index.js',
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  ],
  output: {
    path: path.join(__dirname, './public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [{
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015', 'stage-1'],
      },
    }],
  },
  devtool: process.env.NODE_ENV !== 'production' ? 'inline-sourcemap' : null,
  plugins: process.env.NODE_ENV !== 'production' ? [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin()] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.Occurence.Plugin(),
      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
  resolve: {
    root: __dirname,
    //  this allows up to use aliases when we require from the following folders
    modulesDirectories: [
      'node_modules',
      './src/components',
      './src/reducers',
      './src/actions',
    ],
    extensions: ['', '.js', '.jsx'],
  },

  //excluding sourcemaps when on heroku
  devtool: process.env.NODE_ENV === 'production' ? undefined : 'cheap-module-eval-source-map'
};
