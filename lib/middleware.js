var mime = require('mime'),

request = require('request').defaults({
    jar      : false,
    strictSSL: true,
    timeout  : 10000
});

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

            request(rootUrl + req.path, {headers: headers}, function (err, gh, body) {
                if (err) {
                    next(err);
                    return;
                }

                var status = gh.statusCode;

                if (status < 200 || status > 399) {
                    // Treat as a 404.
                    next();
                    return;
                }

                // Pass certain GitHub headers along in the response.
                relayResponseHeaders.forEach(function (name) {
                    var value = gh.headers[name];

                    if (value) {
                        res.set(name, value);
                    }
                });

                var type = mime.lookup(req.path);

                // If GitHub served this file as UTF-8, so should we.
                if (/charset=utf-8/i.test(gh.headers['content-type'])) {
                    type += '; charset=utf-8';
                }

                res.type(type);
                res.send(status, body);
            });
        }
    }
};
