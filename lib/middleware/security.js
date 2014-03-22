/*jshint node:true */

/**
Sets security-related response headers.

@module middleware/security
**/

"use strict";

module.exports = function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options'     : 'nosniff'
    });

    next();
};
