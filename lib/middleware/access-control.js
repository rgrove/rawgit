/**
Sets access control headers.
**/

"use strict";

module.exports = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');

  // Handle preflight requests.
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age'      : 2592000, // 30 days
      'Content-Length'              : 0
    });

    return void res.send();
  }

  next();
};
