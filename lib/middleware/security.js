/*jshint node:true */

/**
Sets security-related response headers.

@module middleware/security
**/

"use strict";

module.exports = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    next();
};
