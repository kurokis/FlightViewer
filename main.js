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
exports.getTime = function(){
  return global.sharedObject.time.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
}

exports.getLatLngs = function(){
  var lat = global.sharedObject.latitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1)
  var lon = global.sharedObject.longitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1)
  var latlon = exports.transpose([lat,lon]);
  return latlon;
}

exports.getPositionXY = function(){
  var lat = global.sharedObject.latitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1)
  var lon = global.sharedObject.longitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1)
  var xy = exports.transpose([lon,lat]);
  return xy;
}

exports.getGPSAltitude = function(){
  return global.sharedObject.gpsaltitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
}

exports.getBarometricAltitude = function(){
  return global.sharedObject.barometricaltitude.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
}

exports.getRoll = function(){
  return global.sharedObject.roll.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
}

exports.getPitch = function(){
  return global.sharedObject.pitch.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
}

exports.getYaw = function(){
  return global.sharedObject.yaw.slice(global.sharedObject.indexstart,global.sharedObject.indexend+1);
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

exports.getNData = function(){
  return global.sharedObject.nData;
}

exports.getIndexStart = function(){
  return global.sharedObject.indexstart;
}

exports.getIndexEnd = function(){
  return global.sharedObject.indexend;
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

exports.setIndexStart = function(indexstart){
  global.sharedObject.indexstart = indexstart;
}

exports.setIndexEnd = function(indexend){
  global.sharedObject.indexend = indexend;
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

// Fire 'plotUpdate' event upon request
ipcMain.on('requestPlotUpdate', (event, arg) => {
  event.sender.send('plotUpdate', 'pong') // plotdemo.js, mapviewer.js
})

// Fire 'updateAnimationSlider' event upon request
ipcMain.on('requestUpdateAnimationSlider', (event, arg) => {
  event.sender.send('updateAnimationSlider', null) // animationcontrol.js
})

// Fire 'updateNavigationBar' event upon request
ipcMain.on('requestUpdateNavigationBar', (event, arg) => {
  event.sender.send('updateNavigationBar', null) // readfile.js
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
  nData: 0,
  indexstart: 0,
  indexend: 0,
  aircrafttype: null,
  path: null,
  filereadstatus: false
}
