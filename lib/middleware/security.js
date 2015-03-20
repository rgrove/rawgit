/**
Sets security-related response headers.
**/

"use strict";

module.exports = function (req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
};
