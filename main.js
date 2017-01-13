'use strict';

// Electronのモジュール
const electron = require("electron");

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function() {
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({width: 800, height: 600, 'node-integration': false});
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open developer tools for debug
  mainWindow.webContents.openDevTools();

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});




// Open new window
exports.openWindow = () =>{
  let win = new BrowserWindow({width:400, height:200, 'node-integration': false});
  win.loadURL('file://'+__dirname+'/bear.html');
}

// Example:
// <script>
//   var main = require("remote").require("./main");
//   main.getTimestamp();
// </script>

exports.getTimestamp = () =>{
  return global.sharedObject.timestamp;
}

exports.getX= () =>{
  return global.sharedObject.x;
}

exports.transpose = function(matrix){
  return Object.keys(matrix[0])
      .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));
}

// Global variables
global.sharedObject = {
  filecontents: 'None',
  timestamp: null,
  x: null
}
