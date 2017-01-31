// デモプロットを定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var flot = require("./lib/jquery.flot.js"); // flot
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

// Placeholder ID with #
var placeholderID = '#FlotDemo01';

// Plot options
var data = [];
var options = {
  series: {
      lines: { show: true },
      points: { show: false }
  }
};
var plot = $.plot(placeholderID,data,options);

// =============================================================================
// Change dimension on resize
$(window).resize(function() {
    refresh();
});

// =============================================================================
// ipc handler
ipcRenderer.on('plotUpdate', (event, arg) => {
  plotData();
})

// =============================================================================
// Plot update
function plotData(){
  var t = main.getTimestamp();
  var x = main.getLat();
  var data = [main.transpose([t,x])];
  plot.setData(data);
  refresh();
}
// Plot refresh
function refresh(){
  plot.resize();
  plot.setupGrid();
  plot.draw();
}
