/*jshint node:true */

// These silly websites are hotlinking to rawgithub.com in production, which is
// totally against the rules. So we'll have some fun with them.
module.exports = {
    // This is an array of strings or regexes that match referrer URLs.
    referrers: [
        // /^http:\/\/(?:www\.)?example\.com\//i
        /^http:\/\/(?:www\.)?donjacobo\.net\//i
    ],

    // This is an array of strings or regexes that match request URIs (paths and
    // filenames only, no query strings).
    uris: [
        // /^\/foo\/bar\/baz\.js$/i
        '/ajaxorg/ace-builds/master/src-noconflict/ace.js',
        '/imShara/jslock/master/lock.min.js'
    ]
};
