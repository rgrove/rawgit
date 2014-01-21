/*jshint node:true */

"use strict";

var config = require('../../conf'),
    mime   = require('mime');

var request = require('request').defaults({
    followRedirect: false,
    jar           : false,
    strictSSL     : true,
    timeout       : 30000
});

// Returns a middleware function that proxies a request to the specified
// rootUrl with the current request URL appended, passes through
// appropriate request and response headers, and relays the body of the
// response to the client, ending the request.
module.exports = function (rootUrl) {
    return function (req, res, next) {
        var headers = {};

        config.relayRequestHeaders.forEach(function (header) {
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
            config.relayResponseHeaders.forEach(function (name) {
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
};
