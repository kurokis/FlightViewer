'use strict';

const electron = require("electron"); // Electronのモジュール
const app = electron.app; // アプリケーションをコントロールするモジュール
const BrowserWindow = electron.BrowserWindow; // ウィンドウを作成するモジュール
var {ipcMain} = require('electron');   // Inter-process communications http://electron.rocks/different-ways-to-communicate-between-main-and-renderer-process/

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

exports.getTimestamp = () =>{
  return global.sharedObject.timestamp.slice(0,global.sharedObject.current+1);
}

exports.getX = () =>{
  return global.sharedObject.x.slice(0,global.sharedObject.current+1);
}

exports.getNData = ()=>{
  return global.sharedObject.nData;
}

exports.setCurrent = function(current){
  global.sharedObject.current = current;
}

exports.transpose = function(matrix){
  return Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));
}

//======================== Inter-process communication =========================
// http://electron.atom.io/docs/api/ipc-main/

// Fire 'plotUpdate' event upon request
ipcMain.on('requestPlotUpdate', (event, arg) => {
  event.sender.send('plotUpdate', 'pong') // plotdemo.js
})

// Enable slider when file read is complete
ipcMain.on('fileReadComplete', (event, arg) => {
  event.sender.send('enableAnimationSlider', 'pong') // animationcontrol.js
})

//============================= Global variables ===============================

// Global variables
global.sharedObject = {
  filecontents: 'None',
  timestamp: null,
  x: null,
  nData: 0,
  current: 0
}
