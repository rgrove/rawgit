#!/usr/bin/env node
var express    = require('express'),
    middleware = require('./lib/middleware');

// -- Configure Express --------------------------------------------------------
var app = express();

app.disable('x-powered-by');

if (app.get('env' === 'development')) {
    app.use(express.responseTime());
    app.use(express.logger('tiny'));
}

// Global middleware to set some security-related headers.
app.use(function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options'     : 'nosniff'
    });

    next();
});

// Public directory containing static files.
var publicDir = __dirname + '/public';

app.use(express.static(publicDir));
app.use(app.router);

// -- Routes -------------------------------------------------------------------

// Repo file.
app.get('/:user/:repo/:branch/*',
    middleware.noRobots,
    middleware.proxyPath('https://raw.github.com'));

// Gist.
app.get('/raw/*',
    middleware.noRobots,
    middleware.proxyPath('https://gist.github.com'));

// -- Error handlers -----------------------------------------------------------
app.use(function (req, res, next) {
    res.status(404);

    if (req.accepts('html')) {
        res.sendfile(publicDir + '/errors/404.html');
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
        res.sendfile(publicDir + '/errors/500.html');
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
