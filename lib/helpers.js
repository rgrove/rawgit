"use strict";

const config = require('../conf');

module.exports = {
  /**
  Returns a CDN URL for the given local asset when running in a production
  environment and CDN information is set in the RawGit config. Otherwise,
  returns _path_ unmodified.

  @param {String} path
    Path to the local asset to load.

  @return {String}
  **/
  assetUrl(path) {
    if (config.isProduction && config.cdnRepo && config.cdnTag && config.cdnDomain) {
      if (path[0] === '/') {
        path = path.substr(1);
      }

      return '//' + config.cdnDomain + '/' + config.cdnRepo + '/' + config.cdnTag + '/public/' + path;
    }

    return path;
  }
};
