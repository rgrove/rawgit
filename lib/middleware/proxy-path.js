/*jshint node:true */

"use strict";

var accepts = require('accepts'),
    https   = require('https'),
    mime    = require('mime'),
    url     = require('url'),
    zlib    = require('zlib');

var config = require('../../conf');

// Returns a middleware function that proxies a request to the specified
// rootUrl with the current request URL appended, passes through
// appropriate request and response headers, and relays the body of the
// response to the client, ending the request.
module.exports = function (rootUrl) {
    var parsedUrl = url.parse(rootUrl);

    return function (req, res, next) {
        var headers = {};

        config.relayRequestHeaders.forEach(function (header) {
            var value = req.header(header);

            if (value) {
                headers[header] = value;
            }
        });

        // Always request a compressed response from GitHub. We'll decompress it
        // if the client can't handle it.
        headers['accept-encoding'] = 'gzip,deflate';

        var request = https.get({
            agent   : false,
            hostname: parsedUrl.hostname,
            path    : parsedUrl.path + req.path,
            headers : headers
        });

        request.setTimeout(30000);

        request.on('error', function (err) {
            next(err);
        });

        request.on('response', function (github) {
            var status = github.statusCode;

            if ((status < 200 || status > 299) && status !== 304) {
                // Treat as a 404.
                next();
                return;
            }

            // Pass certain GitHub headers along in the response.
            config.relayResponseHeaders.forEach(function (name) {
                var value = github.headers[name.toLowerCase()];

                if (value) {
                    res.set(name, value);
                }
            });

            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes

            // Respond immediately on 304 Not Modified.
            if (status === 304) {
                res.send(304);
                return;
            }

            // If GitHub served this file with a specific character encoding, so
            // should we.
            var charset = /;\s*charset\s*=\s*([^\s;]+)/.exec(
                    github.headers['content-type']);

            var type = mime.lookup(req.path);

            if (charset) {
                type += '; charset=' + charset[1];
            }

            res.statusCode = status;
            res.type(type);

            var encoding = github.headers['content-encoding'];

            // If GitHub gave us a compressed response and the client can
            // handle it, send GitHub's response directly to the client. If the
            // client can't handle it, then decompress it first.
            if ((encoding === 'gzip' || encoding === 'deflate')
                    && !accepts(req).encodings(encoding)) {

                github.pipe(zlib.createUnzip()).pipe(res);
            } else {
                res.set('Content-Encoding', encoding);
                github.pipe(res);
            }
        });
    };
};
