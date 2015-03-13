'use strict';

var fs = require('fs'),
    express = require('express'),
    Q = require('q'),
    app = express();

app.use(express.static(__dirname + '/static'));

module.exports = {
  start: function () {
    return Q.Promise(function (resolve) {
      app.listen(3000, function () {
        resolve();
      });
    });
  }
};
