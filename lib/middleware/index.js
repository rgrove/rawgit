/*jshint node:true */

"use strict";

module.exports = {
    blacklist   : require('./blacklist'),
    error403    : require('./error403'),
    fileRedirect: require('./file-redirect'),
    noRobots    : require('./no-robots'),
    proxyPath   : require('./proxy-path'),
    stats       : require('../stats').middleware
};
