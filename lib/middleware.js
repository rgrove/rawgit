/*jshint node:true */

"use strict";

var blacklist = require('./blacklist'),
    mime      = require('mime'),
    path      = require('path');

var request = require('request').defaults({
    followRedirect: false,
    jar           : false,
    strictSSL     : true,
    timeout       : 30000
});

// Public directory containing static files.
var publicDir = require('fs').realpathSync(__dirname + '/../public');

// Whitelist of file extensions that will be proxied through rawgithub.com. All
// others will be redirected to raw.github.com.
var extensionWhitelist = {
     '.css' : true,
     '.htm' : true,
     '.html': true,
     '.js'  : true,
     '.rss' : true,
     '.svg' : true,
     '.swf' : true,
     '.xml' : true
};

// Array of request header names that should be relayed from the user to GitHub.
var relayRequestHeaders = [
    'Accept',
    'Accept-Charset',
    'If-Modified-Since',
    'If-None-Match',
    'User-Agent'
];

// Array of request header names that should be relayed from GitHub to the user.
var relayResponseHeaders = [
    'Date',
    'ETag'
];

module.exports = {

    // Checks the blacklist to see if this request should be denied.
    blacklist: function (req, res, next) {
        if (!blacklist.referrers.length && !blacklist.uris.length) {
            next();
            return;
        }

        var i, len, uri;

        // Check the URI blacklist. Blacklisted URIs are served a 403 Forbidden
        // response, but won't receive evil.js or evil.css.
        for (i = 0, len = blacklist.uris.length; i < len; i++) {
            uri = blacklist.uris[i];

            if (typeof uri === 'string') {
                if (uri === req.path) {
                    res.set('X-Blacklist', 'uri');
                    module.exports.deny(req, res);
                    return;
                }
            } else {
                if (uri.test(req.path)) {
                    res.set('X-Blacklist', 'uri');
                    module.exports.deny(req, res);
                    return;
                }
            }
        }

        var referrer = req.get('referrer'),
            badReferrer;

        if (!referrer) {
            next();
            return;
        }

        // Check the referrer blacklist. Requests from blacklisted referrers
        // will receive evil.js or evil.css.
        for (i = 0, len = blacklist.referrers.length; i < len; i++) {
            badReferrer = blacklist.referrers[i];

            if (typeof badReferrer === 'string') {
                if (badReferrer === referrer) {
                    res.set('X-Blacklist', 'referrer');
                    module.exports.evil(req, res);
                    return;
                }
            } else {
                if (badReferrer.test(referrer)) {
                    res.set('X-Blacklist', 'referrer');
                    module.exports.evil(req, res);
                    return;
                }
            }
        }

        next();
    },

    // Sends a 403 response for blacklisted URIs.
    deny: function (req, res) {
        res.status(403);
        res.type('txt').send('The requested URI has been blacklisted due to abuse.');
    },

    // Sends a generic 403 Forbidden response.
    error403: function (req, res) {
        res.status(403);

        if (req.accepts('html')) {
            res.sendfile(publicDir + '/errors/403.html');
            return;
        }

        res.type('txt').send('Not cool, man.');
    },

    // Serves up evil.js or evil.css, or just a 403, depending on the requested
    // filename.
    evil: function (req, res) {
        var extname = path.extname(req.path.toLowerCase());

        if (extname === '.js') {
            res.sendfile(publicDir + '/js/evil.js', {
                maxAge: 86400000 // 1 day
            });
        } else if (extname === '.css') {
            res.sendfile(publicDir + '/css/evil.css', {
                maxAge: 86400000 // 1 day
            });
        } else {
            res.status(403);
            res.type('txt').send('The referring website has been blacklisted for abusing rawgithub.com.');
        }
    },

    // Redirects requests for non-whitelisted file extensions directly to
    // GitHub, since there's no value in proxying them.
    fileRedirect: function (rootUrl) {
        return function (req, res, next) {
            if (extensionWhitelist[path.extname(req.path).toLowerCase()]) {
                next();
            } else {
                res.set('Cache-Control', 'max-age=157680000'); // 5 years
                res.redirect(301, rootUrl + req.url);
            }
        };
    },

    // Sets the X-Robots-Tag response header to disallow indexing and following.
    noRobots: function (req, res, next) {
        res.set('X-Robots-Tag', 'none');
        next();
    },

    // Returns a middleware function that proxies a request to the specified
    // rootUrl with the current request URL appended, passes through
    // appropriate request and response headers, and relays the body of the
    // response to the client, ending the request.
    proxyPath: function (rootUrl) {
        return function (req, res, next) {
            var headers = {};

            relayRequestHeaders.forEach(function (header) {
                var value = req.header(header);

                if (value) {
                    headers[header] = value;
                }
            });

            request(rootUrl + req.path, {
                headers: headers
            }).on('response', function (gh) {
                var status = gh.statusCode;

                if ((status < 200 || status > 299) && status !== 304) {
                    // Treat as a 404.
                    next();
                    return;
                }

                // Pass certain GitHub headers along in the response.
                relayResponseHeaders.forEach(function (name) {
                    var value = gh.headers[name.toLowerCase()];

                    if (value) {
                        res.set(name, value);
                    }
                });

                var type = mime.lookup(req.path);

                // If GitHub served this file with a specific character
                // encoding, so should we.
                var charset = /;\s*charset\s*=\s*([^\s;]+)/.exec(gh.headers['content-type']);

                if (charset) {
                    type += '; charset=' + charset[1];
                }

                res.statusCode = status;
                res.type(type);

                gh.pipe(res);
            }).on('error', function (err) {
                next(err);
            });
        };
    },

    // Gather stats on an incoming request.
    stats: require('./stats').middleware

};
