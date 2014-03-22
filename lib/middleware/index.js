/*jshint node:true */

"use strict";

module.exports = {
    autoThrottle: require('./auto-throttle'),
    error403    : require('./error403'),
    fileRedirect: require('./file-redirect'),
    noRobots    : require('./no-robots'),
    proxyPath   : require('./proxy-path'),
    security    : require('./security'),
    stats       : require('./stats')
};
