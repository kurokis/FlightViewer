// =============================================================================
// 緯度経度表示を定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var flot = require("./lib/jquery.flot.js"); // flot
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

// Placeholder ID with #
var placeholderID = '#positionXYPlot';
var choiceContainerID = '#positionXYPlotChoices';

// Plot options
var datasets = {
  "gps": {
    label: "GPS",
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
var time = []; // ホバー時に利用する
$("<div id='tooltipPositionXY'></div>").css({
	position: "absolute",
	display: "none",
	border: "1px solid #fdd",
	padding: "2px",
	"background-color": "#fee",
	opacity: 0.80
}).appendTo("body");
$(placeholderID).bind("plothover", function (event, pos, item) {
  if (item) {
    var i = item.dataIndex;
		$("#tooltipPositionXY").html(item.series.label+ " at t = " + (time[i]).toFixed(2) + " s")
			.css({top: item.pageY+5, left: item.pageX+5})
			.fadeIn(200);
	} else {
		$("#tooltipPositionXY").hide();
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
  time = main.getTimeSeries();
  plotData();
})

// ipc handler
ipcRenderer.on('frameUpdate', (event, arg) => {

  var latlng = main.getLatLng(main.getFrameCurrent());
  var str = " Latitude:" + (latlng.latitude).toFixed(8) + " deg, ";
  str += " Longitude:" + (latlng.longitude).toFixed(7) + " deg";
  $('#positionxyText').text(str);

  //plot.draw();
})

// =============================================================================
// Plot update
function plotData(){
  // Update datasets
  datasets['gps'].data = main.getPositionXY();

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
