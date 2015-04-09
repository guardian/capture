'use strict';

var filename = require('./grab').filename,
    _ = require('lodash'),
    Q = require('q'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3({
      params: {
        Bucket: 'slot-shots'
      }
    });

function upload(captures) {
  var uploads = _.flatten(captures.map(function (capture) {
    return capture.images.map(function (image) {
      var buf = new Buffer(image.base64, 'base64'),
          key = filename(image.url, image.width);

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

  return Q.all(uploads);
}

module.exports = {
  upload: upload
};
