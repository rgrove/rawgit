/*jshint node:true */

"use strict";

var path = require('path');

module.exports = {
    // Whitelist of file extensions that will be proxied through rawgithub.com.
    // All others will be redirected to raw.github.com.
    extensionWhitelist: {
        '.coffee': true,
        '.css'   : true,
        '.eot'   : true,
        '.htm'   : true,
        '.html'  : true,
        '.js'    : true,
        '.json'  : true,
        '.kml'   : true,
        '.otf'   : true,
        '.rss'   : true,
        '.svg'   : true,
        '.swf'   : true,
        '.ttc'   : true,
        '.ttf'   : true,
        '.woff'  : true,
        '.xml'   : true
    },

    // Public directory containing static files.
    publicDir: path.join(__dirname, '/../public'),

    // Array of request header names that should be relayed from the user to
    // GitHub.
    relayRequestHeaders: [
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
