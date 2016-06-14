"use strict";

module.exports = (req, res, next) => {
  req.isCDN = req.get('rawgit-cdn') === 'Yup';
  next();
};
