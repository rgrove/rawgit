"use strict";

const {
  extensionBlacklist,
  extensionWhitelist
} = require('../../conf');

const path = require('path');

// Redirects requests for blacklisted or non-whitelisted file extensions
// directly to GitHub, since there's no value in proxying them.
module.exports = rootUrl => {
  return (req, res, next) => {
    if (req.path.endsWith('/')) {
      return void next();
    }

    let extension = path.extname(req.path).toLowerCase();

    if (!extensionBlacklist.has(extension)) {
      if (req.isCDN || extensionWhitelist.has(extension)) {
        return void next();
      }
    }

    res.set('Cache-Control', 'max-age=2592000'); // 30 days
    res.redirect(301, rootUrl + req.url);
  };
};
