#!/usr/bin/env node
"use strict";

// For details on how to set up New Relic reporting, see
// https://docs.newrelic.com/docs/nodejs/configuring-nodejs-with-environment-variables
if (process.env.RAWGIT_ENABLE_NEW_RELIC) {
  require('newrelic');
}

const express = require('express');
const hbs     = require('express-handlebars');
const path    = require('path');

const config     = require('./conf');
const middleware = require('./lib/middleware');
const stats      = require('./lib/stats');

// -- Configure Express --------------------------------------------------------
const app = express();

app.disable('x-powered-by');

if (app.get('env') === 'development') {
  app.use(require('morgan')('dev'));
}

app.engine('handlebars', hbs({
  defaultLayout: 'main',
  helpers      : require('./lib/helpers'),
  layoutsDir   : path.join(__dirname, 'views', 'layouts'),
  partialsDir  : path.join(__dirname, 'views', 'partials')
}));

app.set('view engine', 'handlebars');

// Need to set the views directory explicitly or RawGit will break if it's run
// from any directory other than its own root.
app.set('views', path.join(__dirname, 'views'));

app.locals.config = config;

if (process.env.GOOGLE_ANALYTICS_ID) {
  app.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;
}

app.use(express.static(config.publicDir));

// -- Routes -------------------------------------------------------------------
app.get('/', (req, res) => {
  res.render('index', {includeMetaDescription: true});
});

app.get('/faq', (req, res) => {
  res.render('faq', {title: 'FAQ'});
});

app.get('/stats', (req, res) => {
  res.render('stats', {title: 'Usage Statistics'});
});

app.get('/stats.html', (req, res) => {
  res.redirect(301, '/stats');
});

// Don't allow requests for Google Webmaster Central verification files.
app.get('*/google[0-9a-f]{16}.html', middleware.error403);

// Public or private gist.
app.route(/^\/[0-9A-Za-z-]+\/[0-9a-f]+\/raw\/?/)
  .all(
    middleware.cdn,
    middleware.stats,
    middleware.security,
    middleware.noRobots,
    middleware.autoThrottle,
    middleware.accessControl
  )
  .get(
    middleware.fileRedirect(config.baseGistUrl),
    middleware.proxyPath(config.baseGistUrl)
  );

// Repo file.
app.route('/:user/:repo/:branch/*')
  .all(
    middleware.cdn,
    middleware.stats,
    middleware.security,
    middleware.noRobots,
    middleware.autoThrottle,
    middleware.accessControl
  )
  .get(
    middleware.fileRedirect(config.baseRepoUrl),
    middleware.proxyPath(config.baseRepoUrl)
  );

// Stats API.
app.get('/api/stats', (req, res) => {
  const count = Math.max(0, Math.min(20, req.query.count || 10));

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
app.use((req, res) => {
  res.status(404);
  res.sendFile(config.publicDir + '/errors/404.html');
});

app.use((err, req, res, next) => {
  /* eslint no-unused-vars: 0 */
  console.error(err.stack);
  res.status(err.status || 500);
  res.sendFile(config.publicDir + '/errors/500.html');
});

// -- Server -------------------------------------------------------------------
if (app.get('env') !== 'test') {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

module.exports = app;
