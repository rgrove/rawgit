/*jshint node: true */

"use strict";

var lru = require('lru-cache');

// -- Public Properties --------------------------------------------------------

/**
LRU cache of file hit stats.

@property {Object} referrerCache
**/
exports.fileCache = lru(1000);

/**
LRU cache of referrer hit stats.

@property {Object} referrerCache
**/
exports.referrerCache = lru(1000);

/**
Time stats tracking began.

@property {Date} since
**/
exports.since = new Date();

// -- Public Methods -----------------------------------------------------------

/**
Returns an array of the most-requested files sorted in descending order by
popularity.

@return Object[]
**/
exports.files = function () {
    var files = [];

    exports.fileCache.forEach(function (hits, path) {
        files.push({
            hits: hits,
            path: path
        });
    });

    return files.sort(reverseSortByHits);
};

/**
Returns an array of the most active referrers sorted in descending order by
number of referrals.

@return Object[]
**/
exports.referrers = function () {
    var referrers = [];

    exports.referrerCache.forEach(function (hits, url) {
        referrers.push({
            hits: hits,
            url : url
        });
    });

    return referrers.sort(reverseSortByHits);
};

// -- Private Methods ----------------------------------------------------------

/**
Sorts two file or referrer stats objects in reverse order based on the value of
their `hits` properties.

@param {Object} a File or referrer stats object.
@param {Object} b File or referrer stats object.
@return {Number}
**/
function reverseSortByHits(a, b) {
    return b.hits - a.hits;
}
