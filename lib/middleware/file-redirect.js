"use strict";

const config = require('../../conf');
const path   = require('path');

const { extensionWhitelist } = config;

// Redirects requests for non-whitelisted file extensions directly to GitHub,
// since there's no value in proxying them.
module.exports = rootUrl => {
  return (req, res, next) => {
    if (req.isCDN || req.path.endsWith('/')) {
      return void next();
    }

    let extension = path.extname(req.path).toLowerCase();

    if (extensionWhitelist.has(extension)) {
      return void next();
    }

    res.set('Cache-Control', 'max-age=2592000'); // 30 days
    res.redirect(301, rootUrl + req.url);
  };
};
