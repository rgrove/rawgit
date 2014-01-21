/*jshint node:true */

"use strict";

var config = require('../../conf'),
    path   = require('path');

// Redirects requests for non-whitelisted file extensions directly to
// GitHub, since there's no value in proxying them.
module.exports = function (rootUrl) {
    return function (req, res, next) {
        if (config.extensionWhitelist[path.extname(req.path).toLowerCase()]) {
            next();
            return;
        }

        res.set('Cache-Control', 'max-age=157680000'); // 5 years
        res.redirect(301, rootUrl + req.url);
    };
};
