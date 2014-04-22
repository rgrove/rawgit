#!/usr/bin/env node

/*jshint node:true */

"use strict";

// For details on how to set up New Relic reporting, see
// https://docs.newrelic.com/docs/nodejs/configuring-nodejs-with-environment-variables
if (process.env.RAWGIT_ENABLE_NEW_RELIC) {
    require('newrelic');
}

var config     = require('./conf'),
    express    = require('express'),
    hbs        = require('express3-handlebars'),
    middleware = require('./lib/middleware'),
    stats      = require('./lib/stats');

// -- Configure Express --------------------------------------------------------
var app = express();

app.disable('x-powered-by');

if (app.get('env') === 'development') {
    app.use(require('response-time')());
    app.use(require('morgan')('tiny'));
}

app.engine('handlebars', hbs({
    defaultLayout: 'main',
    layoutsDir   : __dirname + '/views/layouts',
    partialsDir  : __dirname + '/views/partials'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

if (process.env.GOOGLE_ANALYTICS_ID) {
    app.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;
}

app.use(express.static(config.publicDir));

// -- Routes -------------------------------------------------------------------
app.get('/', function (req, res) {
    res.render('index', {includeMetaDescription: true});
});

app.get('/faq', function (req, res) {
    res.render('faq', {title: 'FAQ'});
});

app.get('/stats', function (req, res) {
    res.render('stats', {title: 'Usage Statistics'});
});

app.get('/stats.html', function (req, res) {
    res.redirect(301, '/stats');
});

// Don't allow requests for Google Webmaster Central verification files.
app.get('*/google[0-9a-f]{16}.html',
    middleware.error403);

// Public or private gist.
app.get(/^\/[0-9A-Za-z-]+\/[0-9a-f]+\/raw\//,
    middleware.cdn,
    middleware.stats,
    middleware.security,
    middleware.noRobots,
    middleware.autoThrottle,
    middleware.fileRedirect('https://gist.githubusercontent.com'),
    middleware.proxyPath('https://gist.githubusercontent.com'));

// Repo file.
app.get('/:user/:repo/:branch/*',
    middleware.cdn,
    middleware.stats,
    middleware.security,
    middleware.noRobots,
    middleware.autoThrottle,
    middleware.fileRedirect('https://raw.github.com'),
    middleware.proxyPath('https://raw.github.com'));

// Stats API.
app.get('/api/stats', function (req, res) {
    var count = Math.max(0, Math.min(20, req.query.count || 10));

    res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');

    res.jsonp({
        status: 'success',

        data: {
            since    : stats.since,
            files    : stats.files().slice(0, count),
            referrers: stats.referrers().slice(0, count)
        }
    });
});

// -- Error handlers -----------------------------------------------------------
app.use(function (req, res, next) {
    res.status(404);
    res.sendfile(config.publicDir + '/errors/404.html');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500);
    res.sendfile(config.publicDir + '/errors/500.html');
});

// -- Server -------------------------------------------------------------------
var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});
