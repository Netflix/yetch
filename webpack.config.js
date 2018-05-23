const path = require('path');

module.exports = [{
  mode: 'production',
  entry: ['./src/index.js', './polyfill.js'],
  output: {
    filename: 'yetch-polyfill.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Yetch',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}, {
  mode: 'production',
  entry: ['./src/index.js'],
  output: {
    filename: 'yetch-ponyfill.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Yetch',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}];
