/**
Relays an incoming request to an upstream URL, preserving its path.
**/

"use strict";

const https      = require('https');
const onFinished = require('on-finished');
const url        = require('url');
const zlib       = require('zlib');

const config            = require('../../conf');
const mime              = require('../mime');
const RedirectTransform = require('../transforms/redirect');

// -- Private Variables --------------------------------------------------------

/**
Captures the charset value from an HTTP `Content-Type` response header.

@type RegExp
**/
const REGEX_CHARSET = /;\s*charset\s*=\s*([^\s;]+)/i;

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
module.exports = rootUrl => {
  let parsedUrl = url.parse(rootUrl);

  return (req, res, next) => {
    let headers = {};

    config.relayRequestHeaders.forEach(header => {
      let value = req.header(header);

      if (value) {
        headers[header] = value;
      }
    });

    // Always request a compressed response from GitHub.
    headers['accept-encoding'] = 'gzip,deflate';

    https.get({
      hostname: parsedUrl.hostname,
      path    : url.resolve(parsedUrl.path, pathWithIndex(req)),
      headers : headers
    }).on('response', incoming => {
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
  onFinished(res, () => {
    incoming.on('readable', () => {
      /* eslint no-empty: 0 */
      while (null !== incoming.read()) {}
    });

    incoming.read();
  });

  // Handle error responses.
  let incomingStatus = incoming.statusCode;

  if ((incomingStatus < 200 || incomingStatus > 299) && incomingStatus !== 304) {
    // Treat as a 404.
    res.status(404);
    res.set('Cache-Control', 'max-age=300'); // 5 minutes

    return void res.sendFile(config.publicDir + '/errors/404.html');
  }

  if (req.isCDN) {
    res.set('Cache-Control', 'max-age=315569000'); // 10 years
  } else {
    res.set('Cache-Control', 'max-age=300'); // 5 minutes
  }

  res.statusCode = incomingStatus;

  // Pass certain upstream headers along in the response.
  let incomingHeaders = incoming.headers;

  config.relayResponseHeaders.forEach(name => {
    let value = incomingHeaders[name.toLowerCase()];

    if (value) {
      res.set(name, value);
    }
  });

  // Respond immediately on 304 Not Modified.
  if (incomingStatus === 304) {
    return void res.end();
  }

  // Choose an appropriate Content-Type, preserving the charset specified by the
  // response if there was one.
  let charset = REGEX_CHARSET.exec(incomingHeaders['content-type']);
  res.set('Content-Type', mime.contentType(pathWithIndex(req), charset && charset[1]));

  // Decompress the response if necessary.
  let encoding = incomingHeaders['content-encoding'];

  if (encoding === 'gzip' || encoding === 'deflate') {
    incoming = incoming.pipe(zlib.createUnzip());
  }

  res.set('Vary', 'Accept-Encoding');

  // Stream the response to the client.
  if (req.isCDN) {
    incoming.pipe(res);
  } else {
    incoming.pipe(RedirectTransform(res)).pipe(res);
  }
}

function pathWithIndex(req) {
  let path = req.path;

  if (/\/$/.test(path)) {
    path += 'index.html';
  }

  return path;
}
