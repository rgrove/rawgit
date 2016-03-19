/* eslint-env mocha */
'use strict';

const path = require('path');

/**
Test helpers.
**/

/**
Uses the Nock fixture in the given _filename_ for the duration of the current
`describe` block.

@param {String} filename
**/
exports.useNockFixture = filename => {
  let nock = require('nock');
  let nockDone;

  nock.back.fixtures = path.join(__dirname, 'fixtures');

  beforeEach((done) => {
    nock.back(filename, cb => {
      nockDone = cb;

      // Nock fucks everything up unless we keep re-enabling connections to
      // Express.
      nock.enableNetConnect('127.0.0.1');

      done();
    });
  });

  afterEach(() => {
    nockDone();
  });
};
