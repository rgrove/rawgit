/**
Relays an incoming request to an upstream URL, preserving its path.
**/

"use strict";

// <<<<<<< HEAD
// var config            = require('../../conf');
// var https             = require('https');
// var mime              = require('../mime');
// var onFinished        = require('on-finished');
// var RedirectTransform = require('../transforms/redirect');
// var url               = require('url');
// var zlib              = require('zlib');
var path              = require('path');
// =======
const https      = require('https');
const onFinished = require('on-finished');
const url        = require('url');
const zlib       = require('zlib');

const config            = require('../../conf');
const mime              = require('../mime');
const RedirectTransform = require('../transforms/redirect');
// >>>>>>> rgrove/master

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
// <<<<<<< HEAD
// module.exports = function (rootUrl) {
//     var parsedUrl = url.parse(rootUrl);

//     return function (req, res, next) {
//         var headers = {};

//         config.relayRequestHeaders.forEach(function (header) {
//             var value = req.header(header);

//             if (value) {
//                 headers[header] = value;
//             }
//         });

//         // Always request a compressed response from GitHub.
//         headers['accept-encoding'] = 'gzip,deflate';
//         // console.log("GETTING ", url.resolve(parsedUrl.path, pathWithIndex(req)))

//         if (config.extensionNoCache[path.extname(parsedUrl.path).toLowerCase()])
//             var p = url.resolve(parsedUrl.path, pathWithIndex(req));
//         else
//             var p = url.resolve(parsedUrl.path, pathWithIndex(req)) + "?" + Math.random();
        
//             https.get({
//                 agent   : false,
//                 hostname: parsedUrl.hostname,
//                 path    : p,
//                 headers : headers
//             }).on('response', function (incoming) {
//                 onResponse(req, res, next, incoming);
//             }).on('error', next);
//     };
// =======
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

    // Always request a compressed response from GitHub.
    headers['accept-encoding'] = 'gzip,deflate';
    

    if (config.extensionNoCache[path.extname(parsedUrl.path).toLowerCase()])
        var p = url.resolve(parsedUrl.path, pathWithIndex(req));
    else
        var p = url.resolve(parsedUrl.path, pathWithIndex(req)) + "?" + Math.random();


    https.get({
      hostname: parsedUrl.hostname,
      path    : p,
      port    : 443,
      headers : headers
    }).on('response', upstreamResponse => {
      onResponse(req, res, upstreamResponse);
    }).on('error', () => {
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


  // res.set('Access-Control-Allow-Origin', 'http://v4.pingendo.com');
  // Stream 200 responses with the correct Content-Type.
  if (upstreamStatus === 200) {
    if (req.isCDN) {
      res.set('Cache-Control', 'max-age=315569000'); // 10 years
    } else {
// <<<<<<< HEAD
        // res.setHeader('Cache-Control', 'max-age=1'); // 5 minutes
// =======
      res.set('Cache-Control', 'max-age=301'); // 5 minutes

// >>>>>>> rgrove/master
    }

    // Choose an appropriate Content-Type, preserving the charset specified in
    // the response if there was one.
    let charset = REGEX_CHARSET.exec(upstreamHeaders['content-type']);
    res.set('Content-Type', mime.contentType(pathWithIndex(req), charset && charset[1]));
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.set("Access-Control-Allow-Origin", "*");

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
