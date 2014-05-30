/*jshint node:true */

/**
Sets access control headers.

@module middleware/access-control
**/

"use strict";

module.exports = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle preflight requests.
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
        res.setHeader('Content-Length', 0);

        return void res.send();
    }

    next();
};
