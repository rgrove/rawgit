"use strict";

const logParser = require('../log-parser');
const stats     = require('../stats');

module.exports = (req, res, next) => {
  if (req.isCDN) {
    return void next();
  }

  let referrer = req.get('referrer');

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
