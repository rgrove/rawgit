/* global Clipboard, cdnDomain, devDomain */
(function (doc) {
  "use strict";

  var GITHUB_API_URL = 'https://api.github.com';

  var REGEX_GIST_URL     = /^https?:\/\/gist\.github\.com\/.+?\/([0-9a-f]+)(?:\/([0-9a-f]+))?/i;
  var REGEX_RAW_GIST_URL = /^https?:\/\/gist\.githubusercontent\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+\..+)$/i;
  var REGEX_RAW_REPO_URL = /^https?:\/\/raw\.github(?:usercontent)?\.com\/([^/]+\/[^/]+\/[^/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+\..+)/i;
  var REGEX_REPO_URL     = /^https?:\/\/github\.com\/(.[^/]+?)\/(.[^/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i;

  var copyButtonDev  = doc.getElementById('url-dev-copy');
  var copyButtonProd = doc.getElementById('url-prod-copy');
  var inputDev       = doc.getElementById('url-dev');
  var inputProd      = doc.getElementById('url-prod');
  var inputUrl       = doc.getElementById('url');

  new Clipboard('.url-copy-button');

  if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
    copyButtonDev.style.display  = 'inline-block';
    copyButtonProd.style.display = 'inline-block';
  }

  inputDev.addEventListener('focus', onInputFocus);
  inputProd.addEventListener('focus', onInputFocus);
  inputUrl.addEventListener('input', formatUrl);

  formatUrl();

  window.handleGistResponse = function (res) {
    if (!res) {
      return void setInvalid();
    }

    var status = res.meta && res.meta.status;

    if (status !== 200) {
      return void setInvalid();
    }

    var files     = res.data && res.data.files;
    var filenames = files && Object.keys(res.data.files);

    if (!filenames || !filenames.length) {
      return void setInvalid();
    }

    var rawUrl = files[filenames[0]] && files[filenames[0]].raw_url;

    if (rawUrl) {
      formatRawGistUrl(rawUrl);
    } else {
      setInvalid();
    }
  };

  function formatRawGistUrl(url) {
    inputDev.value  = url.replace(REGEX_RAW_GIST_URL, 'https://' + devDomain + '/$1');
    inputProd.value = url.replace(REGEX_RAW_GIST_URL, 'https://' + cdnDomain + '/$1');

    setValid();
  }

  function formatRawRepoUrl(url) {
    inputDev.value  = url.replace(REGEX_RAW_REPO_URL, 'https://' + devDomain + '/$1/$2');
    inputProd.value = url.replace(REGEX_RAW_REPO_URL, 'https://' + cdnDomain + '/$1/$2');

    setValid();
  }

  function formatRepoUrl(url) {
    inputDev.value  = url.replace(REGEX_REPO_URL, 'https://' + devDomain + '/$1/$2/$3');
    inputProd.value = url.replace(REGEX_REPO_URL, 'https://' + cdnDomain + '/$1/$2/$3');

    setValid();
  }

  function formatUrl() {
    var url = inputUrl.value.trim();

    if (REGEX_RAW_REPO_URL.test(url)) {
      formatRawRepoUrl(url);
    } else if (REGEX_RAW_GIST_URL.test(url)) {
      formatRawGistUrl(url);
    } else if (REGEX_REPO_URL.test(url)) {
      formatRepoUrl(url);
    } else if (REGEX_GIST_URL.test(url)) {
      requestGistUrl(url);
    } else {
      setInvalid();
    }
  }

  function onInputFocus(e) {
    setTimeout(function () {
      e.target.select();
    }, 1);
  }

  function requestGistUrl(url) {
    var matches = url.match(REGEX_GIST_URL);
    var script  = doc.createElement('script');

    script.src = GITHUB_API_URL + '/gists/' + matches[1]
      + (matches[2] ? '/' + matches[2] : '')
      + '?callback=handleGistResponse';

    doc.head.appendChild(script);
  }

  function setInvalid() {
    copyButtonDev.disabled  = true;
    copyButtonProd.disabled = true;

    inputUrl.classList.remove('valid');

    if (inputUrl.value.trim().length) {
      inputUrl.classList.add('invalid');
    } else {
      inputUrl.classList.remove('invalid');
    }

    inputDev.value  = '';
    inputProd.value = '';

    inputDev.classList.remove('valid');
    inputProd.classList.remove('valid');
  }

  function setValid() {
    copyButtonDev.disabled  = false;
    copyButtonProd.disabled = false;

    inputUrl.classList.remove('invalid');

    inputDev.classList.add('valid');
    inputProd.classList.add('valid');
    inputUrl.classList.add('valid');
  }
}(document));
