/*jshint node: true */

/**
Tracks and exposes request statistics for the most common requests.

@module stats
**/

"use strict";

var lru = require('lru-cache');

// -- Private Variables --------------------------------------------------------

/**
LRU cache of file stats.

@var {Object} referrerCache
@private
**/
var fileCache = lru(512);

/**
LRU cache of referrer stats.

@var {Object} referrerCache
@private
**/
var referrerCache = lru(512);

// -- Public Properties --------------------------------------------------------

/**
Time stats tracking began.

@property {Date} since
**/
exports.since = new Date();

// -- Public Methods -----------------------------------------------------------

/**
Returns statistics for the given file path.

@method file
@return Object
**/
exports.file = function (path) {
    return formatFileStats(path, fileCache.get(path) || defaultFileStats());
};

/**
Returns an array of the most-requested files sorted in descending order by
popularity.

@method files
@return Object[]
**/
exports.files = function () {
    var files = [],
        now   = Date.now();

    fileCache.forEach(function (stats, path) {
        files.push(formatFileStats(path, stats, now));
    });

    return files.sort(reverseSort);
};

/**
Updates stats with the details of the given request.

@method logRequest

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
exports.logRequest = function (path, referrer, size, time) {
    size || (size = 0);
    time || (time = Date.now());

    var fileDetails = fileCache.get(path) || defaultFileStats(time);

    fileDetails.bytes += size;
    fileDetails.hits  += 1;

    fileCache.set(path, fileDetails);

    if (!referrer || referrer === '-') {
        return;
    }

    var referrerDetails = referrerCache.get(referrer) ||
            defaultReferrerStats(time);

    referrerDetails.bytes += size;
    referrerDetails.hits  += 1;

    referrerCache.set(referrer, referrerDetails);
};

/**
Returns statistics for the given referrer URL.

@method referrer
@return Object
**/
exports.referrer = function (url) {
    return formatReferrerStats(url, referrerCache.get(url) ||
        defaultReferrerStats());
};

/**
Returns an array of the most active referrers sorted in descending order by
number of referrals.

@method referrers
@return Object[]
**/
exports.referrers = function () {
    var now       = Date.now(),
        referrers = [];

    referrerCache.forEach(function (stats, url) {
        referrers.push(formatReferrerStats(url, stats, now));
    });

    return referrers.sort(reverseSort);
};

// -- Private Methods ----------------------------------------------------------

/**
Returns a brand new set of default file stats.

@method defaultFileStats

@param {Number} [time]
    First-seen timestamp. Defaults to the current time.

@return Object
@private
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

@method defaultReferrerStats

@param {Number} [time]
    First-seen timestamp. Defaults to the current time.

@return Object
@private
**/
function defaultReferrerStats(time) {
    return {
        added: time,
        bytes: 0,
        hits : 0
    };
}

/**
Formats the given file stats, adding derived stats like `bitsPerSecond`.

@method formatFileStats

@param {String} path
    Request path without a query string (e.g. "/foo/bar.html").

@param {Object} stats
    Stats object.

@param {Number} [now]
    Current timestamp. If not provided, one will be calculated.

@return Object
@private
**/
function formatFileStats(path, stats, now) {
    now || (now = Date.now());

    var seconds = ((now - stats.added) / 1000) || 1;

    return {
        hits              : stats.hits,
        hitsPerSecond     : (stats.hits / seconds).toFixed(2),
        kilobytes         : (stats.bytes / 1024).toFixed(1),
        kilobytesPerSecond: (stats.bytes / 1024 / seconds).toFixed(1),
        path         : path
    };
}

/**
Formats the given referrer stats, adding derived stats like `bitsPerSecond`.

@method formatReferrerStats

@param {String} url
    Referrer URL without a query string (e.g. "http://example.com/").

@param {Object} stats
    Stats object.

@param {Number} [now]
    Current timestamp. If not provided, one will be calculated.

@return Object
@private
**/
function formatReferrerStats(url, stats, now) {
    now || (now = Date.now());

    var seconds = ((now - stats.added) / 1000) || 1;

    return {
        hits              : stats.hits,
        hitsPerSecond     : (stats.hits / seconds).toFixed(2),
        kilobytes         : (stats.bytes / 1024).toFixed(1),
        kilobytesPerSecond: (stats.bytes / 1024 / seconds).toFixed(1),
        url               : url
    };
}

/**
Sorts two file or referrer stats objects in reverse order based on the value of
their `hits` properties.

@method reverseSort

@param {Object} a
    File or referrer stats object.

@param {Object} b
    File or referrer stats object.

@return {Number}
@private
**/
function reverseSort(a, b) {
    return b.hits - a.hits;
}
