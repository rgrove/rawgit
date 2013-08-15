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
        if (!blacklist.referrers.length && !blacklist.uris.length) {
            next();
            return;
        }

        var i, len, uri;

        for (i = 0, len = blacklist.uris.length; i < len; i++) {
            uri = blacklist.uris[i];

            if (typeof uri === 'string') {
                if (uri === req.path) {
                    module.exports.evil(req, res);
                    return;
                }
            } else {
                if (uri.test(req.path)) {
                    module.exports.evil(req, res);
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

        for (i = 0, len = blacklist.referrers.length; i < len; i++) {
            badReferrer = blacklist.referrers[i];

            if (typeof badReferrer === 'string') {
                if (badReferrer === referrer) {
                    module.exports.evil(req, res);
                    return;
                }
            } else {
                if (badReferrer.test(referrer)) {
                    module.exports.evil(req, res);
                    return;
                }
            }
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

    // Redirects image requests directly to GitHub, since they're served with
    // the correct content-type.
    imageRedirect: function (rootUrl) {
        return function (req, res, next) {
            if (/\.(?:gif|ico|jpe?g|png)$/i.test(req.path)) {
                res.redirect(301, rootUrl + req.path);
            } else {
                next();
            }
        };
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
