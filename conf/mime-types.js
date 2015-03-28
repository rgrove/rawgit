"use strict";

/**
MIME type definitions consisting of those in `mime-db` plus custom additions and
overrides.

See <https://github.com/jshttp/mime-db> for details on the format.
**/

var db = require('mime-db');

// If you add a new type here, make sure its extensions are also in the
// extension whitelist in ./index.js or RawGit won't proxy requests for that
// type. Please keep definitions in alphabetical order.
db['application/n-triples'] = {
    charset     : 'utf-8',
    compressible: true,
    extensions  : ['nt']
};

db['application/vnd.geo+json'] = {
    charset     : 'utf-8',
    compressible: true,
    extensions  : ['geojson']
};

module.exports = db;
