'use strict';

var phantom = require('phantom'),
    Q = require('q'),
    _ = require('lodash'),
    urllib = require('url'),
    fs = require('fs'),
    breakpoints = [480, 740, 980];


/**
 * generate a filename for a screenshot
 *
 * @param  {string} url
 * @param  {number} width
 * @return {string}
 */
function filename(url, width) {
  var ext = '.png',
      path = 'screenshots';

  url = urllib.parse(url);

  return path + '/' + url.host +
         url.path.replace(/\/$/, '').replace(/\//g, '-') +
         '_' + width + ext;
}

/**
 * open a url
 *
 * @param  {string} url
 * @return {Promise<page>}
 */
function open(url, width) {
  var wait = 2000;

  return Q.Promise(function (resolve, reject) {
    phantom.create(function (session) {
      session.createPage(function (page) {
        page.set('viewportSize', { width: width, height: 1000 });

        page.open(url, function (status) {
          if (status === 'fail') {
            phantom.exit();
            return reject();
          }

          page.url = url;
          page.width = width;

          setTimeout(function () {
            resolve(page);
          }, wait);
        });
      });
    });
  });
}

function capture(page) {
  var file = filename(page.url, page.width);

  console.log('capturing', file);
  page.render(file);
}

(function main() {
  var file = process.argv[2];

  if (!file) {
    console.log('please provide a filename');
    process.exit(1);
  }

  Q.nfcall(fs.readFile, file, 'utf8').then(function (data) {
    var urls = _.compact(data.split("\n")),
        sessions = _.flatten(urls.map(function (url) {
          return breakpoints.map(function (width) {
            return { url: url, width: width };
          });
        })).map(function (capture) {
          return open(capture.url, capture.width);
        });

    Q.all(sessions).done(function (pages) {
      pages.forEach(capture);
      process.exit();
    });
  }).catch(function (e) {
    console.error(e);
    process.exit(1);
  });
})();
