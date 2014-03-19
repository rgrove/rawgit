/*jshint node:true */
"use strict";

var stats = require('../stats');

// -- Public Functions ---------------------------------------------------------
module.exports = function (req, res, next) {
    var fileHits     = (stats.fileCache.get(req.path) || 0) + 1,
        referrer     = req.get('referrer'),
        referrerHits = 0;

    stats.fileCache.set(req.path, fileHits);

    if (referrer) {
        referrer = req.canonicalReferrer = referrer.replace(/\?.*/, '');
        referrerHits = (stats.referrerCache.get(referrer) || 0) + 1;
        stats.referrerCache.set(referrer,  referrerHits);
    }

    req.stats = {
        fileHits    : fileHits,
        referrerHits: referrerHits
    };

    next();
};
