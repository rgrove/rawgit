/**
Looks up MIME type and charset info for a file path.
**/

'use strict';

const types = require('../conf/mime-types');

// Create a lookup map of extensions to types.
let extensions = Object.create(null);

Object.keys(types).forEach(type => {
  let exts = types[type].extensions;

  if (exts) {
    exts.forEach(extension => {
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
exports.contentType = (filePath, forceCharset) => {
  let ext     = filePath.match(/.\.([^.]+?)$/);
  let type    = (ext && extensions[ext[1].toLowerCase()]) || 'application/octet-stream';
  let charset = forceCharset || types[type].charset;

  if (charset) {
    type += ';charset=' + charset.toLowerCase();
  }

  return type;
};
