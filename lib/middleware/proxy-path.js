/**
Relays an incoming request to an upstream URL, preserving its path.
**/

"use strict";

var config            = require('../../conf');
var https             = require('https');
var mime              = require('../mime');
var onFinished        = require('on-finished');
var RedirectTransform = require('../transforms/redirect');
var url               = require('url');
var zlib              = require('zlib');

// -- Private Variables --------------------------------------------------------

/**
Captures the charset value from an HTTP `Content-Type` response header.

@type RegExp
**/
var REGEX_CHARSET = /;\s*charset\s*=\s*([^\s;]+)/i;

// -- Public Functions ---------------------------------------------------------

/**
Returns a middleware function that proxies a request to the specified _rootUrl_
with the current request path appended, passes through appropriate request and
response headers, and relays the body of the response to the client, ending the
request.

@param {String} rootUrl
    Upstream URL to relay requests to (e.g. "https://example.com").

@return {Function}
    Middleware function wrapping the given _rootUrl_.
**/
module.exports = function (rootUrl) {
    var parsedUrl = url.parse(rootUrl);

    return function (req, res, next) {
        var headers = {};
        var requestOption = {
            agent   : false,
            hostname: parsedUrl.hostname,
            path    : url.resolve(parsedUrl.path, pathWithIndex(req)),
            headers : headers
        };

        // auth for private repository
        // username:general_tokken
        if(config.auth) {
            requestOption.auth = config.auth;
        }

        config.relayRequestHeaders.forEach(function (header) {
            var value = req.header(header);

            if (value) {
                headers[header] = value;
            }
        });

        // Always request a compressed response from GitHub.
        headers['accept-encoding'] = 'gzip,deflate';

        https.get(requestOption).on('response', function (incoming) {
            onResponse(req, res, next, incoming);
        }).on('error', next);
    };
};

// -- Private Functions --------------------------------------------------------

/**
Handles an incoming response from an upstream server, piping it to the client
or handling errors as appropriate.

@param {http.ClientRequest} req
    Express request object.

@param {http.ServerResponse} res
    Express response object.

@param {Function} next
    Express next middleware callback.

@param {https.IncomingMessage} incoming
    Incoming response from the upstream server.
**/
function onResponse(req, res, next, incoming) {
    // Ensure that the incoming stream is drained once the response is closed.
    // Otherwise we can leak Buffers.
    onFinished(res, function () {
        incoming.on('readable', function () {
            /* eslint no-empty: 0 */
            while (null !== incoming.read()) {}
        });

        incoming.read();
    });

    // Handle error responses.
    var incomingStatus = incoming.statusCode;

    if ((incomingStatus < 200 || incomingStatus > 299) && incomingStatus !== 304) {
        // Treat as a 404.
        res.status(404);
        res.setHeader('Cache-Control', 'max-age=300'); // 5 minutes

        return void res.sendFile(config.publicDir + '/errors/404.html');
    }

    if (req.isCDN) {
        res.setHeader('Cache-Control', 'max-age=315569000'); // 10 years
    } else {
        res.setHeader('Cache-Control', 'max-age=300'); // 5 minutes
    }

    res.statusCode = incomingStatus;

    // Pass certain upstream headers along in the response.
    var incomingHeaders = incoming.headers;

    config.relayResponseHeaders.forEach(function (name) {
        var value = incomingHeaders[name.toLowerCase()];

        if (value) {
            res.setHeader(name, value);
        }
    });

    // Respond immediately on 304 Not Modified.
    if (incomingStatus === 304) {
        return void res.end();
    }

    // Choose an appropriate Content-Type, preserving the charset specified by
    // the response if there was one.
    var charset = REGEX_CHARSET.exec(incomingHeaders['content-type']);
    res.setHeader('Content-Type', mime.contentType(pathWithIndex(req), charset && charset[1]));

    // Decompress the response if necessary.
    var encoding = incomingHeaders['content-encoding'];

    if (encoding === 'gzip' || encoding === 'deflate') {
        incoming = incoming.pipe(zlib.createUnzip());
    }

    res.setHeader('Vary', 'Accept-Encoding');

    // Stream the response to the client.
    if (req.isCDN) {
        incoming.pipe(res);
    } else {
        incoming.pipe(RedirectTransform(res)).pipe(res);
    }
}

function pathWithIndex (req) {
    var path = req.path;

    if (/\/$/.test(path)) {
        path += 'index.html';
    }

    return path;
}
