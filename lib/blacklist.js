/*jshint node:true */

"use strict";

// These silly websites are hotlinking to rawgithub.com in production, which is
// totally against the rules. So we'll have some fun with them.
module.exports = {
    // This is an array of strings or regexes that match referrer URLs.
    referrers: [
        /^https?:\/\/(?:www\.)?dotz\.com\.br\//i,
        /^https?:\/\/bznuatlas01\.win\.auto\.lan:8080\//i,
        /^https?:\/\/darkspotinthecorner\.github\.io\//i,
        /^https?:\/\/es\.exactme\.com\//i,
        /^https?:\/\/orteil\.dashnet\.org\//i,
        /^https?:\/\/rawgithub\.com\/patilv\//i
    ],

    // This is an array of strings or regexes that match request URIs (paths and
    // filenames only, no query strings).
    uris: [
        '/moment/moment/2.2.1/min/moment.min.js',
        '/timrwood/moment/2.1.0/min/moment.min.js',
        /\/ajaxorg\/ace-builds\//i,
        /\/arahmanali\/ah\.app\//i,
        /\/codef0rmer\/angular-dragdrop\//i,
        /\/Continuities\/adarkroom\//i,
        /\/darkspotinthecorner\//i,
        /\/foxor\/LavaGame\//i,
        /\/greenc\/CookieMaster\//i,
        /\/imShara\/jslock\//i,
        /\/ivanvandessel\/jenkins\//i,
        /\/lincoln-center\/email-templates\//i,
        /\/logicbox\/jquery-simplyscroll\//i,
        /\/mathiasbynens\/jquery-placeholder\//i,
        /\/patilv\//i,
        /\/Spreadsheets\//i
    ]
};
