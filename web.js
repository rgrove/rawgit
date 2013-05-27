#!/usr/bin/env node
var express    = require('express'),
    blacklist  = require('./lib/blacklist'),
    middleware = require('./lib/middleware');

// -- Configure Express --------------------------------------------------------
var app = express();

app.disable('x-powered-by');

if (app.get('env') === 'development') {
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

app.get('*', function (req, res, next) {
    var referrer = req.get('referrer');

    if (referrer) {
        for (var i = 0, len = blacklist.length; i < len; i++) {
            if (blacklist[i].test(referrer)) {
                if (/\.js$/i.test(req.path)) {
                    res.sendfile(publicDir + '/js/evil.js', {
                        maxAge: 86400000 // 1 day
                    });
                } else if (/\.css$/i.test(req.path)) {
                    res.sendfile(publicDir + '/css/evil.css', {
                        maxAge: 86400000 // 1 day
                    });
                } else {
                    res.status(403);
                    res.type('txt').send('The referring website has been blacklisted for abusing rawgithub.com.');
                }

                return;
             }
        }
    }

    next();
});

// Repo file.
app.get('/:user/:repo/:branch/*',
    middleware.noRobots,
    middleware.proxyPath('https://raw.github.com'));

// Public or private gist.
app.get(/^\/[0-9A-Za-z-]+\/[0-9a-f]+\/raw\//,
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
