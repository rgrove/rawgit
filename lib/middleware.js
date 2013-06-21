/*jshint node:true */

var blacklist = require('./blacklist'),
    mime      = require('mime'),
    path      = require('path');

var request = require('request').defaults({
    jar      : false,
    strictSSL: true,
    timeout  : 30000
});

// Public directory containing static files.
var publicDir = require('fs').realpathSync(__dirname + '/../public');

// Array of request header names that should be relayed from the user to GitHub.
var relayRequestHeaders = [
    'Accept',
    'Accept-Charset',
    'Cache-Control',
    'If-None-Match',
    'Pragma',
    'User-Agent'
];

// Array of request header names that should be relayed from GitHub to the user.
var relayResponseHeaders = [
    'Date',
    'ETag'
];

module.exports = {

    // Compares the referrer against the referrer blacklist and serves up
    // evil.js or evil.css if there's a match.
    blacklist: function (req, res, next) {
        if (!blacklist.length) {
            next();
            return;
        }

        var referrer = req.get('referrer');

        if (!referrer) {
            next();
            return;
        }

        for (var i = 0, len = blacklist.length; i < len; i++) {
            if (!blacklist[i].test(referrer)) {
                continue;
            }

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

            return;
        }

        next();
    },

    // Sends a 403 Forbidden response.
    error403: function (req, res) {
        res.status(403);

        if (req.accepts('html')) {
            res.sendfile(publicDir + '/errors/403.html');
            return;
        }

        if (req.accepts('json')) {
            res.send({error: 'Not cool, man.'});
            return;
        }

        res.type('txt').send('Not cool, man.');
    },

    // Redirects image requests directly to GitHub, since they're served with
    // the correct content-type.
    imageRedirect: function (rootUrl) {
        return function (req, res, next) {
            if (/\.(?:gif|ico|jpe?g|png)$/i.test(req.path)) {
                res.redirect(301, rootUrl + req.path);
            } else {
                next();
            }
        }
    },

    // Sets the X-Robots-Tag response header to disallow indexing and following.
    noRobots: function (req, res, next) {
        res.set('X-Robots-Tag', 'none');
        next();
    },

    // Returns a middleware function that proxies a request to the specified
    // rootUrl with the current request path appended, passes through
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

            request(rootUrl + req.path, {headers: headers}).on('response', function (gh) {
                var status = gh.statusCode;

                if (status < 200 || status > 399) {
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
    }

};
