/**
Sets security-related response headers.
**/

"use strict";

module.exports = (req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
};
