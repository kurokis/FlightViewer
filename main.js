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
  return global.sharedObject.time.slice(0,global.sharedObject.current+1);
}

exports.getLat = function(){
  return global.sharedObject.lat.slice(0,global.sharedObject.current+1);
}

exports.getLatLngs = function(){
  var lat_ = global.sharedObject.lat.slice(0,global.sharedObject.current+1)
  var lon_ = global.sharedObject.lon.slice(0,global.sharedObject.current+1)
  var latlon_ = exports.transpose([lat_,lon_]);
  return latlon_;
}

exports.getNData = function(){
  return global.sharedObject.nData;
}

exports.getCurrent = function(){
  return global.sharedObject.current;
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

exports.setCurrent = function(current){
  global.sharedObject.current = current;
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
  //const execFile = require('child_process').execFile;
  const execFile = require('child_process').execFileSync;
  const child = execFile('./py/dist/decodeDJI',[filepath]);
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
  lat: null,
  lon: null,
  alt: null,
  nData: 0,
  current: 0,
  aircrafttype: null,
  path: null,
  filereadstatus: false
}
