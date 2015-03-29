#!/usr/bin/env node

/**
Rewrites test fixtures to remove all requests to 127.0.0.1, which get recorded
by Nock as an annoying side effect, but which we don't actually want in our
fixtures.
**/

var fs = require('fs');

process.argv.slice(2).forEach(function (file) {
    var fixture = require('../' + file);
    var requests;

    requests = fixture.filter(function (request) {
        return !/^https?:\/\/127\.0\.0\.1/.test(request.scope);
    });

    fs.writeFileSync(file, JSON.stringify(requests, null, 4), {
        encoding: 'utf-8'
    });
});
