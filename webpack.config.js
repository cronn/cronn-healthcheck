const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const entries = {};

if(slsw.lib.webpack.isLocal) {
  Object.keys(slsw.lib.entries).forEach(
    key => (entries[key] = ['./source-map-install.ts', slsw.lib.entries[key]])
  );
} else {
  Object.keys(slsw.lib.entries).forEach(
    key => (entries[key] = slsw.lib.entries[key])
  );
}

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: entries,
  devtool: slsw.lib.webpack.isLocal ? 'source-map' : '',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: ['aws-sdk'],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
};
