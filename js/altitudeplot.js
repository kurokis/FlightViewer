// =============================================================================
// 高度表示を定義するスクリプト
'use strict';
var $ = jQuery = require("../lib/jquery-3.1.1.min.js"); // jQuery
var flot = require("../lib/jquery.flot.js"); // flot
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

// Placeholder ID with #
var placeholderID = '#altitudePlot';
var choiceContainerID = '#altitudePlotChoices';

// Plot options
var datasets = {
  "gps": {
    label: "GPS",
    data: []
  },
  "barometric": {
    label: "Barometric",
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

// チェックボックスをページに挿入し、クリックされたらグラフを更新
var choiceContainer = $(choiceContainerID);
$.each(datasets, function(key, val) {
  choiceContainer.append("<input type='checkbox' name='" + key +
    "' checked='checked' id='id" + key + "'></input>" +
    "<label for='id" + key + "'>"
    + val.label + "</label>");
});
choiceContainer.find("input").click(plotData);

// ホバー時に値が表示されるようにする
$("<div id='tooltipAttitude'></div>").css({
	position: "absolute",
	display: "none",
	border: "1px solid #fdd",
	padding: "2px",
	"background-color": "#fee",
	opacity: 0.80
}).appendTo("body");
$(placeholderID).bind("plothover", function (event, pos, item) {
  if (item) {
		var x = item.datapoint[0].toFixed(2),
			  y = item.datapoint[1].toFixed(2);

		$("#tooltipAttitude").html(item.series.label + " = " + y + " at t = " + x)
			.css({top: item.pageY+5, left: item.pageX+5})
			.fadeIn(200);
	} else {
		$("#tooltipAttitude").hide();
	}
})

// プロットを作成
var data = [];
var options = {
  series: {
      lines: { show: true },
      points: { show: false },
      shadowSize: 0 // Drawing is faster without shadows
  },
  grid: {
    hoverable: true,
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
ipcRenderer.on('frameRangeUpdate', (event, arg) => {
  plotData();
})

// ipc handler
ipcRenderer.on('frameUpdate', (event, arg) => {
  // 現在時刻を示す垂直線を引く
  var xVertical = main.getTime(main.getFrameCurrent());
  var markings = [
			{ color: "#ff0000", lineWidth: 1, xaxis: { from: xVertical, to: xVertical } },
		];
  plot.getOptions().grid.markings = markings;

  var gpsaltitude = main.getGPSAltitude(main.getFrameCurrent());
  var barometricaltitude = main.getBarometricAltitude(main.getFrameCurrent());
  var str = " GPS:" + (gpsaltitude).toFixed(2) + " m, ";
  str += " Barometric:" + (barometricaltitude).toFixed(2) + " m";
  $('#altitudeText').text(str);

  plot.draw();
})

// =============================================================================
// Plot update
function plotData(){
  // Update datasets
  datasets['gps'].data = main.getGPSAltitudeSeries();
  datasets['barometric'].data = main.getBarometricAltitudeSeries();

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

// =============================================================================
// Plot refresh
function refresh(){
  plot.resize();
  plot.setupGrid();
  plot.draw();
}
