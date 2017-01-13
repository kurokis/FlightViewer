var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var flot = require("./lib/jquery.flot.js"); // flot

// Write this to access "export" functions in main.js
const main = require('electron').remote.require("./main");

// Placeholder ID with #
var placeholderID = '#FlotDemo01';

// Plot options
var data = [];
var options = {
  series: {
      lines: { show: true },
      points: { show: true }
  }
};

var button = document.getElementById('analyze');
button.addEventListener('click', ()=>{
  var t = main.getTimestamp();
  var x = main.getX();
  data = main.transpose([t,x]);
  $.plot(placeholderID, [ data ], options);
}, false);

// Change dimension on resize
$(window).resize(function() {
    $.plot(placeholderID, [ data ], options);
});
