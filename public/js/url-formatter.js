(function (doc) {

"use strict";

var REGEX_URL = /^(https?):\/\/(?:gist|raw)\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\//i;

var devEl  = doc.getElementById('url-dev'),
    prodEl = doc.getElementById('url-prod'),
    urlEl  = doc.getElementById('url');

urlEl.addEventListener('input', function () {
    var url = urlEl.value.trim();

    if (REGEX_URL.test(url)) {
        urlEl.classList.remove('invalid');
        urlEl.classList.add('valid');

        devEl.value  = encodeURI(url.replace(REGEX_URL, '$1://rawgit.com/$2/'));
        prodEl.value = encodeURI(url.replace(REGEX_URL, '$1://cdn.rawgit.com/$2/'));
    } else {
        urlEl.classList.remove('valid');

        if (url.length) {
            urlEl.classList.add('invalid');
        } else {
            urlEl.classList.remove('invalid');
        }

        devEl.value  = '';
        prodEl.value = '';
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
