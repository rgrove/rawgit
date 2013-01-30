var express = require('express'),
    mime    = require('mime'),

    request = require('request').defaults({
        jar      : false,
        strictSSL: true,
        timeout  : 10000
    });

// -- Options ------------------------------------------------------------------

// Public directory containing static files.
var publicDir = __dirname + '/public';

// Array of request header names that should be passed through to GitHub from
// the user.
var passHeaders = [
    'Accept',
    'Accept-Charset',
    'Cache-Control',
    'If-None-Match',
    'Pragma',
    'User-Agent'
];

// -- Configure Express --------------------------------------------------------
var app = express();

app.disable('x-powered-by');
app.use(express.compress());

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

app.use(express.static(publicDir));
app.use(app.router);

// -- Routes -------------------------------------------------------------------

app.get('/:user/:repo/:branch/*', function (req, res, next) {
    var headers = {};

    // Pass certain request headers through to GitHub.
    passHeaders.forEach(function (header) {
        var value = req.header(header);

        if (value) {
            headers[header] = value;
        }
    });

    request('https://raw.github.com' + req.path, {headers: headers}, function (err, ghRes, body) {
        if (err) {
            next(err);
            return;
        }

        var status = ghRes.statusCode;

        if (status !== 200 && status !== 304) {
            next();
            return;
        }

        // Pass certain GitHub headers along in the response.
        res.set({
            'Date': ghRes.headers.date,
            'ETag': ghRes.headers.etag
        });

        if (status === 304) {
            res.send(304);
            return;
        }

        res.type(mime.lookup(req.path));
        res.send(body);
    });
});

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
