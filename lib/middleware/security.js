/*jshint node:true */

/**
Sets security-related response headers.

@module middleware/security
**/

"use strict";

module.exports = function (req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
};
