'use strict';

// 参考 http://programmer-jobs.blogspot.jp/2016/06/electron-file-open.html
const remote = require('electron').remote;
const dialog = remote.dialog;
const browserWindow = remote.BrowserWindow;

var fs = require('fs');


// Actions for file select button
var window = remote.getCurrentWindow();
var options = {
  title: 'タイトル',
  filters: [
    { name: 'ドキュメント', extensions: ['txt', 'text']},
    { name: 'All Files', extensions: ['*'] }
  ],
  properties: ['openFile', 'createDirectory']
};
var button = document.getElementById('fileSelect');
button.addEventListener('click', ()=>{
  dialog.showOpenDialog(window, options,
    // コールバック関数
    function (filenames) {
      if (filenames) {
        readFile(filenames[0]);
        console.log(filenames[0]);
      }
    });
}, false);
function readFile(path) {
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(data);
    $('#fileName').text(path);
    $('#filetext').text(data); // change text to contents of the file
  });
}
