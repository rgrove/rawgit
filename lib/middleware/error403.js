"use strict";

const config = require('../../conf');

// Sends a generic 403 Forbidden response.
module.exports = (req, res) => {
  res.status(403);

  if (req.accepts('html')) {
    res.sendFile(config.publicDir + '/errors/403.html');
    return;
  }

  res.type('txt').send('Not cool, man.');
};
