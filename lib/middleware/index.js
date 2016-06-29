"use strict";

module.exports = {
  accessControl: require('./access-control'),
  autoThrottle : require('./auto-throttle'),
  cdn          : require('./cdn'),
  error403     : require('./error403'),
  fileRedirect : require('./file-redirect'),
  noRobots     : require('./no-robots'),
  proxyPath    : require('./proxy-path'),
  security     : require('./security'),
  stats        : require('./stats')
};
