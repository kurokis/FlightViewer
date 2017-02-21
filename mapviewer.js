// =============================================================================
// OpenStreetMapの2次元地図を定義するスクリプト
'use strict';
var leaflet = require('leaflet') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

var mymap = L.map('openStreetMap').setView([35.712669, 139.762000], 15);

var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

L.control.scale().addTo(mymap); // show scale

var latlngs = [[]];
var polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);

// Plot data on 'plotUpdate' event
ipcRenderer.on('frameUpdate', (event, arg) => {
  // create a red polyline from an array of LatLng points
  //var latlngs = main.getLatLngs();
  //var polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);
  latlngs = main.getLatLngSeries();
  polyline.setLatLngs(latlngs);
  polyline.redraw();

  //if(latlngs.length>1){
    // zoom the map to the polyline
    mymap.fitBounds(polyline.getBounds());
  //}
})
