/*jshint node:true */

"use strict";

var config = require('../../conf'),
    path   = require('path');

// Redirects requests for non-whitelisted file extensions directly to GitHub,
// since there's no value in proxying them.
module.exports = function (rootUrl) {
    return function (req, res, next) {
        var extension = path.extname(req.path).toLowerCase();

        if (req.isCDN || config.extensionWhitelist[extension]) {
            next();
            return;
        }

        res.setHeader('Cache-Control', 'max-age=2592000'); // 30 days
        res.redirect(301, rootUrl + req.url);
    };
};
