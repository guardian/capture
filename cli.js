'use strict';

var grabber = require('./grab'),
    s3 = require('./s3'),
    fs = require('fs'),
    _ = require('lodash'),
    Q = require('q'),
    argv = require('minimist')(process.argv.slice(2));

(function main() {
  var file = argv._[0];

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
      script: require('./label'),
      base64: argv.aws
    };

    return grabber.grab(_.compact(data.split("\n")), options);
  }).progress(function (file) {
    console.log('capturing', file);
  }).then(function (captures) {
    if (argv.aws && captures) {
      return s3.upload(captures).then(function (results) {
        results.forEach(function (result) {
          console.log('uploaded', result.Location);
        });

        process.exit();
      });
    }

    process.exit();
  }).catch(function (e) {
    console.error('error:', e.message);
    process.exit(1);
  });
})();
