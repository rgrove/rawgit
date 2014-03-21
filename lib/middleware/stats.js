/*jshint node:true */
"use strict";

var logParser = require('../log-parser'),
    stats     = require('../stats');

// -- Public Functions ---------------------------------------------------------
module.exports = function (req, res, next) {
    var referrer = req.get('referrer');

    if (referrer) {
        referrer = req.canonicalReferrer = referrer.replace(/\?.*$/, '');
    }

    if (!logParser.enabled) {
        stats.logRequest(req.path, referrer);
    }

    // TODO: Would be nice if we could track response sizes here, but that's a
    // little complicated when we're piping GitHub responses directly to the
    // client.

    next();
};
