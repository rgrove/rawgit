"use strict";

const stream = require('stream');
const util   = require('util');

/**
Regex that matches a string that consists of a valid redirect directive.

## Subpattern captures

1.  HTTP(S) URL to redirect to (relative or absolute).
2.  (Optional) 301 or 302 status code.

## Should match

    !rawgit-redirect https://foo.com/bar;
    !rawgit-redirect https://foo.com/bar 302;
    !rawgit-redirect https://foo.com/bar 301;
    !rawgit-redirect http://foo.com/bar%20baz;
    !rawgit-redirect //foo.com/bar;
    !rawgit-redirect /bar;
    !rawgit-redirect bar;
    !rawgit-redirect ../bar+baz;

## Should not match

    !rawgit-redirect javascript:alert(1);
    !rawgit-redirect file://foo;
    !rawgit-redirect about:blank;

@type RegExp
**/
const REGEX_DIRECTIVE = /^!rawgit-redirect\s+((?:https?:)?[^:\s]+)(?:\s+(301|302))?\s*;\s*$/i;

/**
Transform stream that reads up to the first 1,024 bytes of the incoming stream
and looks for a `!rawgit-redirect` directive.

If it finds one, the given response will be redirected to the URL specified by
the directive. Otherwise the incoming stream will be passed through unmodified.

@param {http.ServerResponse} res
  Express response object.

@param {Object} [options]
  Stream options.
**/
function RedirectTransform(res, options) {
  if (!(this instanceof RedirectTransform)) {
    return new RedirectTransform(res, options);
  }

  stream.Transform.call(this, options);

  this._bufferedChunks      = [];
  this._directive           = '';
  this._directiveByteLength = 0;
  this._finished            = false;
  this._res                 = res;
  this._skipRemainingChunks = false;
}

util.inherits(RedirectTransform, stream.Transform);

RedirectTransform.prototype._flush = function (callback) {
  if (this._bufferedChunks.length) {
    this._bufferedChunks.forEach(bufferedChunk => {
      this.push(bufferedChunk);
    }, this);

    this._bufferedChunks = [];
  }

  callback();
};

RedirectTransform.prototype._transform = function (chunk, encoding, callback) {
  if (this._finished) {
    if (this._skipRemainingChunks) {
      // We've already found and processed a redirect directive, so don't pass
      // any chunks through.
      return void callback();
    }

    // We've finished looking for a redirect directive and didn't find one, so
    // just pass all chunks through as quickly as possible.
    return void callback(null, chunk);
  }

  // Read up to the first 1,024 bytes of the stream looking for a semicolon,
  // which may indicate the end of a redirect directive. While reading, store
  // the chunks we see until we know what we should do with them.
  let chunkString = chunk.toString('utf8', 0, 1024 - this._directiveByteLength);
  let directive   = this._directive += chunkString;

  this._directiveByteLength = Buffer.byteLength(directive);

  if (this._directiveByteLength < 1024 && chunkString.indexOf(';') === -1) {
    // No redirect directive so far, but we haven't read the full 1,024
    // bytes yet, so store what we've seen and keep reading.
    this._bufferedChunks.push(chunk);
    return void callback();
  }

  // We've either hit a semicolon or we've read the first 1,024 bytes. Either
  // way, we're finished reading.
  this._finished = true;

  let matches = directive.match(REGEX_DIRECTIVE);

  if (matches) {
    // We found a valid redirect directive!
    this._skipRemainingChunks = true;
    this._res.redirect(+(matches[2] || 302), matches[1]);
    return void callback();
  }

  // We didn't find a valid redirect directive, so push out any chunks we've
  // stored up and pass the rest of the response through.
  if (this._bufferedChunks.length) {
    this._bufferedChunks.forEach(bufferedChunk => {
      this.push(bufferedChunk);
    }, this);

    this._bufferedChunks = [];
  }

  callback(null, chunk);
};

module.exports = RedirectTransform;
