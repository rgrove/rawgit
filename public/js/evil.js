alert("Don't send production traffic to rawgithub.com!");

/*
 * `evil.js` Version 42
 * http://kitcambridge.github.com/evil.js
 *
 * Mike Bannister, Mathias Bynens, Kit Cambridge, Nick Cammarata,
 * Adam J. Gamble, Devon Govett, Paul Irish, Bradley Meck, Alex Sexton,
 * Craig Stuntz, Mike Taylor, and Christian Wirkus.
*/

(function() {
  var Math = this.Math, reverse = [].reverse, slice = [].slice, getClass = {}.toString, toUpperCase = "".toUpperCase, random = Math.random,
  document = this.document, write = document && document.write, location = this.location, search = location && location.search,
  alert = this.alert, confirm = this.confirm;

  var Shift = [["`", "~"], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"],
    ["5", "%"], ["6", "^"], ["7", "&"], ["8", "*"], ["9", "("], ["-", "_"],
    ["=", "+"], ["[", "{"], ["]", "}"], ["\\", "|"], [";", ":"], ["'", "\""],
    [",", "<"], [".", ">"], ["/", "?"]];

  var Invert = [["\u0021", "\u00a1"], ["\u0022", "\u201e"], ["\u0026", "\u214b"],
    ["\u0027", "\u002c"], ["\u0028", "\u0029"], ["\u002e", "\u02d9"],
    ["\u0033", "\u0190"], ["\u0034", "\u152d"], ["\u0036", "\u0039"],
    ["\u0037", "\u2c62"], ["\u003b", "\u061b"], ["\u003c", "\u003e"],
    ["\u003f", "\u00bf"], ["\u0041", "\u2200"], ["\u0042", "\u1012"],
    ["\u0043", "\u2183"], ["\u0044", "\u25d6"], ["\u0045", "\u018e"],
    ["\u0046", "\u2132"], ["\u0047", "\u2141"], ["\u004a", "\u017f"],
    ["\u004b", "\u22ca"], ["\u004c", "\u2142"], ["\u004d", "\u0057"],
    ["\u004e", "\u1d0e"], ["\u0050", "\u0500"], ["\u0051", "\u038c"],
    ["\u0052", "\u1d1a"], ["\u0054", "\u22a5"], ["\u0055", "\u2229"],
    ["\u0056", "\u1d27"], ["\u0059", "\u2144"], ["\u005b", "\u005d"],
    ["\u005f", "\u203e"], ["\u0061", "\u0250"], ["\u0062", "\u0071"],
    ["\u0063", "\u0254"], ["\u0064", "\u0070"], ["\u0065", "\u01dd"],
    ["\u0066", "\u025f"], ["\u0067", "\u0183"], ["\u0068", "\u0265"],
    ["\u0069", "\u0131"], ["\u006a", "\u027e"], ["\u006b", "\u029e"],
    ["\u006c", "\u0283"], ["\u006d", "\u026f"], ["\u006e", "\u0075"],
    ["\u0072", "\u0279"], ["\u0074", "\u0287"], ["\u0076", "\u028c"],
    ["\u0077", "\u028d"], ["\u0079", "\u028e"], ["\u007b", "\u007d"],
    ["\u203f", "\u2040"], ["\u2045", "\u2046"], ["\u2234", "\u2235"]];

  var invert = function(value) {
    var results = "", length, size, character;
    for (length = value.length; length--;) {
      character = value.charAt(length);
      for (size = Invert.length; size--;) {
        if (Invert[size][0] == character) {
          character = Invert[size][1];
          break;
        }
      }
      results += character;
    }
    return results;
  };

  var XMLHttpRequest = this.XMLHttpRequest = function() {
    this.readyState = Infinity;
  };

  XMLHttpRequest.prototype.open = XMLHttpRequest.prototype.send = function() {};

  this.undefined = this.NaN = 1 / 0;
  this.Infinity = "\u221e";

  this.alert = function(value) {
    alert(invert(value));
  };

  this.confirm = function(value) {
    confirm(invert(value));
  };

  this.prompt = this.open;

  this.isNaN = function(value) {
    return true;
  };

  if (typeof search == "string") {
    eval(decodeURIComponent(search.replace("?", "")));
  }

  if (document && write) {
    document.write = function(element) {
      element = "<marquee><blink>" + element + "</blink></marquee>";
      write.call(document, element);
      write.call(document, element);
    };
  }

  this.Math = {
    "ceil": function() {
      return 42;
    },
    "max": Math.min,
    "min": function() {
      return Infinity;
    },
    "pow": function() {
      return "pow pow pow!";
    },
    "random": function() {
      return String.fromCharCode(~~(random() * 1e3));
    },
    "round": Math.sqrt,
    "SQRT2": Math.SQRT1_2,
    "SQRT1_2": Math.LOG2E,
    "LOG2E": Math.LN10,
    "LN10": Math.LN2,
    "LN2": Math.E,
    "E": Math.PI,
    "PI": 3.2
  };

  Array.prototype.reverse = function() {
    for (var length = this.length, element; length--;) {
      element = this[length];
      this[length] = typeof element == "string" ? reverse.call(element.split("")).join("") : (element * random());
    }
    return reverse.call(this);
  };

  Array.prototype.sort = function() {
    for (var index, element, length = this.length; length;) {
      index = ~~(random() * length);
      element = this[--length];
      this[length] = this[index];
      this[index] = element;
    }
    return this;
  };

  String.prototype.toUpperCase = function() {
    var value = toUpperCase.call(this).split(""), length, size, pair;
    for (length = value.length; length--;) {
      for (size = Shift.length; size--;) {
        pair = Shift[size];
        if (pair[0] == value[length]) {
          value[length] = pair[1];
        }
      }
    }
    return value.split("").replace(/([A-Z])/g, "$1\u0305");
  };

  if (typeof jQuery == "function") {
    jQuery.ajaxSetup({
      "async": false
    });
  }

  this.JSON = {
    "parse": function() {
      return {};
    },
    "stringify": function(value) {
      return getClass.call(value);
    }
  };

}).call(this);
