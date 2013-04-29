var mime = require('mime'),

request = require('request').defaults({
    jar      : false,
    strictSSL: true,
    timeout  : 30000
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
        }
    }
};
