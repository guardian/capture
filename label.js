module.exports = function() {
  var style = document.createElement('style'),
      cover = document.createElement('div'),
      css = '.cover { position: absolute; z-index: 99999999; width: 100%; height: 100%; top: 0; background: black; opacity: 0.75 }' +
            '.ad-slot { position: relative; z-index: 999999999 }' +
            '.ad-slot:after, .ad-slot-clone:after { content: attr(data-name); position: relative; z-index: 9999999999; font-size: 6em; font-weight: bold; background: #FFFC7F; font-family: helvetica,arial,sans-serif; color: #555; text-align: center; display: block }';

  function makeClone(slot) {
    var clone = slot.cloneNode(),
        rect = slot.getBoundingClientRect();

    clone.classList.add('ad-slot-clone');
    clone.style.position = 'absolute';
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.height = slot.clientHeight + 'px';

    slot.parentElement.removeChild(slot);

    return document.getElementsByTagName('body')[0].appendChild(clone);
  }

  function addLabel(slot) {
    var label = document.createElement('div');

    label.classList.add('ad-slot-label2');
    label.innerHTML = slot.dataset.name;

    return slot.appendChild(label);
  }

  style.type = 'text/css';
  style.innerHTML = css;
  cover.classList.add('cover');

  document.head.appendChild(style);
  document.body.appendChild(cover);

  [].forEach.call(document.body.getElementsByClassName('ad-slot'), function (slot) {
    if (/inline[0-9]/gi.test(slot.className)) {
      slot = makeClone(slot);
    }

    // addLabel(slot);
  });
};
