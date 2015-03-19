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
    var options = {
      breakpoints: [480, 740, 980, 1300],
      wait: 4000,
      cookies: [{
        'name': '_thunder',
        'value': '1',
        'domain': '.theguardian.com'
      }],
      script: require('./label')
    };

    return grab(_.compact(data.split("\n")), options);
  }).then(function () {
    process.exit();
  }).catch(function (e) {
    console.error(e);
    process.exit(1);
  });
})();
