'use strict';

var Babel = require('babel-core');
var Btoa = require('btoa');

module.exports = [{
  ext: '.js',
  transform: function transform(content, filename) {

    if (filename.indexOf('node_modules') === -1) {
      var result = Babel.transform(content, {
        sourceMap: 'inline',
        filename: filename,
        sourceFileName: filename
      });
      return result.code;
    }

    return content;
  }
}];