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

    // This multiplier is used to determine the naughtiness of a given request
    // based on internal stats about the requested file and the referrer.
    //
    // Naughtiness for files is determined by this formula:
    //
    //     requests * requestsPerSecond * totalKilobytes * multiplier
    //
    // Naughtiness for referrers is determined by this formula:
    //
    //     requests * requestsPerSecond * totalKilobytes * multiplier * 0.5
    //
    // Referrers get a little more leeway since they're often legitimately
    // requesting multiple files per page.
    //
    // The end result is that large files requested rarely are fine. Small files
    // requested fairly often but not too often are fine. But large files
    // requested often and small files requested abusively often are not fine.
    //
    // This multiplier is calibrated such that a naughtiness score of >= 0.5
    // probably indicates requests should be throttled, and a score of >= 1.0
    // probably indicates requests should be blacklisted.
    naughtinessMultiplier: 0.0000025,

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
    ],

    // If rawgithub is fronted by Nginx, Apache, or something else that
    // generates logs in Common Log Format, set the path to that file here to
    // have rawgithub tail the log and use it for accurate request statistics.
    //
    // If this is not set or if the file doesn't exist or isn't readable,
    // rawgithub will track requests internally (but this may result in
    // inaccurate stats if you're fronting rawgithub with a caching proxy).
    upstreamRequestLog: '/data/logs/rawgithub.com-access.log'
};
