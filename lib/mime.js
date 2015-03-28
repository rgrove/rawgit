/**
Looks up MIME type and charset info for a file path.
**/

var types = require('../conf/mime-types');

// Create a lookup map of extensions to types.
var extensions = Object.create(null);

Object.keys(types).forEach(function (type) {
    var exts = types[type].extensions;

    if (exts) {
        exts.forEach(function (extension) {
            extensions[extension] = type;
        });
    }
});

/**
Returns a Content-Type header value for the given file path.

@param {String} filePath
    Path containing a filename.

@param {String} [forceCharset]
    If provided, the header will use this charset regardless of whether the MIME
    DB includes a recommended charset.

@return {String}
**/
exports.contentType = function (filePath, forceCharset) {
    var ext     = filePath.match(/.\.([^.]+?)$/);
    var type    = (ext && extensions[ext[1].toLowerCase()]) || 'application/octet-stream';
    var charset = forceCharset || types[type].charset;

    if (charset) {
        type += ';charset=' + charset.toLowerCase();
    }

    return type;
};
