/**
Automatically throttles and blacklists naughty requests.
**/

"use strict";

var config = require('../../conf');
var path   = require('path');
var stats  = require('../stats');

var WARNING_MESSAGE = "This site is sending too much traffic to " +
        config.devDomain + ". Please switch to " + config.cdnDomain +
        " or you will be blacklisted.";

if (process.env.RAWGIT_ENABLE_NEW_RELIC) {
    var newrelic = require('newrelic');
}

module.exports = function (req, res, next) {
    if (req.isCDN || !config.autoThrottle) {
        return void next();
    }

    var file        = stats.file(req.path);
    var referrer    = stats.referrer(req.canonicalReferrer);
    var naughtiness = Math.max(file.naughtiness, referrer.naughtiness);

    res.setHeader('RawGit-Naughtiness', naughtiness);

    if (naughtiness >= 5) {
        return void defend(req, res);
    }

    if (naughtiness >= 1) {
        return void blacklist(req, res);
    }

    if (naughtiness >= 0.5) {
        // Let this request stew a while (up to 20 seconds) before we respond.
        res.setHeader('RawGit-Message', WARNING_MESSAGE);
        return void delay(20000 * naughtiness, next);
    }

    next();
};

// -- Private Functions --------------------------------------------------------

function blacklist(req, res) {
    res.setHeader('Cache-Control', 'max-age=15778476'); // 6 months
    res.setHeader('RawGit-Blacklisted', 'yup');

    return void res.render('errors/blacklisted', {
        cdnUrl: req.protocol + '://' + config.cdnDomain + req.originalUrl,
        devUrl: req.protocol + '://' + config.devDomain + req.originalUrl,
        layout: false,
    });
}

function defend(req, res) {
    res.setHeader('Cache-Control', 'max-age=15778476'); // 6 months
    res.setHeader('RawGit-Blacklisted', 'yup');

    switch (path.extname(req.path).toLowerCase()) {
    case '.css':
        return void res.sendFile(path.join(config.publicDir, '/css/defend.css'));

    case '.js':
        return void res.sendFile(path.join(config.publicDir, '/js/defend.js'));

    default:
        return void blacklist(req, res);
    }
}

function delay(ms, callback) {
    if (typeof newrelic !== 'undefined') {
        newrelic.setIgnoreTransaction();
    }

    setTimeout(callback, ms);
}
