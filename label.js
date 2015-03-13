module.exports = function() {
  var css = '.cover { position: absolute; z-index: 99999999; width: 100%; height: 100%; top: 0; background: black; opacity: 0.6 }',
      style = document.createElement('style'),
      cover = document.createElement('div');

  style.type = 'text/css';
  style.innerHTML = css;

  cover.classList.add('cover');

  console.log('darkening');

  document.getElementsByTagName('head')[0].appendChild(style);
  document.getElementsByTagName('body')[0].appendChild(cover);
};
