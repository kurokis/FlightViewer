// =============================================================================
// OpenStreetMapの2次元地図を定義するスクリプト
'use strict';
var leaflet = require('leaflet') // leaflet
require("leaflet-rotatedmarker"); // leaflet-rotatedmarker
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

var mapcontrolID = '#mapcontrol';

// マップを定義
var mymap = L.map('openStreetMap',{
	center: [35.712669, 139.762],
	zoom: 16,
});

// 軌跡を格納するpolylineを用意
var trajectory = L.polyline([[]], {color: 'red'});

// 現在の姿勢を示す
var arrow = L.polyline([[]], {color: 'blue'});

// マーカー
var markers = new Array();

initializeMap(mymap, trajectory, arrow); // 各種レイヤーを地図に追加

// =============================================================================
var mapcontrol = $(mapcontrolID);
mapcontrol.append("<input type='button' id='addMarkerButton' value='マーカー追加'></input> <input type='button' id='clearMarkerButton' value='クリア'></input>");

// =============================================================================
// ズームレベルが変更されたときの処理
mymap.on("zoomend", function(){
	if(main.getFileReadStatus()==true){
		// 方角を再描画
	 var heading = main.getHeading(main.getFrameCurrent());
	 var latlng = main.getLatLng(main.getFrameCurrent());
	 arrow.setLatLngs( makeArrow(heading, latlng.latitude, latlng.longitude, mymap.getZoom()) );
	 arrow.redraw();
 }
});

// =============================================================================
// マーカー追加ボタンが押されたときの処理
$('#addMarkerButton').on('click', function(){
	var heading = main.getHeading(main.getFrameCurrent());
	if(heading<0){heading += 360;}
	var latlng = main.getLatLng(main.getFrameCurrent());

	var arrowIcon = L.icon({
	    iconUrl: 'img/arrow.png',
	    iconSize:     [35, 55], // size of the icon
	    iconAnchor:   [18, 28], // point of the icon which will correspond to marker's location
	    popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
	});

	var str = main.getTime(main.getFrameCurrent())+ "s, "
		+ heading.toFixed(0) + "&deg;, "
		+	main.getGPSAltitude(main.getFrameCurrent()).toFixed(2) + "m";


	var marker = new L.marker([latlng.latitude,latlng.longitude], {icon: arrowIcon, rotationAngle: heading, rotationOrigin: 'center center'}).bindPopup(str,{closeOnClick: false, autoClose:false}).openPopup();
	markers.push(marker);
	mymap.addLayer(marker);
});

// =============================================================================
// マーカークリアボタンが押されたときの処理
$('#clearMarkerButton').on('click', function(){
	for(var i = 0; i < markers.length; i++){
    mymap.removeLayer(markers[i]);
	}
});

// =============================================================================
// ipc handler
ipcRenderer.on('frameUpdate', (event, arg) => {
	if(main.getFileReadStatus()==true){
		// 軌跡を再描画
	  var latlngs = main.getLatLngSeries();
	  trajectory.setLatLngs(latlngs);
	  trajectory.redraw();

		// ズームレベルを設定
	  var fixZoom = false;
		if(!fixZoom){
	    // zoom the map to the polyline
	    mymap.fitBounds(trajectory.getBounds());
	  }

		// 方角を再描画
		var heading = main.getHeading(main.getFrameCurrent());
		var latlng = main.getLatLng(main.getFrameCurrent());
		arrow.setLatLngs( makeArrow(heading, latlng.latitude, latlng.longitude, mymap.getZoom()) );
		arrow.redraw();
	}
})

// =============================================================================
function initializeMap(map, trajectory, arrow){
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
		"軌跡": trajectory,
		"Arrow": arrow,
	};

	// 地図にレイヤーを追加
	map.addLayer(gsi_sat);

	// 地図に軌跡を追加
	map.addLayer(trajectory);

	// 地図に方角を追加
	map.addLayer(arrow);

	// コントロールでレイヤーを選択できるようにする
	L.control.layers(baseMaps,overlayMaps).addTo(map);

	// スケールを表示する
	L.control.scale().addTo(mymap);
}

function makeArrow(heading, latitude, longitude, zoomlevel){
	var s = Math.pow(2,-zoomlevel)*10; //*0.0000005;

	var invcoslat = 1.0/Math.cos(latitude*Math.PI/180.); // rad
	var h = heading*Math.PI/180; // heading in rad

	var p1 = [-Math.sin(h)*s+latitude, Math.cos(h)*s*invcoslat+longitude ];
	var p2 = [ Math.sin(h)*s+latitude, -Math.cos(h)*s*invcoslat+longitude ];
	var p3 = [ 5*Math.cos(h)*s+latitude, 5*Math.sin(h)*s*invcoslat+longitude ];

	return [p1,p2,p3,p1];
}
