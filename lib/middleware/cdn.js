"use strict";

// -- Public Functions ---------------------------------------------------------
module.exports = function (req, res, next) {
    req.isCDN = req.get('rawgit-cdn') === 'Yup';
    next();
};
