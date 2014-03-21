window.rawgithub = (function (doc) {
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

    var filesEl     = doc.getElementById('stats-files'),
        referrersEl = doc.getElementById('stats-referrers'),
        sinceEl     = doc.getElementById('stats-since');

    function escapeHTML(string) {
        return string.replace(/[&<>"'\/`]/g, function (match) {
            return HTML_CHARS[match];
        });
    }

    return {
        loadStats: function (res) {
            var files     = res.data.files,
                referrers = res.data.referrers,
                since     = new Date(res.data.since);

            sinceEl.setAttribute('datetime', since.toISOString());
            sinceEl.textContent = since.toLocaleString();

            files.forEach(function (entry) {
                var tr = doc.createElement('tr');

                if (entry.blacklisted) {
                    tr.className = 'stats-blacklisted';
                }

                var hits = tr.insertCell(-1),
                    hps  = tr.insertCell(-1),
                    kb   = tr.insertCell(-1),
                    kbps = tr.insertCell(-1),
                    url  = tr.insertCell(-1);

                hits.textContent = entry.hits;
                hps.textContent  = entry.hitsPerSecond;
                kb.textContent   = entry.kilobytes;
                kbps.textContent = entry.kilobytesPerSecond;

                var safePath = escapeHTML(entry.path);

                url.innerHTML = '<a rel="nofollow" href="' + safePath + '">' +
                    safePath + '</a>';

                filesEl.appendChild(tr);
            });

            referrers.forEach(function (entry) {
                var tr = doc.createElement('tr');

                if (entry.blacklisted) {
                    tr.className = 'stats-blacklisted';
                }

                var hits = tr.insertCell(-1),
                    hps  = tr.insertCell(-1),
                    kb   = tr.insertCell(-1),
                    kbps = tr.insertCell(-1),
                    url  = tr.insertCell(-1);

                hits.textContent = entry.hits;
                hps.textContent  = entry.hitsPerSecond;
                kb.textContent   = entry.kilobytes;
                kbps.textContent = entry.kilobytesPerSecond;

                var safeUrl = escapeHTML(entry.url);

                url.innerHTML = '<a rel="nofollow" href="' + safeUrl + '">' +
                    safeUrl + '</a>';

                referrersEl.appendChild(tr);
            });
        }
    };
}(document));
