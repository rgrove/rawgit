/* global cdnDomain, devDomain */
(function (doc) {
  "use strict";

  var REGEX_GIST_URL = /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+\..+)$/i;
  var REGEX_RAW_URL  = /^(https?):\/\/raw\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+\..+)/i;
  var REGEX_REPO_URL = /^(https?):\/\/github\.com\/(.[^\/]+?)\/(.[^\/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i;

  var devEl  = doc.getElementById('url-dev');
  var prodEl = doc.getElementById('url-prod');
  var urlEl  = doc.getElementById('url');
  
  var devBtn = doc.getElementById('url-dev-btn');
  var prodBtn = doc.getElementById('url-prod-btn');
  var clipboard = new Clipboard(".clipboard-btn");
  
  if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    devBtn.style.display = "inline-block";
    prodBtn.style.display = "inline-block";
  }

  urlEl.addEventListener('input', function () {
    var url = urlEl.value.trim();

    if (REGEX_RAW_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_RAW_URL, '$1://' + devDomain + '/$2/$3');
      prodEl.value = url.replace(REGEX_RAW_URL, '$1://' + cdnDomain + '/$2/$3');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devBtn.disabled = false;
      prodBtn.disabled = false;
    } else if (REGEX_REPO_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_REPO_URL, '$1://' + devDomain + '/$2/$3/$4');
      prodEl.value = url.replace(REGEX_REPO_URL, '$1://' + cdnDomain + '/$2/$3/$4');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devBtn.disabled = false;
      prodBtn.disabled = false;
    } else if (REGEX_GIST_URL.test(url)) {
      urlEl.classList.remove('invalid');
      urlEl.classList.add('valid');

      devEl.value  = url.replace(REGEX_GIST_URL, '$1://' + devDomain + '/$2');
      prodEl.value = url.replace(REGEX_GIST_URL, '$1://' + cdnDomain + '/$2');

      devEl.classList.add('valid');
      prodEl.classList.add('valid');

      devBtn.disabled = false;
      prodBtn.disabled = false;
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

      devBtn.disabled = true;
      prodBtn.disabled = true;
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
