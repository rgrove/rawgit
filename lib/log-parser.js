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
Matches the colon between the date and the time in a CLF datestamp. Used to
replace that damn colon with a space so we can parse the date.

@var {RegExp} REGEX_DATE
@final
**/
var REGEX_DATE = /(\/\d+):(\d+)/;

/**
Matches an external (GitHub) request path. Used to avoid logging stats for
rawgithub.com pages and assets.

@var {RegExp} REGEX_EXTERNAL
@final
**/
var REGEX_EXTERNAL = /^\/.+?\/.+?\/.+?\/.+/;

/**
Matches a URL that should be considered a loopback URL and exempted from
referrer-based naughtiness calculations. Supports both IPv4 and IPv6 loopback
addresses.

@var {RegExp} REGEX_LOOPBACK_URL
@final
**/
var REGEX_LOOOPBACK_URL = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[(?:(?:0+:){7}|::)0*1(?:\/128)?\])(?::\d+)?\//i;

/**
Matches everything from the beginning of a URL's query string to the end of the
string. Used to strip query strings out of URLs.

@var {RegExp} REGEX_QUERY
@final
**/
var REGEX_QUERY = /\?.*$/;

/**
Matches the beginning of a rawgit(hub).com URL.

@var {RegExp} REGEX_RAWGIT
@final
**/
var REGEX_RAWGIT = /^https?:\/\/rawgit(?:hub)?\.com\//i;

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

    var path = matches[4].replace(REGEX_QUERY, '');

    // Ignore pages and assets hosted on this server.
    if (!REGEX_EXTERNAL.test(path)) {
        return;
    }

    var referrer = matches[7].replace(REGEX_QUERY, '');

    // Ignore localhost referrers.
    if (REGEX_LOOOPBACK_URL.test(referrer)) {
        return;
    }

    // Ignore non-proxied rawgithub referrers.
    if (REGEX_RAWGIT.test(referrer) && !REGEX_EXTERNAL.test(referrer)) {
        return;
    }

    var size = parseInt(matches[6], 10) || 0,
        time = Date.parse(matches[2].replace(REGEX_DATE, '$1 $2')) || 0;

    stats.logRequest(path, referrer, size, time);
}

/**
Tails the log file at _logPath_ and parses new lines as they're added.

@method tail
@private

@param {String} logPath
    Path to a CLF log file.

@param {Boolean} [respawn=false]
    Whether this is a respawn (meaning scrollback should be ignored).
**/
function tail(logPath, respawn) {
    var scrollBack  = respawn ? 0 : config.upstreamRequestLogScrollback || 0,
        tailProcess = spawn('tail', ['-F', '-n', scrollBack, logPath]),
        tailStream  = tailProcess.stdout;

    tailProcess.on('error', function () {
        console.error('Error tailing ' + logPath);
        exports.enabled = false;
    });

    tailProcess.on('exit', function () {
        console.error('Tail process exited. Respawning.');
        tailStream.removeAllListeners();
        tail(logPath, true);
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
