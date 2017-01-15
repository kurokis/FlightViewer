'use strict';

var globaltext;

// 参考 http://programmer-jobs.blogspot.jp/2016/06/electron-file-open.html
var {ipcRenderer, remote} = require('electron');
const dialog = remote.dialog;
const browserWindow = remote.BrowserWindow;

var fs = require('fs');
var csv = require('csv'); // Node-csv (npm install csv)

// Actions for file select button
var window = remote.getCurrentWindow();
var options = {
  title: 'ファイル選択',
  filters: [
    { name: 'CSV file', extensions: ['csv']},
    { name: 'ドキュメント', extensions: ['txt', 'text']},
    { name: 'All Files', extensions: ['*'] },
  ],
  properties: ['openFile', 'createDirectory']
};
var button = document.getElementById('fileSelect');
button.addEventListener('click', ()=>{
  dialog.showOpenDialog(window, options,
    // コールバック関数
    function (filenames) {
      if (filenames) {
        var path = filenames[0];
        $('#fileName').text(path);
        readCSV(path);
      }
    });
}, false);

//function readText(path) {
//  fs.readFile(path, 'utf8', function (err, data) {
//    if (err) {
//      return console.log(err);
//    }
//    console.log(data);
//    remote.getGlobal('sharedObject').filecontents = data;
//    $('#fileName').text(path);
//    $('#filetext').text(data); // change text to contents of the file
//  });
//}

function readCSV(path) {
  // 左：CSVファイル上の列名 / 右：プログラム上の名称
  const columns = {
    'timestamp': 'timestamp',
    'x position': 'x'
  };

  // CSVヘッダ行の解析関数
  function parseColumns(line) {
    const columns_renamed = [];
    for (var key in line) {
      columns_renamed.push(columns[line[key]]);
    }
    return columns_renamed;
  }

  // ローカル変数
  var timestamp_ = [];
  var x_ = [];
  var nData_ = 0;

  const parser = csv.parse({columns : parseColumns});
  const readableStream = fs.createReadStream(path, {encoding: 'utf-8'});
  readableStream.pipe(parser);

  // 読み込み途中の時は、データを配列に追加
  parser.on('readable', () => {
    var data;
    while(data = parser.read()){
      timestamp_.push(parseFloat(data.timestamp));
      x_.push(parseFloat(data.x));
      nData_=nData_+1;
    }
  });

  // 読み込みが完了したら、グローバル変数に格納
  parser.on('end', () => {
    remote.getGlobal('sharedObject').timestamp = timestamp_;
    remote.getGlobal('sharedObject').x = x_;
    remote.getGlobal('sharedObject').nData = nData_;

    ipcRenderer.send('fileReadComplete',0);
    ipcRenderer.send('requestPlotUpdate',0);
  });
}
