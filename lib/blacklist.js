/*jshint node:true */

"use strict";

// These silly websites are hotlinking to rawgithub.com in production, which is
// totally against the rules. So we'll have some fun with them.
module.exports = {
    // This is an array of strings or regexes that match referrer URLs.
    referrers: [
        // /^http:\/\/(?:www\.)?example\.com\//i
        'http://bznuatlas01.win.auto.lan:8080/view/Auto.Build/',
        /^https?:\/\/(?:www\.)?betamerica\.com\//i,
        /^https?:\/\/(?:www\.)?donjacobo\.net\//i,
        /^https?:\/\/(?:www\.)?dotz\.com\.br\//i,
        /^https?:\/\/(?:www\.)?law\.columbia\.edu\//i,
        /^https?:\/\/(?:www\.)?nudoq\.org\//i,
        /^https?:\/\/(?:www\.)?qrabell\.com\//i,
        /^https?:\/\/(?:www\.)?thevuccilawgroup\.com\//i,
        /^https?:\/\/(?:www\.)regioactive\.de\//i,
        /^https?:\/\/darkspotinthecorner\.github\.io\//i,
        /^https?:\/\/deborahandersonphoto\.com\//i,
        /^https?:\/\/git\.testling\.com\//i,
        /^https?:\/\/glowinggirlstar\.tumblr\.com\//i,
        /^https?:\/\/orteil\.dashnet\.org\//i,
        /^https?:\/\/rawgithub\.com\/MokaCreativeLLC\//i,
        /^https?:\/\/rawgithub\.com\/patilv\/UseR\/master\//i, // 3+ requests per second!
        /^https?:\/\/torrentpier\.me\//i,
        /^https?:\/\/www\.werewolvesfuckyoface\.com\//i,
        /^https?:\/\/xivmodels\.com\//i
    ],

    // This is an array of strings or regexes that match request URIs (paths and
    // filenames only, no query strings).
    uris: [
        // /^\/foo\/bar\/baz\.js$/i
        '/ajaxorg/ace-builds/master/src-noconflict/ace.js',
        '/imShara/jslock/master/lock.min.js',
        '/ivanvandessel/jenkins/master/jenkinsCSSlong12.css',
        '/moment/moment/2.2.1/min/moment.min.js',
        '/timrwood/moment/2.1.0/min/moment.min.js',
        /\/arahmanali\/ah\.app\//i,
        /\/codef0rmer\/angular-dragdrop\//i,
        /\/Continuities\/adarkroom\//i,
        /\/darkspotinthecorner\//i,
        /\/foxor\/LavaGame\//i,
        /\/greenc\/CookieMaster\//i,
        /\/lincoln-center\/email-templates\//i,
        /\/mathiasbynens\/jquery-placeholder\//i,
        /\/MokaCreativeLLC\//i,
        /\/Spreadsheets\//i
    ]
};
