/* eslint-env mocha */
'use strict';

const assert  = require('chai').assert;
const nock    = require('nock');
const request = require('supertest');

const app     = require('../');
const helpers = require('./helpers');

const agent = request.agent(app);

describe("Routes", () => {
  // Nock sure does its best to make testing Express a pain in the ass.
  beforeEach(() => {
    nock.enableNetConnect('127.0.0.1');
  });

  // -- Shared Tests -------------------------------------------------------------

  /**
  These tests run on all routes.

  @param {String} url
    URL to request.
  **/
  function allRoutes(url) {
    it("should return status 200", (done) => {
      agent
        .get(url)
        .expect(200)
        .end(done);
    });

    it("should not return an x-powered-by header", (done) => {
      agent
        .get(url)
        .expect(res => {
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
    it("should not return an access-control-allow-origin header", (done) => {
      agent
        .get(url)
        .expect(res => {
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
    it("should return `access-control-allow-origin: *`", (done) => {
      agent
        .get(url)
        .expect('access-control-allow-origin', '*')
        .end(done);
    });

    it("should return `x-content-type-options: nosniff`", (done) => {
      agent
        .get(url)
        .expect('x-content-type-options', 'nosniff')
        .end(done);
    });

    it("should return `x-robots-tag: none`", (done) => {
      agent
        .get(url)
        .expect('x-robots-tag', 'none')
        .end(done);
    });

    it("should return the correct content-type header", (done) => {
      agent.get(url)
        .expect('content-type', 'application/javascript;charset=utf-8')
        .end(done);
    });

    it("should return an etag header", (done) => {
      agent.get(url)
        .expect(res => {
          assert.isString(res.get('etag'));
        })
        .end(done);
    });

    it("should return a cache-control header with a short max-age", (done) => {
      agent.get(url)
        .expect('cache-control', 'max-age=3600, s-maxage=300')
        .end(done);
    });

    it("response should not be gzipped", (done) => {
      agent.get(url)
        .expect(res => {
          assert.isUndefined(res.get('content-encoding'));
        })
        .end(done);
    });

    it("OPTIONS should return CORS preflight headers", (done) => {
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
  ].forEach(url => {
    describe(url, () => {
      allRoutes(url);
      nonProxyRoutes(url);
    });
  });

  describe("/bogus", () => {
    nonProxyRoutes('/bogus');

    it("should return status 404", (done) => {
      agent.get('/bogus')
        .expect(404)
        .end(done);
    });
  });

  describe("gist", () => {
    let url = '/rgrove/46e9059641b76d019af0/raw/67d94dc523758f45815946195c9c951b52b403b7/rawgit-test.js';

    describe("200", () => {
      helpers.useNockFixture('gist-200.json');

      it("should return the requested file", (done) => {
        agent.get(url)
          .expect(200, 'success!')
          .expect('cache-control', 'max-age=3600, s-maxage=300')
          .end(done);
      });

      describe("CDN", () => {
        it("should return the requested file, cacheable for 10 years", (done) => {
          agent.get(url)
            .set('rawgit-cdn', 'Yup')
            .expect(200, 'success!')
            .expect('cache-control', 'max-age=315569000, immutable')
            .end(done);
        });
      });

      proxyRoutes(url);
    });

    describe("404", () => {
      helpers.useNockFixture('gist-404.json');

      it("upstream 404 should result in a 404, cacheable for 5 minutes", (done) => {
        agent.get('/rgrove/123beef/raw/456beef/bogus.js')
          .expect(404)
          .expect('cache-control', 'max-age=300')
          .end(done);
      });

      describe("CDN", () => {
        it("upstream 404 should result in a 404, cacheable for 5 minutes", (done) => {
          agent.get('/rgrove/123beef/raw/456beef/bogus.js')
            .set('rawgit-cdn', 'Yup')
            .expect(404)
            .expect('cache-control', 'max-age=300')
            .end(done);
        });
      });
    });
  });

  describe("repo", () => {
    describe("200", () => {
      helpers.useNockFixture('repo-200.json');

      let url = '/rgrove/rawgit/e8c43410/web.js';

      it("should return the requested file", (done) => {
        agent.get(url)
          .expect(200, /^#!\/usr\/bin\/env node/)
          .expect('cache-control', 'max-age=3600, s-maxage=300')
          .end(done);
      });

      describe("CDN", () => {
        it("should return the requested file, cacheable for 10 years", (done) => {
          agent.get(url)
            .set('rawgit-cdn', 'Yup')
            .expect(200, /^#!\/usr\/bin\/env node/)
            .expect('cache-control', 'max-age=315569000, immutable')
            .end(done);
        });
      });

      proxyRoutes(url);
    });

    describe("404", () => {
      helpers.useNockFixture('repo-404.json');

      it("upstream 404 should result in a 404, cacheable for 5 minutes", (done) => {
        agent.get('/rgrove/bogus/bogus/bogus.js')
          .expect(404)
          .expect('cache-control', 'max-age=300')
          .end(done);
      });

      describe("CDN", () => {
        it("upstream 404 should result in a 404, cacheable for 5 minutes", (done) => {
          agent.get('/rgrove/bogus/bogus/bogus.js')
            .set('rawgit-cdn', 'Yup')
            .expect(404)
            .expect('cache-control', 'max-age=300')
            .end(done);
        });
      });
    });

    describe("index", () => {
      helpers.useNockFixture('repo-index.json');

      it("should return index.html when path is a directory", (done) => {
        agent.get('/jekyll/jekyll/gh-pages/')
          .expect(200, 'Hello world!')
          .expect('content-type', 'text/html;charset=utf-8')
          .expect('cache-control', 'max-age=3600, s-maxage=300')
          .end(done);
      });
    });
  });
});
