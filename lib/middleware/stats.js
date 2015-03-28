"use strict";

var logParser = require('../log-parser');
var stats     = require('../stats');

module.exports = function (req, res, next) {
    if (req.isCDN) {
        return void next();
    }

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
