"use strict";

const path = require('path');

module.exports = {
  // Base URL to use when requesting gist files.
  baseGistUrl: 'https://gist.githubusercontent.com',

  // Base URL to use when requesting repo files.
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
  cdnTag: 'cdn-20160615-01',

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

  // Number of milliseconds after which a connection to the upstream proxy will
  // time out if there's no activity on the socket.
  proxyTimeout: 10000,

  // Public directory containing static files.
  publicDir: path.join(__dirname, '/../public'),

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
    'ETag',
    'Location'
  ],
};
