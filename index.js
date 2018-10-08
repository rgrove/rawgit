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
  res.set('Cache-Control', 'max-age=60');

  res.render('news/sunset', {
    includeMetaDescription: true
  });
});

app.get('/faq', (req, res) => {
  res.redirect('https://github.com/rgrove/rawgit/blob/master/FAQ.md');
});

app.get('/news/https-only', (req, res) => {
  res.render('news/https-only', {
    title: 'RawGit will become HTTPS-only on February 17, 2018'
  });
});

// Don't allow requests for Google Webmaster Central verification files.
app.get('*/google[0-9a-f]{16}.html', middleware.error403);

// Public or private gist.
app.route(/^\/[0-9A-Za-z-]{1,100}\/[0-9a-f]{1,100}\/raw\/?/)
  .all(
    middleware.cdn,
    middleware.security,
    middleware.noRobots,
    middleware.accessControl
  )
  .get(
    middleware.bloomFilter,
    middleware.fileRedirect(config.baseGistUrl),
    middleware.proxyPath(config.baseGistUrl)
  );

// Repo file.
app.route('/:user/:repo/:branch/*')
  .all(
    middleware.cdn,
    middleware.security,
    middleware.noRobots,
    middleware.accessControl
  )
  .get(
    middleware.bloomFilter,
    middleware.fileRedirect(config.baseRepoUrl),
    middleware.proxyPath(config.baseRepoUrl)
  );

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
