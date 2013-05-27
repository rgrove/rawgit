// These silly websites are hotlinking to rawgithub.com in production, which is
// totally against the rules. So we'll have some fun with them.
//
// This is an array of regexes that match referrer URLs.
module.exports = [
    /foxrio2\.com/i,
    /mix1079\.net/i,
    /recipebox\.tv/i,
    /stockdog\.tw/i
];
