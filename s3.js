'use strict';

var filename = require('./grab').filename,
    _ = require('lodash'),
    Q = require('q'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3({
      params: {
        Bucket: 'slot-shots'
      }
    }),
    url = 'http://slot-shots.s3-website-eu-west-1.amazonaws.com';


function upload(captures) {
  var now = (function() {
    var d = new Date();
    return [
      [d.getFullYear(), _.padLeft(d.getMonth(), 2, 0), d.getDate()].join('-'),
      [d.getHours(), d.getMinutes()].join('')
    ].join('-');
  })();

  var uploads = _.flatten(captures.map(function (capture) {
    return capture.images.map(function (image) {
      var buf = new Buffer(image.base64, 'base64'),
          key = [now, filename(image.url, image.width)].join('/');

      return Q.Promise(function (resolve, reject) {
        s3.upload({
          Key: key,
          Body: buf,
          ACL: 'public-read',
          ContentType: 'image/png'
        }).send(function (err, data) {
          if (err) return reject(err);
          resolve(data);
        });
      });
    });
  }));

  return Q.all(uploads).then(function (uploads) {
    return {
      url: [url, now].join('/'),
      uploads: uploads
    };
  });
}

module.exports = {
  upload: upload
};
