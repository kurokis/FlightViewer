'use strict';

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
  const columnsSample = {
    'timestamp': 'timestamp',
    'lat': 'lat',
    'lon': 'lon',
    'alt': 'alt',
  };
  const columnsDJI = {
    'Latitude (Deg)': 'lat',
    ' Longitude (Deg)': 'lon',
    ' GPS Altitude (m)': 'alt',
    ' N Velocity(m/s)': 'vn',
    ' E Velocity(m/s)': 've',
    ' D Velocity(m/s)': 'vd',
    ' Velocity(m/s)': 'velocity',
    ' Ground Speed(m/s)': 'gs',
    ' AccelerometerX(g)': 'ax',
    ' AccelerometerY(g)': 'ay',
    ' AccelerometerZ(g)': 'az',
    ' GyroY(rad/s)': 'wx',
    ' GyroX(rad/s)': 'wy',
    ' GyroZ(rad/s)': 'wz',
    ' Barometric Alt(m)': 'balt',
    ' QuaternionX': 'qx',
    ' QuaternionY': 'qy',
    ' QuaternionZ': 'qz',
    ' QuaternionW': 'qw',
    ' Roll(deg)': 'roll',
    ' Pitch(deg)': 'pitch',
    ' Yaw(deg)': 'yaw',
    ' MagneticX': 'mx',
    ' MagneticY': 'my',
    ' MagneticZ': 'mz',
    ' Satellites': 'sat',
    ' Sequence(135 Hz) ': 'timestamp',
    //'': 'none_' // 2行目以降は終わりに,がついているため、列数を合わせるために必要
  };
  var columns;

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
  var lat_ = [];
  var lon_ = [];
  var alt_ = [];
  var nData_ = 0;

  if(type==null){
    $('#fileName').text("Select aircraft type before selecting file.")
  }else{
    if(type=="Sample"){
      columns = columnsSample;
    }else{

      if(type=="DJI"){
        columns = columnsDJI;
      }else{
        console.log("Error")
      }
    }
  }
  const parser = csv.parse({columns : parseColumns});
  const readableStream = fs.createReadStream(path, {encoding: 'utf-8'});
  readableStream.pipe(parser);

  // 読み込み途中の時は、データを配列に追加
  parser.on('readable', () => {
    var data;
    while(data = parser.read()){
      timestamp_.push(parseFloat(data.timestamp));
      lat_.push(parseFloat(data.lat));
      lon_.push(parseFloat(data.lon));
      alt_.push(parseFloat(data.alt));
      nData_=nData_+1;
    }
  });

  // 読み込みが完了したら、グローバル変数に格納
  parser.on('end', () => {
    remote.getGlobal('sharedObject').timestamp = timestamp_;
    remote.getGlobal('sharedObject').lat = lat_;
    remote.getGlobal('sharedObject').lon = lon_;
    remote.getGlobal('sharedObject').alt = alt_;
    remote.getGlobal('sharedObject').nData = nData_;

    ipcRenderer.send('fileReadComplete',0);
    ipcRenderer.send('requestPlotUpdate',0);
  });
}

// =============================================================================
// Aircraft type select
var type = null;

$('#aircraftTypeDJI').click(function(e){
  type = "DJI";
  $('#aircraftTypeDropdownText').text("DJI");
});
$('#aircraftTypeUTSmallQuad').click(function(e){
  type = "UT Small Quad";
  $('#aircraftTypeDropdownText').text("UT Small Quad");
});
$('#aircraftTypeSample').click(function(e){
  type = "Sample";
  $('#aircraftTypeDropdownText').text("Sample");
});
