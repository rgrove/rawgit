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

  return (req, res) => {
    let headers = {};

    config.relayRequestHeaders.forEach(header => {
      let value = req.header(header);

      if (value) {
        headers[header] = value;
      }
    });

    headers['accept-encoding'] = 'gzip,deflate';
    headers.connection = 'keep-alive';

    let proxyPath = url.resolve(parsedUrl.path, pathWithIndex(req));

    let proxyReq = https.get({
      hostname: parsedUrl.hostname,
      path    : proxyPath,
      port    : 443,
      headers : headers
    });

    proxyReq.on('socket', socket => {
      socket.setTimeout(config.proxyTimeout);

      socket.on('timeout', () => {
        console.error('Proxy request timed out:', proxyPath);
        proxyReq.abort();
      });
    });

    proxyReq.on('response', upstreamResponse => {
      onResponse(req, res, upstreamResponse);
    });

    proxyReq.on('error', () => {
      res.status(502);
      res.sendFile(config.publicDir + '/errors/502.html');
    });
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

@param {https.IncomingMessage} upstreamResponse
  Incoming response from the upstream server.
**/
function onResponse(req, res, upstreamResponse) {
  // Ensure that the incoming stream is drained once the response is closed.
  // Otherwise we can leak Buffers.
  onFinished(res, () => {
    upstreamResponse.on('readable', () => {
      while (null !== upstreamResponse.read()) {} // eslint-disable-line no-empty
    });

    upstreamResponse.read();
  });

  // Pass certain upstream headers along in the response.
  let upstreamHeaders = upstreamResponse.headers;

  config.relayResponseHeaders.forEach(name => {
    let value = upstreamHeaders[name.toLowerCase()];

    if (value) {
      res.set(name, value);
    }
  });

  let upstreamStatus = upstreamResponse.statusCode;

  res.status(upstreamStatus);

  // Respond immediately on 2xx No Content or 3xx.
  if (upstreamStatus === 204 || upstreamStatus === 205
      || (upstreamStatus >= 300 && upstreamStatus <= 399)) {

    return void res.end();
  }

  // Stream 200 responses with the correct Content-Type.
  if (upstreamStatus === 200) {
    if (req.isCDN) {
      if (req.params.branch === 'master') {
        res.set('Cache-Control', 'max-age=86400'); // 24 hours
      } else {
        res.set('Cache-Control', 'max-age=315569000, immutable'); // 10 years
      }
    } else {
      // Tell browsers to cache for an hour, CDNs to cache for 5 minutes.
      res.set('Cache-Control', 'max-age=3600, s-maxage=300');
    }

    // Choose an appropriate Content-Type, preserving the charset specified in
    // the response if there was one.
    let charset = REGEX_CHARSET.exec(upstreamHeaders['content-type']);
    res.set('Content-Type', mime.contentType(pathWithIndex(req), charset && charset[1]));

    return void streamResponse(req, res, upstreamResponse);
  }

  // Pass 4xx and 5xx responses along without altering the Content-Type.
  if (upstreamStatus >= 400 && upstreamStatus <= 599) {
    res.set({
      'Cache-Control'        : 'max-age=300', // 5 minutes
      'RawGit-Upstream-Error': '1'
    });

    if (upstreamHeaders['content-type']) {
      res.set('Content-Type', upstreamHeaders['content-type']);
    }

    return void streamResponse(req, res, upstreamResponse);
  }

  // If we get this far, we've received an unsupported response.
  res.status(502);
  res.sendFile(config.publicDir + '/errors/502.html');
}

function pathWithIndex(req) {
  let path = req.path;

  if (/\/$/.test(path)) {
    path += 'index.html';
  }

  return path;
}

function streamResponse(req, res, upstreamResponse) {
  // Decompress the response if necessary.
  let encoding = upstreamResponse.headers['content-encoding'];

  if (encoding === 'gzip' || encoding === 'deflate') {
    upstreamResponse = upstreamResponse.pipe(zlib.createUnzip());
  }

  res.set('Vary', 'Accept-Encoding');

  if (req.isCDN) {
    upstreamResponse.pipe(res);
  } else {
    upstreamResponse.pipe(RedirectTransform(res)).pipe(res);
  }
}
