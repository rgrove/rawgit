/*jshint node:true */

/**
Relays an incoming request to an upstream URL, preserving its path.

@module middleware/proxy-path
**/

"use strict";

var config     = require('../../conf');
var https      = require('https');
var mime       = require('mime');
var onFinished = require('on-finished');
var url        = require('url');
var zlib       = require('zlib');

// -- Private Variables --------------------------------------------------------

/**
Captures the charset value from an HTTP `Content-Type` response header.

@var {RegExp} REGEX_CHARSET
@final
**/
var REGEX_CHARSET = /;\s*charset\s*=\s*([^\s;]+)/i;

// -- Public Functions ---------------------------------------------------------

/**
Returns a middleware function that proxies a request to the specified _rootUrl_
with the current request path appended, passes through appropriate request and
response headers, and relays the body of the response to the client, ending the
request.

@method exports

@param {String} rootUrl
    Upstream URL to relay requests to (e.g. "https://raw.githubusercontent.com").

@return {Function} Middleware function wrapping the given _rootUrl_.
**/
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

        https.get({
            agent   : false,
            hostname: parsedUrl.hostname,
            path    : parsedUrl.path + req.path,
            headers : headers
        }).on('error', function (err) {
            next(err);
        }).on('response', function (incoming) {
            onResponse(req, res, next, incoming);
        });
    };
};

// -- Private Functions --------------------------------------------------------

/**
Handles an incoming response from an upstream server, piping it to the client
or handling errors as appropriate.

@method onResponse

@param {http.ClientRequest} req
    Express request object.

@param {http.ServerResponse} res
    Express response object.

@param {Function} next
    Express next middleware callback.

@param {https.IncomingMessage} incoming
    Incoming response from the upstream server.

@private
**/
function onResponse(req, res, next, incoming) {
    // Ensure that the incoming stream is drained once the response is closed.
    // Otherwise we can leak Buffers.
    onFinished(res, function () {
        incoming.on('readable', function () {
            /*jshint noempty:false */
            while (null !== incoming.read()) {}
        });

        incoming.read();
    });

    var status = incoming.statusCode;

    if ((status < 200 || status > 299) && status !== 304) {
        // Treat as a 404.
        return void next();
    }

    // Pass certain upstream headers along in the response.
    config.relayResponseHeaders.forEach(function (name) {
        var value = incoming.headers[name.toLowerCase()];

        if (value) {
            res.setHeader(name, value);
        }
    });

    if (req.isCDN) {
        res.setHeader('Cache-Control', 'max-age=315569000'); // 10 years
    } else {
        res.setHeader('Cache-Control', 'max-age=300'); // 5 minutes
    }

    // Respond immediately on 304 Not Modified.
    if (status === 304) {
        res.status(304).end();
        return;
    }

    // If the upstream server served this file with a specific character
    // encoding, so should we.
    var charset  = REGEX_CHARSET.exec(incoming.headers['content-type']);
    var encoding = incoming.headers['content-encoding'];
    var type     = mime.lookup(req.path);

    if (charset) {
        type += '; charset=' + charset[1];
    }

    res.statusCode = status;
    res.setHeader('Content-Type', type);
    res.setHeader('Vary', 'Accept-Encoding');

    // Decompress the response if the client won't accept compressed responses.
    // Otherwise, serve it unmodified.
    if ((encoding === 'gzip' || encoding === 'deflate')
            && req.acceptsEncodings(encoding) !== encoding) {

        incoming.pipe(zlib.createUnzip()).pipe(res);
    } else {
        if (encoding) {
            res.setHeader('Content-Encoding', encoding);
        }

        incoming.pipe(res);
    }
}
