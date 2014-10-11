/*global cdnDomain, devDomain*/
(function (doc) {

"use strict";

var REGEX_GIST_URL = /^(https?):\/\/gist\.github\.com\/(.+?)\/([^\/]+)/i;
var REGEX_RAW_URL  = /^(https?):\/\/(?:gist|raw)\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i;
var REGEX_REPO_URL = /^(https?):\/\/github\.com\/(.+?)\/(.+?)\/(?:blob|raw)\/(.+?\/.+)/i;

var devEl  = doc.getElementById('url-dev');
var prodEl = doc.getElementById('url-prod');
var urlEl  = doc.getElementById('url');

urlEl.addEventListener('input', function () {
    var url = urlEl.value.trim();

    if (REGEX_RAW_URL.test(url)) {
        urlEl.classList.remove('invalid');
        urlEl.classList.add('valid');

        devEl.value  = encodeURI(url.replace(REGEX_RAW_URL, '$1://' + devDomain + '/$2/$3'));
        prodEl.value = encodeURI(url.replace(REGEX_RAW_URL, '$1://' + cdnDomain + '/$2/$3'));

        devEl.classList.add('valid');
        prodEl.classList.add('valid');
    } else if (REGEX_REPO_URL.test(url)) {
        urlEl.classList.remove('invalid');
        urlEl.classList.add('valid');

        devEl.value  = encodeURI(url.replace(REGEX_REPO_URL, '$1://' + devDomain + '/$2/$3/$4'));
        prodEl.value = encodeURI(url.replace(REGEX_REPO_URL, '$1://' + cdnDomain + '/$2/$3/$4'));

        devEl.classList.add('valid');
        prodEl.classList.add('valid');
    } else if (REGEX_GIST_URL.test(url)) {
        urlEl.classList.remove('invalid');
        urlEl.classList.add('valid');

        devEl.value  = encodeURI(url.replace(REGEX_GIST_URL, '$1://' + devDomain + '/$2/$3/raw/'));
        prodEl.value = encodeURI(url.replace(REGEX_GIST_URL, '$1://' + cdnDomain + '/$2/$3/raw/'));

        devEl.classList.add('valid');
        prodEl.classList.add('valid');
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
