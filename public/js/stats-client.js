window.rawgit = (function (doc) {
  "use strict";

  var HTML_CHARS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;'
  };

  var filesEl     = doc.getElementById('stats-files');
  var referrersEl = doc.getElementById('stats-referrers');

  function escapeHTML(string) {
    return string.replace(/[&<>"'\/`]/g, function (match) {
      return HTML_CHARS[match];
    });
  }

  return {
    loadStats: function (res) {
      var files     = res.data.files;
      var referrers = res.data.referrers;

      files.forEach(function (entry) {
        var tr = doc.createElement('tr');

        if (entry.naughtiness >= 3) {
          tr.className = 'stats-shitlisted';
        } else if (entry.naughtiness >= 1) {
          tr.className = 'stats-blacklisted';
        } else if (entry.naughtiness >= 0.5) {
          tr.className = 'stats-throttled';
        }

        tr.title = 'Naughtiness: ' + entry.naughtiness;

        var hits = tr.insertCell(-1);
        var hps  = tr.insertCell(-1);
        var kb   = tr.insertCell(-1);
        var kbps = tr.insertCell(-1);
        var url  = tr.insertCell(-1);

        hits.textContent = entry.hits;
        hps.textContent  = entry.hitsPerSecond;
        kb.textContent   = entry.kilobytes;
        kbps.textContent = entry.kilobytesPerSecond;

        var safePath = escapeHTML(entry.path);

        url.innerHTML = '<a rel="nofollow" href="' + safePath + '">' + safePath + '</a>';

        filesEl.appendChild(tr);
      });

      referrers.forEach(function (entry) {
        var tr = doc.createElement('tr');

        if (entry.naughtiness >= 3) {
          tr.className = 'stats-shitlisted';
        } else if (entry.naughtiness >= 1) {
          tr.className = 'stats-blacklisted';
        } else if (entry.naughtiness >= 0.5) {
          tr.className = 'stats-throttled';
        }

        tr.title = 'Naughtiness: ' + entry.naughtiness;

        var hits = tr.insertCell(-1);
        var hps  = tr.insertCell(-1);
        var kb   = tr.insertCell(-1);
        var kbps = tr.insertCell(-1);
        var url  = tr.insertCell(-1);

        hits.textContent = entry.hits;
        hps.textContent  = entry.hitsPerSecond;
        kb.textContent   = entry.kilobytes;
        kbps.textContent = entry.kilobytesPerSecond;

        var safeUrl = escapeHTML(entry.url);

        url.innerHTML = '<a rel="nofollow" href="' + safeUrl + '">' + safeUrl + '</a>';

        referrersEl.appendChild(tr);
      });
    }
  };
}(document));
