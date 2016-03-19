/* eslint no-alert: 0, no-console: 0 */

/*
This request has been blacklisted for sending too much traffic to rawgit.com.

Do not use rawgit.com URLs in production; that domain is for testing and
development only, and excessive traffic will result in blacklisting.

Only use cdn.rawgit.com in production. It has no traffic limits.

For details, see https://rawgit.com/faq
*/

(function (doc) {
  var message = 'This site or app is sending too much traffic to rawgit.com. Please contact its owner and ask them to use cdn.rawgit.com instead, which has no traffic limit.';

  if (typeof console !== 'undefined') {
    console.error(message);
  }

  if (!doc) {
    return void alert(message);
  }

  var div   = doc.createElement('div');
  var style = div.style;

  div.innerHTML = message;

  style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
  style.border = '5px solid #333';
  style.borderLeft = 'none';
  style.borderRight = 'none';
  style.color = '#fff';
  style.font = 'bold 26px/1.4 Helvetica, sans-serif';
  style.left = '0';
  style.padding = '1em';
  style.position = 'fixed';
  style.right = '0';
  style.top = '30%';
  style.zIndex = '9999';

  setTimeout(function () {
    doc.body.appendChild(div);
  }, 500);
}(this.document));
