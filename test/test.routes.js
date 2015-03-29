/* eslint-env mocha */
var app     = require('../web');
var assert  = require('chai').assert;
var helpers = require('./helpers');
var nock    = require('nock');
var request = require('supertest');

var agent = request.agent(app);

describe("Routes", function () {

// Nock sure does its best to make testing Express a pain in the ass.
beforeEach(function () {
  nock.enableNetConnect('127.0.0.1');
});

// -- Shared Tests -------------------------------------------------------------

/**
These tests run on all routes.

@param {String} url
  URL to request.
**/
function allRoutes(url) {
  it("should return status 200", function (done) {
    agent
      .get(url)
      .expect(200)
      .end(done);
  });

  it("should not return an x-powered-by header", function (done) {
    agent
      .get(url)
      .expect(function (res) {
        assert.isUndefined(res.get('x-powered-by'));
      })
      .end(done);
  });
}

/**
These tests run on all non-proxy routes.

@param {String} url
  URL to request.
**/
function nonProxyRoutes(url) {
  // Just in case someone makes a silly mistake.
  it("should not return an access-control-allow-origin header", function (done) {
    agent
      .get(url)
      .expect(function (res) {
        assert.isUndefined(res.get('access-control-allow-origin'));
      })
      .end(done);
  });
}

/**
These tests run on all proxy routes.

@param {String} url
  URL to request.
**/
function proxyRoutes(url) {
  it("should return `access-control-allow-origin: *`", function (done) {
    agent
      .get(url)
      .expect('access-control-allow-origin', '*')
      .end(done);
  });

  it("should return `x-content-type-options: nosniff`", function (done) {
    agent
      .get(url)
      .expect('x-content-type-options', 'nosniff')
      .end(done);
  });

  it("should return `x-robots-tag: none`", function (done) {
    agent
      .get(url)
      .expect('x-robots-tag', 'none')
      .end(done);
  });

  it("should return the correct content-type header", function (done) {
    agent.get(url)
      .expect('content-type', 'application/javascript;charset=utf-8')
      .end(done);
  });

  it("should return an etag header", function (done) {
    agent.get(url)
      .expect(function (res) {
          assert.isString(res.get('etag'));
      })
      .end(done);
  });

  it("should return a cache-control header with a short max-age", function (done) {
      agent.get(url)
        .expect('cache-control', 'max-age=300')
        .end(done);
  });

  it("response should not be gzipped", function (done) {
    agent.get(url)
      .expect(function (res) {
        assert.isUndefined(res.get('content-encoding'));
      })
      .end(done);
  });

  it("OPTIONS should return CORS preflight headers", function (done) {
    agent
      .options(url)
      .expect(200, '')
      .expect('access-control-allow-methods', 'GET')
      .expect('access-control-max-age', '2592000')
      .expect('content-length', '0')
      .end(done);
  });
}

// -- Tests --------------------------------------------------------------------

[
  '/',
  '/faq',
  '/stats'
].forEach(function (url) {
  describe(url, function () {
    allRoutes(url);
    nonProxyRoutes(url);
  });
});

describe("/bogus", function () {
  nonProxyRoutes('/bogus');

  it("should return status 404", function (done) {
    agent.get('/bogus')
      .expect(404)
      .end(done);
  });
});

describe("gist", function () {
  var url = '/rgrove/46e9059641b76d019af0/raw/67d94dc523758f45815946195c9c951b52b403b7/rawgit-test.js';

  describe("200", function () {
    helpers.useNockFixture('gist-200.json');

    it("should return the requested file", function (done) {
      agent.get(url)
        .expect(200, 'success!')
        .end(done);
    });

    proxyRoutes(url);
  });

  describe("404", function () {
    helpers.useNockFixture('gist-404.json');

    it("upstream 404 should result in a 404", function (done) {
      agent.get('/rgrove/123beef/raw/456beef/bogus.js')
        .expect(404)
        .end(done);
    });
  });
});

describe("repo", function () {
  describe("200", function () {
    helpers.useNockFixture('repo-200.json');

    var url = '/rgrove/rawgit/e8c43410/web.js';

    it("should return the requested file", function (done) {
      agent.get(url)
        .expect(200, /^#!\/usr\/bin\/env node/)
        .end(done);
    });

    proxyRoutes(url);
  });

  describe("404", function () {
    helpers.useNockFixture('repo-404.json');

    it("upstream 404 should result in a 404", function (done) {
      agent.get('/rgrove/bogus/bogus/bogus.js')
        .expect(404)
        .expect('cache-control', 'max-age=300')
        .end(done);
    });
  });
});

});
