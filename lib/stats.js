/**
Tracks and exposes request statistics for the most common requests.
**/

"use strict";

const lru    = require('lru-cache');
const config = require('../conf');

// -- Private Variables --------------------------------------------------------

/**
LRU cache of file stats.

@type Object
**/
let fileCache = lru({
  max   : 256,
  maxAge: 1800000 // 30 minutes
});

/**
LRU cache of referrer stats.

@type Object
**/
let referrerCache = lru({
  max   : 512,
  maxAge: 1800000 // 30 minutes
});

// -- Public Properties --------------------------------------------------------

/**
Time stats tracking began.

@type Date
**/
exports.since = new Date();

// -- Public Methods -----------------------------------------------------------

/**
Returns statistics for the given file path.

@return {Object}
**/
exports.file = path => {
  return formatFileStats(path, fileCache.get(path) || defaultFileStats());
};

/**
Returns an array of the most-requested files sorted in descending order by
popularity.

@return {Object[]}
**/
exports.files = () => {
  let files = [];
  let now   = Date.now();

  fileCache.forEach((stats, path) => {
    files.push(formatFileStats(path, stats, now));
  });

  return files.sort(reverseSort);
};

/**
Updates stats with the details of the given request.

@param {String} path
  Request path without a query string (e.g. "/foo/bar.html").

@param {String} [referrer]
  Referrer, if any (e.g. "http://example.com/").

@param {Number} [size=0]
  Size of the requested file in bytes, if known.

@param {Number} [time]
  Time of the request in milliseconds since the epoch. Defaults to the current
  time.
**/
exports.logRequest = (path, referrer, size, time) => {
  size || (size = 0);
  time || (time = Date.now());

  let fileDetails = fileCache.get(path) || defaultFileStats(time);

  fileDetails.bytes += size;
  fileDetails.hits  += 1;

  fileCache.set(path, fileDetails);

  if (!referrer || referrer === '-') {
    return;
  }

  let referrerDetails = referrerCache.get(referrer) || defaultReferrerStats(time);

  referrerDetails.bytes += size;
  referrerDetails.hits  += 1;

  referrerCache.set(referrer, referrerDetails);
};

/**
Returns statistics for the given referrer URL.

@param {String} url
  Referrer URL.

@return {Object}
**/
exports.referrer = url => {
  return formatReferrerStats(url, referrerCache.get(url) || defaultReferrerStats());
};

/**
Returns an array of the most active referrers sorted in descending order by
number of referrals.

@return {Object[]}
**/
exports.referrers = () => {
  let now       = Date.now();
  let referrers = [];

  referrerCache.forEach((stats, url) => {
    referrers.push(formatReferrerStats(url, stats, now));
  });

  return referrers.sort(reverseSort);
};

/**
Resets all stats.
**/
exports.reset = () => {
  fileCache.reset();
  referrerCache.reset();
};

// -- Private Methods ----------------------------------------------------------

/**
Returns a brand new set of default file stats.

@param {Number} [time]
  First-seen timestamp. Defaults to the current time.

@return {Object}
**/
function defaultFileStats(time) {
  return {
    added: time || Date.now(),
    bytes: 0,
    hits : 0
  };
}

/**
Returns a brand new set of default referrer stats.

@param {Number} [time]
  First-seen timestamp. Defaults to the current time.

@return {Object}
**/
function defaultReferrerStats(time) {
  return {
    added: time || Date.now(),
    bytes: 0,
    hits : 0
  };
}

/**
Formats the given file stats, adding derived stats like `bitsPerSecond`.

@param {String} path
  Request path without a query string (e.g. "/foo/bar.html").

@param {Object} stats
  Stats object.

@param {Number} [now]
  Current timestamp. If not provided, one will be calculated.

@return {Object}
**/
function formatFileStats(path, stats, now) {
  now || (now = Date.now());

  let seconds       = ((now - stats.added) / 1000) || 1;
  let hits          = stats.hits;
  let hitsPerSecond = hits / seconds;
  let kilobytes     = stats.bytes / 1024;
  let multiplier    = config.naughtinessMultiplier;

  return {
    hits              : hits,
    hitsPerSecond     : hitsPerSecond.toFixed(2),
    kilobytes         : kilobytes.toFixed(1),
    kilobytesPerSecond: (kilobytes / seconds).toFixed(1),
    naughtiness       : hits * hitsPerSecond * kilobytes * multiplier,
    path              : path
  };
}

/**
Formats the given referrer stats, adding derived stats like `bitsPerSecond`.

@param {String} url
  Referrer URL without a query string (e.g. "http://example.com/").

@param {Object} stats
  Stats object.

@param {Number} [now]
  Current timestamp. If not provided, one will be calculated.

@return {Object}
**/
function formatReferrerStats(url, stats, now) {
  now || (now = Date.now());

  let seconds            = ((now - stats.added) / 1000) || 1;
  let hits               = stats.hits;
  let hitsPerSecond      = hits / seconds;
  let kilobytes          = stats.bytes / 1024;
  let multiplier         = config.naughtinessMultiplier;
  let referrerMultiplier = config.referrerNaughtinessMultiplier;

  return {
    hits              : hits,
    hitsPerSecond     : hitsPerSecond.toFixed(2),
    kilobytes         : kilobytes.toFixed(1),
    kilobytesPerSecond: (kilobytes / seconds).toFixed(1),
    naughtiness       : hits * hitsPerSecond * kilobytes * multiplier * referrerMultiplier,
    url               : url
  };
}

/**
Sorts two file or referrer stats objects in reverse order based on their
naughtiness score.

@param {Object} a
  File or referrer stats object.

@param {Object} b
  File or referrer stats object.

@return {Number}
**/
function reverseSort(a, b) {
  return b.naughtiness - a.naughtiness;
}
