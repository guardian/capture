'use strict';

var phantom = require('phantom'),
    Q = require('q'),
    _ = require('lodash'),
    urllib = require('url'),
    label = require('./label'),
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
 * start a browser session
 *
 * @param  {string} url
 * @param  {number} width
 * @return {Promise<page>}
 */
function open(url, width) {
  var wait = 2500;

  return Q.Promise(function (resolve, reject) {
    phantom.create(function (session) {
      session.createPage(function (page) {
        page.set('viewportSize', { width: width, height: 1000 });

        page.open(url, function (status) {
          if (status === 'fail') {
            phantom.exit();
            return reject();
          }

          page.evaluate(label);
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

module.exports = function (urls) {
  var sessions = _.flatten(urls.map(function (url) {
    return breakpoints.map(function (width) {
      return { url: url, width: width };
    });
  })).map(function (capture) {
    return open(capture.url, capture.width);
  });

  return Q.Promise(function (resolve) {
    Q.all(sessions).done(function (pages) {
      pages.forEach(capture);
      resolve();
    });
  });
};
