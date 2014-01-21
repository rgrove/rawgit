/*jshint node:true */

"use strict";

module.exports = {
    // Whitelist of file extensions that will be proxied through rawgithub.com.
    // All others will be redirected to raw.github.com.
    extensionWhitelist: {
         '.css' : true,
         '.htm' : true,
         '.html': true,
         '.js'  : true,
         '.json': true,
         '.rss' : true,
         '.svg' : true,
         '.swf' : true,
         '.xml' : true
    },

    // Public directory containing static files.
    publicDir: require('fs').realpathSync(__dirname + '/../public'),

    // Array of request header names that should be relayed from the user to
    // GitHub.
    relayRequestHeaders: [
        'Accept',
        'Accept-Charset',
        'If-Modified-Since',
        'If-None-Match',
        'User-Agent'
    ],

    // Array of request header names that should be relayed from GitHub to the
    // user.
    relayResponseHeaders: [
        'Date',
        'ETag'
    ]
};
