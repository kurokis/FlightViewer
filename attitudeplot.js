// =============================================================================
// 姿勢表示(オイラー角)を定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var flot = require("./lib/jquery.flot.js"); // flot
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

// Placeholder ID with #
var placeholderID = '#attitudePlot';
var choiceContainerID = '#attitudePlotChoices';

// Plot options
var datasets = {
  "roll": {
    label: "Roll",
    data: []
  },
  "pitch": {
    label: "Pitch",
    data: []
  },
  "yaw": {
    label: "Yaw",
    data: []
  }
}

// hard-code color indices to prevent them from shifting as
// data are turned on/off
var i = 0;
$.each(datasets, function(key, val) {
	val.color = i;
	++i;
});

// insert checkboxes
var choiceContainer = $(choiceContainerID);
$.each(datasets, function(key, val) {
  choiceContainer.append("<input type='checkbox' name='" + key +
    "' checked='checked' id='id" + key + "'></input>" +
    "<label for='id" + key + "'>"
    + val.label + "</label>");
});

var data = [];
var options = {
  series: {
      lines: { show: true },
      points: { show: false }
  }
};
var plot = $.plot(placeholderID,data,options);

choiceContainer.find("input").click(plotData);

// =============================================================================
// Change dimension on resize
$(window).resize(function() {
    refresh();
});

// =============================================================================
// ipc handler
ipcRenderer.on('frameRangeUpdate', (event, arg) => {
  plotData();
})

// =============================================================================
// Plot update
function plotData(){
  if(main.getFileReadStatus()){ // If file read is complete
    // Update datasets
    var t = main.getTime();
    var roll = main.getRoll();
    var pitch = main.getPitch();
    var yaw = main.getYaw();

    datasets['roll'].data = main.transpose([t,roll]);
    datasets['pitch'].data = main.transpose([t,pitch]);
    datasets['yaw'].data = main.transpose([t,yaw]);

  	data = [];
  	choiceContainer.find("input:checked").each(function () {
  		var key = $(this).attr("name");
  		if (key && datasets[key]) {
  			data.push(datasets[key]);
  		}
  	});

    plot.setData(data);
    refresh();
  }
}

// =============================================================================
// Plot refresh
function refresh(){
  plot.resize();
  plot.setupGrid();
  plot.draw();
}
