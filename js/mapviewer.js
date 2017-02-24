// =============================================================================
// OpenStreetMapの2次元地図を定義するスクリプト
'use strict';
var leaflet = require('leaflet') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");


// マップを定義
var mymap = L.map('openStreetMap',{
	center: [35.712669, 139.762],
	zoom: 16,
});

// 軌跡を格納するpolylineを用意
var trajectory = L.polyline([[]], {color: 'red'});

initializeMap(mymap,trajectory); // 各種レイヤーを地図に追加

// =============================================================================
// ipc handler
// Plot data on 'plotUpdate' event
ipcRenderer.on('frameUpdate', (event, arg) => {
  var latlngs = main.getLatLngSeries();
  trajectory.setLatLngs(latlngs);
  trajectory.redraw();

  var fixZoom = false;
	if(!fixZoom){
    // zoom the map to the polyline
    mymap.fitBounds(trajectory.getBounds());
  }
})

// =============================================================================
function initializeMap(map, trajectory){
	// OSM Layer
	var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		maxNativeZoom: 19,
		minZoom: 4,
		maxZoom: 20,
	});

	//国土地理院電子国土基本図
	var gsi_basic = L.tileLayer(
		'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
		{
			attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>",
			maxNativeZoom: 18,
			minZoom: 4,
			maxZoom: 20,
		}
	);

	//国土地理院シームレス空中写真
	var gsi_sat = L.tileLayer(
		'http://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
		{
			attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>",
			maxNativeZoom: 18,
			minZoom: 4,
			maxZoom: 20,
		}
	);

	// コントロールに表示するテキストとレイヤーの対応付け
	var baseMaps = {
		"OpenStreetMap": osm,
		"国土地理院 電子国土基本図": gsi_basic,
		"国土地理院 空中写真": gsi_sat
	};
	var overlayMaps = {
		"軌跡": trajectory
	};

	// 地図にレイヤーを追加
	map.addLayer(osm);
	map.addLayer(gsi_basic);
	map.addLayer(gsi_sat);

	// 地図に軌跡を追加
	map.addLayer(trajectory);

	// コントロールでレイヤーを選択できるようにする
	L.control.layers(baseMaps,overlayMaps).addTo(map);

	// スケールを表示する
	L.control.scale().addTo(mymap);
}
