"use strict";

var path = require('path');

module.exports = {
    // Whether or not to automatically throttle and blacklist abusive requests.
    // This works best if `upstreamRequestLog` is also set.
    autoThrottle: true,

    // Base URL to use for requesting gist files.
    baseGistUrl: 'https://gist.githubusercontent.com',

    // Base URL to use for requesting repo files.
    baseRepoUrl: 'https://raw.githubusercontent.com',

    // Domain to use for CDN requests to RawGit.
    cdnDomain: 'cdn.rawgit.com',

    // GitHub "username/repo" from which RawGit's own static assets should be
    // loaded via the CDN. Set this to a falsy value to disable loading static
    // assets from the CDN.
    cdnRepo: 'rgrove/rawgit',

    // Git tag that points to the GitHub commit from which RawGit's own static
    // assets should be loaded via the CDN. Set this to a falsy value to disable
    // loading static assets from the CDN.
    cdnTag: 'cdn-20150903-1',

    // Domain to use for dev requests to RawGit.
    devDomain: 'rawgit.com',

    // Whitelist of file extensions that will be proxied through RawGit. All
    // others will be redirected to raw.githubusercontent.com.
    //
    // Requests to the cdnDomain will bypass this whitelist and proxy all file
    // types. Please keep this list alphabetized.
    extensionWhitelist: {
        '.appcache'  : true,
        '.coffee'    : true,
        '.css'       : true,
        '.csv'       : true,
        '.eot'       : true,
        '.geojson'   : true,
        '.handlebars': true,
        '.hbs'       : true,
        '.htm'       : true,
        '.html'      : true,
        '.js'        : true,
        '.json'      : true,
        '.jsonld'    : true,
        '.kml'       : true,
        '.md'        : true,
        '.n3'        : true,
        '.nt'        : true,
        '.otf'       : true,
        '.owl'       : true,
        '.pdf'       : true,
        '.rdf'       : true,
        '.rss'       : true,
        '.svg'       : true,
        '.swf'       : true,
        '.ttc'       : true,
        '.ttf'       : true,
        '.ttl'       : true,
        '.vtt'       : true,
        '.woff'      : true,
        '.woff2'     : true,
        '.xht'       : true,
        '.xhtml'     : true,
        '.xml'       : true,
        '.xsl'       : true,
        '.xslt'      : true,
        '.yaml'      : true,
        '.yml'       : true
    },

    // Whether we're running in a production environment (true) or
    // development/test (false).
    isProduction: process.env.NODE_ENV === 'production',

    // This multiplier is used to determine the naughtiness of a given request
    // based on internal stats about the requested file and the referrer.
    //
    // Naughtiness for files is determined by this formula:
    //
    //     requests * requestsPerSecond * totalKilobytes * multiplier
    //
    // Naughtiness for referrers is determined by this formula:
    //
    //     requests * requestsPerSecond * totalKilobytes * multiplier *
    //         referrerNaughtinessMultiplier
    //
    // Referrers get a little more leeway since they're often legitimately
    // requesting multiple files per page.
    //
    // The end result is that large files requested rarely are fine. Small files
    // requested frequently but not too often are fine. But large files
    // requested often and small files requested abusively often are not fine.
    //
    // This multiplier is calibrated such that a naughtiness score of >= 0.5
    // probably indicates requests should be throttled, and a score of >= 1.0
    // probably indicates requests should be blacklisted.
    naughtinessMultiplier: 0.0000002,

    // Public directory containing static files.
    publicDir: path.join(__dirname, '/../public'),

    // Additional multiplier to use when determining the naughtiness of a
    // referrer. This is used to give referrers more leeway than individual
    // files, since they're often legitimately requesting multiple files per
    // page.
    referrerNaughtinessMultiplier: 0.5,

    // Array of request header names that should be relayed from the user to
    // GitHub.
    relayRequestHeaders: [
        'If-Modified-Since',
        'If-None-Match',
        'User-Agent'
    ],

    // Array of response header names that should be relayed from GitHub to the
    // user.
    relayResponseHeaders: [
        'Date',
        'ETag'
    ],

    // Hash of paths that should not be included in stats. This is mainly useful
    // if you use monitoring tools that ping a given URL every few minutes and
    // you don't want them affecting stats rankings.
    statsIgnorePaths: {
        '/rgrove/rawgit/master/web.js': true
    },

    // If RawGit is fronted by Nginx, Apache, or something else that generates
    // logs in Common/Combined Log Format, set the path to that file here to
    // have RawGit tail the log and use it for accurate request statistics.
    //
    // If this is not set or if the file doesn't exist or isn't readable, RawGit
    // will track requests internally (but this may result in inaccurate stats
    // if you're fronting RawGit with a caching proxy).
    upstreamRequestLog: '/data/logs/rawgit.com-access.log',

    // Number of historical log entries to parse from the upstream request log
    // on startup. This is useful in order to retain recent stats after the
    // RawGit process is restarted.
    upstreamRequestLogScrollback: 100000
};
