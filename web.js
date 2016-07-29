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
const request = require("request");

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
// app.get('/', (req, res) => {
//   res.render('index', {includeMetaDescription: true});
// });

app.get('/faq', (req, res) => {
  res.redirect('https://github.com/rgrove/rawgit/wiki/Frequently-Asked-Questions');
});

app.get('/stats', (req, res) => {
  res.render('stats', {title: 'Usage Statistics'});
});

app.get('/stats.html', (req, res) => {
  res.redirect(301, '/stats');
});


// site 
app.get(["/", "/index.html" , "/pricing.html", "/docs.html" ],function(req, res){

  var env = process.env.NODE_ENV || 'dev';
  if(req.path == "/" || "/index.html")
    var uri = config.routing[env].www;
  if (req.path == "/pricing.html")
    var uri = config.routing[env].pricing;
  if (req.path == "/docs.html")
    var uri = config.routing[env].docs;

  request(
    { 
      method: "GET", 
      uri: uri
    },
    function (error, response, body){
      if (!error && response.statusCode == 200) {
          res.writeHead(200, {
              'Content-Length': body.length ,
              'Content-Type': 'text/html' }
          );
          res.write(body);
          res.end();
      }else{
        console.log(error);
      }
    }
  )
})

// github
app.get(["/:user","/:user/:repo","/:user/:repo/:action"], function(req, res){

  var env = process.env.NODE_ENV || 'dev';

  console.log(config.routing[env].app);
  request(
    { 
      method: "GET", 
      uri: config.routing[env].app,
      gzip: true
    },
    function (error, response, body){
      if (!error && response.statusCode == 200) {
          res.writeHead(200, {
              'Content-Length': body.length ,
              'Content-Type': 'text/html' }
          );
          res.write(body);
          res.end();
      }else{
        
        console.log(error);

      }
    }
  )
})
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
  response.error(err.stack);
  res.status(err.status || 500);
  res.sendFile(config.publicDir + '/errors/500.html');
});

// -- Server -------------------------------------------------------------------
if (app.get('env') !== 'test') {
  const port = process.env.PORT || 5001;

  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

module.exports = app;
