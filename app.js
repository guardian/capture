'use strict';

var grab = require('./grab'),
    fs = require('fs'),
    _ = require('lodash'),
    Q = require('q');

(function main() {
  var file = process.argv[2];

  if (!file) {
    console.log('please provide a filename');
    process.exit(1);
  }

  Q.nfcall(fs.readFile, file, 'utf8').then(function (data) {
    return grab(_.compact(data.split("\n")));
  }).then(function () {
    process.exit();
  }).catch(function (e) {
    console.error(e);
    process.exit(1);
  });
})();
