/*jshint node:true */

/**
Automatically throttles and blacklists naughty requests.

@module middleware/auto-throttle
**/

"use strict";

var config = require('../../conf'),
    path   = require('path'),
    stats  = require('../stats');

module.exports = function (req, res, next) {
    if (req.isCDN || !config.autoThrottle) {
        next();
        return;
    }

    var file        = stats.file(req.path),
        referrer    = stats.referrer(req.canonicalReferrer),
        naughtiness = Math.max(file.naughtiness, referrer.naughtiness);

    res.set('RawGit-Naughtiness', naughtiness);

    if (naughtiness >= 3) {
        evil(req, res);
        return;
    }

    if (naughtiness >= 1) {
        // Let this request stew a while (up to about 20 seconds) before we
        // respond with an error.
        setTimeout(function () {
            blacklist(req, res);
        }, 20000 * naughtiness);

        return;
    }

    if (naughtiness >= 0.5) {
        // Let this request stew a while (up to about 20 seconds) before we
        // respond.
        res.set('RawGit-Message', "Please enhance your calm or this request will be blacklisted soon.");

        setTimeout(next, 20000 * naughtiness);
        return;
    }

    next();
};

// -- Private Functions --------------------------------------------------------

function blacklist(req, res) {
    res.set({
        'Cache-Control'     : 'max-age=86400', // one day
        'RawGit-Blacklisted': 'yup'
    });

    if (req.accepts('html')) {
        res.sendfile(path.join(config.publicDir, '/errors/blacklisted.html'));
        return;
    }

    res.type('txt').send('This request has been blacklisted. Stop abusing rawgit.com or worse things will happen soon.');
}

function evil(req, res) {
    res.set({
        'Cache-Control'     : 'max-age=15778476', // 6 months
        'RawGit-Blacklisted': 'yup'
    });

    switch (path.extname(req.path).toLowerCase()) {
    case '.css':
        res.sendfile(path.join(config.publicDir, '/css/evil.css'));
        return;

    case '.html': // fallthrough
    case '.htm':
        res.sendfile(path.join(config.publicDir, '/evil.html'));
        return;

    case '.js':
        res.sendfile(path.join(config.publicDir, '/js/evil.js'));
        return;

    default:
        res.type('txt').send('This request has been blacklisted. Stop abusing rawgit.com.');
    }
}
