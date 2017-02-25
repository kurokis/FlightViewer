// アプリ全体の動作を定義するスクリプト
'use strict';
const electron = require("electron"); // Electronのモジュール
const app = electron.app; // アプリケーションをコントロールするモジュール
const BrowserWindow = electron.BrowserWindow; // ウィンドウを作成するモジュール
var {ipcMain} = require('electron');   // Inter-process communications

let mainWindow; // メインウィンドウはGCされないようにグローバル宣言

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function() {
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open developer tools for debug
  mainWindow.webContents.openDevTools();

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

//============================== Remote functions ==============================
exports.getTime = function(frame){
  return Math.round(global.sharedObject.time[frame]*100)/100;
}

exports.getTimeSeries = function(){
  return global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
}

exports.getLatLng = function(frame){
  var latlng = {
     'latitude': 0,
     'longitude': 0
   };
  if(exports.getFileReadStatus()){
    latlng.latitude = global.sharedObject.latitude[frame];
    latlng.longitude = global.sharedObject.longitude[frame];
  }
  return latlng;
}

exports.getLatLngSeries = function(){
  var lat = global.sharedObject.latitude.slice(global.sharedObject.framestart,global.sharedObject.framecurrent+1)
  var lon = global.sharedObject.longitude.slice(global.sharedObject.framestart,global.sharedObject.framecurrent+1)
  return exports.transpose([lat,lon]);
}

exports.getPositionXY = function(){
  var lat = global.sharedObject.latitude.slice(global.sharedObject.framestart,global.sharedObject.frameend+1)
  var lon = global.sharedObject.longitude.slice(global.sharedObject.framestart,global.sharedObject.frameend+1)
  return exports.transpose([lon,lat]);
}

exports.getGPSAltitude = function(frame){
  return global.sharedObject.gpsaltitude[frame];
}

exports.getGPSAltitudeSeries = function(){
  var t = global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  var x = global.sharedObject.gpsaltitude.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  return exports.transpose([t,x]);
}

exports.getBarometricAltitude = function(frame){
  return global.sharedObject.barometricaltitude[frame];
}

exports.getBarometricAltitudeSeries = function(){
  var t = global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  var x = global.sharedObject.barometricaltitude.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  return exports.transpose([t,x]);
}

exports.getRollSeries = function(){
  var t = global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  var x = global.sharedObject.roll.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  return exports.transpose([t,x]);
}

exports.getPitchSeries = function(){
  var t = global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  var x = global.sharedObject.pitch.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  return exports.transpose([t,x]);
}

exports.getYawSeries = function(){
  var t = global.sharedObject.time.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  var x = global.sharedObject.yaw.slice(global.sharedObject.framestart,global.sharedObject.frameend+1);
  return exports.transpose([t,x]);
}

exports.getEuler = function(index){
  var euler = {
     'roll': 0,
     'pitch': 0,
     'yaw': 0
   };
  if(exports.getFileReadStatus()){
    euler.roll = global.sharedObject.roll[index]*Math.PI/180;
    euler.pitch = global.sharedObject.pitch[index]*Math.PI/180;
    euler.yaw = global.sharedObject.yaw[index]*Math.PI/180;
  }
  return euler;
}

exports.getPosition = function(index){
  var position = {
     'x': 0,
     'y': 0,
     'z': 0
   };
  if(exports.getFileReadStatus()){
    position.x = (global.sharedObject.longitude[index]-global.sharedObject.longitude[0])*111111;
    position.y = (global.sharedObject.latitude[index]-global.sharedObject.latitude[0])*111111;
    position.z = (global.sharedObject.barometricaltitude[index]-global.sharedObject.barometricaltitude[0])*(-1);
  }
  return position;
}

exports.getNFrames = function(){
  return global.sharedObject.nframes;
}

exports.getFrameStart = function(){
  return global.sharedObject.framestart;
}

exports.getFrameCurrent = function(){
  return global.sharedObject.framecurrent;
}

exports.getFrameEnd = function(){
  return global.sharedObject.frameend;
}

exports.getAircraftType = function(){
  return global.sharedObject.aircrafttype;
}

exports.getPath = function(){
  return global.sharedObject.path;
}

exports.getFileReadStatus = function(){
  return global.sharedObject.filereadstatus;
}

exports.getHeading = function(frame){
  return global.sharedObject.yaw[frame]; // yaw and heading should be distingushed in the future
}

exports.setFrameStart = function(framestart){
  global.sharedObject.framestart = framestart;
}

exports.setFrameEnd = function(frameend){
  global.sharedObject.frameend = frameend;
}

exports.setFrameCurrent = function(framecurrent){
  global.sharedObject.framecurrent = framecurrent;
}

exports.setAircraftType = function(aircrafttype){
  global.sharedObject.aircrafttype = aircrafttype;
}

exports.setPath = function(path){
  global.sharedObject.path = path;
}

exports.setFileReadStatus = function(status){
  global.sharedObject.filereadstatus = status;
}

exports.decode = function(filepath){
  var exePath = __dirname+'\\py\\dist\\decodeDJI';
  const execFile = require('child_process').execFileSync;
  const child = execFile(exePath,[filepath]);
}

// matrix transpose
exports.transpose = function(matrix){
  return Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));
}

//======================== Inter-process communication =========================
// http://electron.atom.io/docs/api/ipc-main/
// http://electron.rocks/different-ways-to-communicate-between-main-and-renderer-process/

// 表示するフレームの範囲が変わったときのイベント
ipcMain.on('fireFrameRangeUpdate', (event, arg) => { // animationcontrol.js
  event.sender.send('frameRangeUpdate', null) // altitudeplot.js, attitudeplot.js, modelviewer.js, positionxyplot.js
})

// 表示するフレームが変わったときのイベント
ipcMain.on('fireFrameUpdate', (event, arg) => { // animationcontrol.js
  event.sender.send('frameUpdate', null) // mapviewer.js
})

// 要求に応じスライダーの状態を更新
ipcMain.on('fireSliderStatesUpdate', (event, arg) => { // readfile.js, pagetransfer.js
  event.sender.send('sliderStatesUpdate', null) // animationcontrol.js
})

// 要求に応じナビゲーションバーを更新
ipcMain.on('fireNavigationBarUpdate', (event, arg) => { // pagetransfer.js
  event.sender.send('navigationBarUpdate', null) // readfile.js
})

//============================= Global variables ===============================

// Global variables
global.sharedObject = {
  filecontents: 'None',
  time: null,
  latitude: null,
  longitude: null,
  gpsaltitude: null,
  barometricaltitude: null,
  quaternionw: null,
  quaternionx: null,
  quaterniony: null,
  quaternionz: null,
  roll: null,
  pitch: null,
  yaw: null,
  accelerometerx: null,
  accelerometery: null,
  accelerometerz: null,
  gyrox: null,
  gyroy: null,
  gyroz: null,
  magnetometerx: null,
  magnetometery: null,
  magnetometerz: null,
  nframes: 0,
  framestart: 0,
  framecurrent: 0,
  frameend: 0,
  aircrafttype: null,
  path: null,
  filereadstatus: false
}
