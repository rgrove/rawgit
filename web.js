#!/usr/bin/env node

/*jshint node:true */

"use strict";

var express    = require('express'),
    config     = require('./conf'),
    middleware = require('./lib/middleware'),
    stats      = require('./lib/stats');

// -- Configure Express --------------------------------------------------------
var app = express();

app.disable('x-powered-by');

if (app.get('env') === 'development') {
    app.use(express.responseTime());
    app.use(express.logger('tiny'));
}

app.use(express.static(config.publicDir, {maxAge: 300000}));

// Global middleware to set some security-related headers.
app.use(function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options'     : 'nosniff'
    });

    next();
});

app.use(app.router);

// -- Routes -------------------------------------------------------------------

// Don't allow requests for Google Webmaster Central verification files, because
// rawgithub.com isn't a hosting provider and people can't own URLs under its
// domain.
app.get('*/google[0-9a-f]{16}.html',
    middleware.error403);

// Public or private gist.
// Gist raw domain changed on 2014-02-21:
// http://developer.github.com/changes/2014-02-21-gist-raw-file-url-change/
app.get(/^\/[0-9A-Za-z-]+\/[0-9a-f]+\/raw\//,
    middleware.stats,
    middleware.blacklist,
    middleware.noRobots,
    middleware.fileRedirect('https://gist.githubusercontent.com'),
    middleware.proxyPath('https://gist.githubusercontent.com'));

// Repo file.
app.get('/:user/:repo/:branch/*',
    middleware.stats,
    middleware.blacklist,
    middleware.noRobots,
    middleware.fileRedirect('https://raw.github.com'),
    middleware.proxyPath('https://raw.github.com'));

// Stats API.
app.get('/api/stats', function (req, res, next) {
    var count = Math.max(0, Math.min(20, req.query.count || 10));

    res.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');

    res.jsonp({
        status: 'success',

        data: {
            since    : stats.since(),
            files    : stats.files().slice(0, count),
            referrers: stats.referrers().slice(0, count)
        }
    });
});

// -- Error handlers -----------------------------------------------------------
app.use(function (req, res, next) {
    res.status(404);

    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes

    if (req.accepts('html')) {
        res.sendfile(config.publicDir + '/errors/404.html');
        return;
    }

    if (req.accepts('json')) {
        res.send({error: 'Not found.'});
        return;
    }

    res.type('txt').send('Not found.');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);

    res.status(err.status || 500);

    if (req.accepts('html')) {
        res.sendfile(config.publicDir + '/errors/500.html');
        return;
    }

    if (req.accepts('json')) {
        res.send({error: '500 Internal Server Error'});
        return;
    }

    res.type('txt').send('Internal Server Error');
});

// -- Server -------------------------------------------------------------------
var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});
