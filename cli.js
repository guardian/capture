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
      base64: argv.s3,
      dir: argv.dir
    };

    return grabber.grab(_.compact(data.split("\n")), options);
  }).progress(function (file) {
    if (argv.v) console.log('capturing', file);
  }).then(function (data) {
    if (argv.s3) {
      return s3.upload(data).then(function (data) {
        if (argv.v) data.uploads.forEach(function (upload) {
          console.log('uploaded', upload.Location);
        });

        console.log('Shots uploaded to', data.url);
        process.exit();
      });
    }

    console.log('Shots saved to', [__dirname, data].join('/'));
    process.exit();
  }).catch(function (e) {
    console.error('error:', e.message);
    process.exit(1);
  });
})();
