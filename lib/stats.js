/*jshint node: true */

"use strict";

// Maximum number of stats entries to keep in memory.
var MAX_SIZE = 100;

// Interval in milliseconds at which least-recently-used stats entries will be
// purged.
var PRUNE_INTERVAL = 120000;

// When we started gathering stats.
var SINCE = new Date();

var files     = Object.create(null),
    referrers = Object.create(null);

// -- Private Functions --------------------------------------------------------

// Cleans up the least-recently-used entries in the stats hashes.
function prune() {
    var prunedFiles     = module.exports.files().slice(0, MAX_SIZE),
        prunedReferrers = module.exports.referrers().slice(0, MAX_SIZE);

    files     = Object.create(null);
    referrers = Object.create(null);

    prunedFiles.forEach(function (entry) {
        files[entry.uri] = entry;
    });

    prunedReferrers.forEach(function (entry) {
        referrers[entry.uri] = entry;
    });

    setTimeout(prune, PRUNE_INTERVAL);
}

setTimeout(prune, PRUNE_INTERVAL);

// Records a hit.
function record(req, res) {
    var blacklisted = !!res.get('X-Blacklist'),
        referrer    = req.get('referrer'),
        uri         = req.path,
        fileEntry;

    // Ignore this URI, since it's pinged often as a health check.
    if (uri === '/rgrove/rawgithub/master/web.js') {
        return;
    }

    fileEntry = files[uri] || (files[uri] = {
        blacklisted: false,
        hits       : 0,
        uri        : uri
    });

    fileEntry.blacklisted = blacklisted;
    fileEntry.hits       += 1;

    if (referrer) {
        var referrerEntry;

        referrerEntry = referrers[referrer] || (referrers[referrer] = {
            blacklisted: false,
            hits       : 0,
            uri        : referrer
        });

        referrerEntry.blacklisted = blacklisted;
        referrerEntry.hits += 1;
    }
}

// -- Public Functions ---------------------------------------------------------

module.exports = {
    // Returns an array of most-requested files sorted in descending order by
    // popularity.
    files: function () {
        return Object.keys(files).map(function (uri) {
            return files[uri];
        }).sort(function (a, b) {
            return b.hits - a.hits;
        });
    },

    // Stats-gathering middleware.
    middleware: function (req, res, next) {
        var end = res.end;

        // Wrap res.end() so we can gather stats after a response is finished.
        res.end = function (chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);
            record(req, res);
        };

        next();
    },

    // Returns an array of referrers sorted in descending order by popularity.
    referrers: function () {
        return Object.keys(referrers).map(function (uri) {
            return referrers[uri];
        }).sort(function (a, b) {
            return b.hits - a.hits;
        });
    },

    // Returns a string representation of the time at which we began gathering
    // these stats.
    since: function () {
        return SINCE.toJSON();
    }
};
