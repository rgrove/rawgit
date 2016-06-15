/* global Clipboard, cdnDomain, devDomain */
(function (doc) {
  "use strict";

  var REGEX_GIST_URL = /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+\..+)$/i;
  var REGEX_RAW_URL  = /^(https?):\/\/raw\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+\..+)/i;
  var REGEX_REPO_URL = /^(https?):\/\/github\.com\/(.[^\/]+?)\/(.[^\/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i;

  var devEl  = doc.getElementById('url-dev');
  var prodEl = doc.getElementById('url-prod');
  var urlEl  = doc.getElementById('url');

  new Clipboard('.url-copy-button');

  var devCopyButton  = doc.getElementById('url-dev-copy');
  var prodCopyButton = doc.getElementById('url-prod-copy');

  if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
    devCopyButton.style.display  = 'inline-block';
    prodCopyButton.style.display = 'inline-block';
  }

  urlEl.addEventListener('input', function () {
    var url = urlEl.value.trim();

    if (REGEX_RAW_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_RAW_URL, 'https://' + devDomain + '/$2/$3');
      prodEl.value = url.replace(REGEX_RAW_URL, 'https://' + cdnDomain + '/$2/$3');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devCopyButton.disabled  = false;
      prodCopyButton.disabled = false;
    } else if (REGEX_REPO_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_REPO_URL, 'https://' + devDomain + '/$2/$3/$4');
      prodEl.value = url.replace(REGEX_REPO_URL, 'https://' + cdnDomain + '/$2/$3/$4');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devCopyButton.disabled  = false;
      prodCopyButton.disabled = false;
    } else if (REGEX_GIST_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_GIST_URL, 'https://' + devDomain + '/$2');
      prodEl.value = url.replace(REGEX_GIST_URL, 'https://' + cdnDomain + '/$2');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devCopyButton.disabled  = false;
      prodCopyButton.disabled = false;
    } else {
      urlEl.classList.remove('valid');

      if (url.length) {
        urlEl.classList.add('invalid');
      } else {
        urlEl.classList.remove('invalid');
      }

      devEl.value  = '';
      prodEl.value = '';

      devEl.classList.remove('valid');
      prodEl.classList.remove('valid');

      devCopyButton.disabled  = true;
      prodCopyButton.disabled = true;
    }
  }, false);

  devEl.addEventListener('focus', onFocus);
  prodEl.addEventListener('focus', onFocus);

  function onFocus(e) {
    setTimeout(function () {
      e.target.select();
    }, 1);
  }
}(document));
