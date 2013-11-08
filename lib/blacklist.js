/*jshint node:true */

// These silly websites are hotlinking to rawgithub.com in production, which is
// totally against the rules. So we'll have some fun with them.
module.exports = {
    // This is an array of strings or regexes that match referrer URLs.
    referrers: [
        // /^http:\/\/(?:www\.)?example\.com\//i
        'http://bznuatlas01.win.auto.lan:8080/view/Auto.Build/',
        /^https?:\/\/(?:www\.)?betamerica\.com\//i,
        /^http:\/\/(?:www\.)?donjacobo\.net\//i,
        /^http:\/\/(?:www\.)?nudoq\.org\//i,
        /^http:\/\/(?:www\.)?qrabell\.com\//i,
        /^http:\/\/(?:www\.)?thevuccilawgroup\.com\//i,
        /^http:\/\/deborahandersonphoto\.com\//i,
        /^http:\/\/git\.testling\.com\//i,
        /^http:\/\/glowinggirlstar\.tumblr\.com\//i,
        /^http:\/\/rawgithub\.com\/patilv\/UseR\/master\//i, // 3+ requests per second!
        /^http:\/\/torrentpier\.me\//i,
        /^http:\/\/www\.werewolvesfuckyoface\.com\//i,
        /^http:\/\/xivmodels\.com\//i
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
        /\/codef0rmer\/angular-dragdrop\//i,
        /\/Continuities\/adarkroom\//i,
        /\/foxor\/LavaGame\//i,
        /\/lincoln-center\/email-templates\//i,
        /\/Spreadsheets\//i
    ]
};
