'use strict';

var phantom = require('phantom'),
    Q = require('q'),
    _ = require('lodash'),
    urllib = require('url');

/**
 * generate a filename for a screenshot
 *
 * @param  {string} url
 * @param  {number} width
 * @return {string}
 */
function filename(url, width, dir) {
  var ext = '.png';

  url = urllib.parse(url);

  return (dir ? dir + '/' : '') + url.host +
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
function open(url, width, options) {
  var wait = options.wait || 1000;

  return Q.Promise(function (resolve, reject) {
    phantom.create({ onStdout: function () {} }, function (session) {
      session.createPage(function (page) {
        if (options.cookies) {
          session.set('cookies', options.cookies);
        }

        page.set('viewportSize', { width: width, height: 1000 });
        page.set('onConsoleMessage', function () {});

        page.open(url, function (status) {
          if (status === 'fail') {
            phantom.exit();
            return reject();
          }

          page.url = url;
          page.width = width;

          setTimeout(function () {
            if (options.script) {
              page.evaluate(options.script);
            }

            resolve(page);
          }, wait);
        });
      });
    });
  });
}

function capture(page, dir) {
  var file = filename(page.url, page.width, dir);
  page.render(file);
  return file;
}

function captureBase64(page) {
  return Q.Promise(function (resolve) {
    page.renderBase64('PNG', function (data) {
      resolve({
        url: page.url,
        width: page.width,
        base64: data
      });
    });
  });
}

module.exports = {
  grab: function (urls, options) {
    var dir = options.dir || 'screenshots';

    return Q.Promise(function (resolve, reject, notify) {
      if (!options.breakpoints) {
        return reject(new Error('No breakpoints provided'));
      }

      var sessions = _.flatten(urls.map(function (url) {
        return options.breakpoints.map(function (width) {
          return { url: url, width: width };
        });
      })).map(function (capture) {
        return open(capture.url, capture.width, options);
      });

      Q.all(sessions).done(function (pages) {
        if (options.base64) {
          return Q.all(pages.map(captureBase64)).then(function (data) {
            resolve(urls.map(function (url) {
              return {
                url: url,
                images: data.filter(function (d) { return d.url === url; })
              };
            }));
          });
        }

        pages.forEach(function (page) {
          notify(capture(page, dir));
        });

        resolve(dir);
      });
    });
  },

  filename: filename
};
