/*jshint node:true */

"use strict";

var blacklist = require('../blacklist'),
    config    = require('../../conf'),
    path      = require('path');

// Sends a 403 response for blacklisted URIs.
function deny(req, res) {
    res.set('Cache-Control', 'public, max-age=86400'); // 1 day
    res.type('txt').send(403, 'The requested URI has been blacklisted due to abuse.');
}

// Serves up evil.js or evil.css, or just a 403, depending on the requested
// filename.
function evil(req, res) {
    var extname = path.extname(req.path).toLowerCase();

    if (extname === '.js') {
        res.sendfile(config.publicDir + '/js/evil.js', {
            maxAge: 86400000 // 1 day
        });
    } else if (extname === '.css') {
        res.sendfile(config.publicDir + '/css/evil.css', {
            maxAge: 86400000 // 1 day
        });
    } else {
        deny(req, res);
    }
}

// Checks the blacklist to see if this request should be denied.
module.exports = function (req, res, next) {
    if (!blacklist.referrers.length && !blacklist.uris.length) {
        next();
        return;
    }

    var i, len, uri;

    // Check the URI blacklist. Blacklisted URIs are served a 403 Forbidden
    // response, but won't receive evil.js or evil.css.
    for (i = 0, len = blacklist.uris.length; i < len; i++) {
        uri = blacklist.uris[i];

        if (typeof uri === 'string') {
            if (uri === req.path) {
                res.set('X-Blacklist', 'uri');
                deny(req, res);
                return;
            }
        } else {
            if (uri.test(req.path)) {
                res.set('X-Blacklist', 'uri');
                deny(req, res);
                return;
            }
        }
    }

    var referrer = req.get('referrer'),
        badReferrer;

    if (!referrer) {
        next();
        return;
    }

    // Check the referrer blacklist. Requests from blacklisted referrers
    // will receive evil.js or evil.css.
    for (i = 0, len = blacklist.referrers.length; i < len; i++) {
        badReferrer = blacklist.referrers[i];

        if (typeof badReferrer === 'string') {
            if (badReferrer === referrer) {
                res.set('X-Blacklist', 'referrer');
                evil(req, res);
                return;
            }
        } else {
            if (badReferrer.test(referrer)) {
                res.set('X-Blacklist', 'referrer');
                evil(req, res);
                return;
            }
        }
    }

    next();
};
