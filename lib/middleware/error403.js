/*jshint node:true */

"use strict";

var config = require('../../conf');

// Sends a generic 403 Forbidden response.
module.exports = function (req, res) {
    res.status(403);

    if (req.accepts('html')) {
        res.sendfile(config.publicDir + '/errors/403.html');
        return;
    }

    res.type('txt').send('Not cool, man.');
};
