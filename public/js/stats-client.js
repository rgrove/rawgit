window.rawgit = (function (doc) {
  "use strict";

  var filesEl     = doc.getElementById('stats-files');
  var referrersEl = doc.getElementById('stats-referrers');

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

        // var hits = tr.insertCell(-1);
        // var hps  = tr.insertCell(-1);
        // var kb   = tr.insertCell(-1);
        // var kbps = tr.insertCell(-1);
        var url  = tr.insertCell(-1);

        // hits.textContent = entry.hits;
        // hps.textContent  = entry.hitsPerSecond;
        // kb.textContent   = entry.kilobytes;
        // kbps.textContent = entry.kilobytesPerSecond;

        var link = doc.createElement('a');

        link.href        = entry.path;
        link.rel         = 'nofollow';
        link.textContent = entry.path;

        url.appendChild(link);
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

        // var hits = tr.insertCell(-1);
        // var hps  = tr.insertCell(-1);
        // var kb   = tr.insertCell(-1);
        // var kbps = tr.insertCell(-1);
        var url  = tr.insertCell(-1);

        // hits.textContent = entry.hits;
        // hps.textContent  = entry.hitsPerSecond;
        // kb.textContent   = entry.kilobytes;
        // kbps.textContent = entry.kilobytesPerSecond;

        var link = doc.createElement('a');

        link.href        = entry.url;
        link.rel         = 'nofollow';
        link.textContent = entry.url;

        url.appendChild(link);
        referrersEl.appendChild(tr);
      });
    }
  };
}(document));
