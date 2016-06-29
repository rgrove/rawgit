"use strict";

const config = require('../../conf');
const path   = require('path');

// Redirects requests for non-whitelisted file extensions directly to GitHub,
// since there's no value in proxying them.
module.exports = rootUrl => {
  return (req, res, next) => {
    if (req.isCDN) {
      return void next();
    }

    if (config.extensionWhitelist[path.extname(req.path).toLowerCase()]) {
      return void next();
    }

    if (/\/$/.test(req.path)) {
      return void next();
    }

    res.set('Cache-Control', 'max-age=2592000'); // 30 days
    res.redirect(301, rootUrl + req.url);
  };
};
