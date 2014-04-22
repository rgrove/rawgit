/*jshint node:true */

"use strict";

// Sets the X-Robots-Tag response header to disallow indexing and following.
module.exports = function (req, res, next) {
    res.setHeader('X-Robots-Tag', 'none');
    next();
};
