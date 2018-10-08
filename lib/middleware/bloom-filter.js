'use strict';

const config = require('../../conf');

module.exports = (req, res, next) => {
  let filter = req.isCDN
    ? config.cdnBloomFilter
    : config.devBloomFilter;

  let repo = req.path
    .split('/', 3)
    .join('/');

  if (filter.has(repo)) {
    return void next();
  }

  res.set('Cache-Control', 'public; max-age: 3600')
    .status(403)
    .sendFile(`${config.publicDir}/errors/403-shutdown.html`);
};
