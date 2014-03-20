/*jshint node:true */

/**
Tails an upstream log file in Common or Combined Log Format and updates internal
request stats in real time based on logged requests.

@module log-parser
**/

"use strict";

var config = require('../conf'),
    fs     = require('fs'),
    spawn  = require('child_process').spawn,
    stats  = require('./stats');

/**
Matches a line in a Common or Combined Log Format log file.

Captured subpatterns:

  1. ip
  2. date
  3. method
  4. url
  5. status
  6. bytes
  7. referrer (optional)
  8. useragent (optional)

@var {RegExp} REGEX_CLF
@final
**/
var REGEX_CLF = /^(\S+) \S+ \S+ \[(.+?)\] "(\S+) (\S+) \S+" (\S+) (\S+)(?: "([^"]*)" "([^"]*)")?$/;

/**
Matches everything from the beginning of a URL's query string to the end of the
string. Used to strip query strings out of URLs.

@var {RegExp} REGEX_QUERY
@final
**/
var REGEX_QUERY = /\?.*$/;

// -- Public Properties --------------------------------------------------------

/**
Whether or not the log parser is enabled.

@property {Boolean} enabled
**/
exports.enabled = init();

// -- Private Functions --------------------------------------------------------

/**
Initializes the log parser.

@method init
@return {Boolean} Whether or not log parsing is enabled.
@private
**/
function init() {
    var logPath = config.upstreamRequestLog;

    if (!logPath || !fs.existsSync(logPath)) {
        return false;
    }

    tail(logPath);
    return true;
}

/**
Parses a single line from a CLF log file and updates file and referrer request
stats.

@method parseLine
@param {String} line Line to parse.
@private
**/
function parseLine(line) {
    var matches = line.match(REGEX_CLF);

    if (!matches) {
        return;
    }

    var path     = matches[4].replace(REGEX_QUERY, ''),
        referrer = matches[7].replace(REGEX_QUERY, '');

    if (path) {
        stats.fileCache.set(path, (stats.fileCache.get(path) || 0) + 1);
    }

    if (referrer && referrer !== '-') {
        stats.referrerCache.set(referrer,
            (stats.referrerCache.get(referrer) || 0) + 1);
    }
}

/**
Tails the log file at _logPath_ and parses new lines as they're added.

@method tail
@param {String} logPath Path to a CLF log file.
@private
**/
function tail(logPath) {
    var tailProcess = spawn('tail', ['-F', '-n', '0', logPath]),
        tailStream  = tailProcess.stdout;

    tailProcess.on('error', function () {
        console.error('Error tailing ' + logPath);
        exports.enabled = false;
    });

    tailProcess.on('exit', function () {
        tailStream.removeAllListeners();
        console.error('Tail process exited. Respawning.');
        tail(logPath);
    });

    tailStream.setEncoding('utf8');

    var overflow = '';

    tailStream.on('readable', function () {
        var chunk = tailStream.read(),
            lines = (overflow + chunk).split("\n");

        overflow = lines.pop();

        for (var i = 0, len = lines.length; i < len; ++i) {
            parseLine(lines[i]);
        }
    });
}
