'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    stylus = require('stylus'),
    grabber = require('./grab'),
    app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(stylus.middleware(__dirname + '/static'));
app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/grab', function (req, res) {
  var urls = _.compact(req.body.urls.split(/\r?\n/)),
      options = {
        breakpoints: [480, 740, 980, 1300],
        wait: 4000,
        base64: true,
        script: require('./label')
      };

  grabber.grab(urls, options).then(function (pages) {
    res.render('images', { pages: pages });
  });
});

app.listen(3000, function() {
  console.log('running');
});
