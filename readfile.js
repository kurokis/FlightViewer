// ファイル読み込みを定義するスクリプト
// 参考 http://programmer-jobs.blogspot.jp/2016/06/electron-file-open.html
'use strict';
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");
const dialog = remote.dialog;
const browserWindow = remote.BrowserWindow;

var fs = require('fs');
var csv = require('csv'); // Node-csv (npm install csv)

// =============================================================================
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
var fileSelectButton = document.getElementById('fileSelect');
fileSelectButton.addEventListener('click', ()=>{
  dialog.showOpenDialog(window, options,
    // コールバック関数
    function (filenames) {
      if (filenames) {
        var path = filenames[0];
        main.setPath(path);
        updateNavigationBar();
      }
    });
}, false);

// =============================================================================
// Actions for analyze button
var analyzeButton = document.getElementById('analyze');
analyzeButton.addEventListener('click', function(){

  // Change button text
  analyzeButton.innerText = "Loading";

  // disable the slider
  main.setFileReadStatus(false);
  ipcRenderer.send('requestUpdateAnimationSlider',null);

  // get file path
  var path = main.getPath();

  // CSVヘッダ行とプログラム上の名称の対応表を作成
  // 左：CSVファイル上の列名 / 右：プログラム上の名称
  var columns;
  switch(main.getAircraftType()){
    case "DJI":
      columns = {
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
      //columnsDJI;
      break;
    case "UT Small Quad":
      columns = {};
      break;
    case "Sample":
      columns = {
        'timestamp': 'timestamp',
        'lat': 'lat',
        'lon': 'lon',
        'alt': 'alt',
      };
      break;
    default:
    break;
  }

  // CSVヘッダ行の解析関数
  function parseColumns(line) {
    const columns_renamed = [];
    for (var key in line) {
      columns_renamed.push(columns[line[key]]);
    }
    return columns_renamed;
  }

  // パーサを作成
  const parser = csv.parse({columns : parseColumns});
  const readableStream = fs.createReadStream(path, {encoding: 'utf-8'});
  readableStream.pipe(parser);

  // ローカル変数
  var timestamp_ = [];
  var lat_ = [];
  var lon_ = [];
  var alt_ = [];
  var nData_ = 0;

  // 読み込み途中の処理
  parser.on('readable', () => {
    // データをローカルの配列に追加
    var data;
    while(data = parser.read()){
      timestamp_.push(parseFloat(data.timestamp));
      lat_.push(parseFloat(data.lat));
      lon_.push(parseFloat(data.lon));
      alt_.push(parseFloat(data.alt));
      nData_=nData_+1;
    }
  });

  // 読み込みが完了時の処理
  parser.on('end', () => {
    // データをグローバル変数に格納
    remote.getGlobal('sharedObject').timestamp = timestamp_;
    remote.getGlobal('sharedObject').lat = lat_;
    remote.getGlobal('sharedObject').lon = lon_;
    remote.getGlobal('sharedObject').alt = alt_;
    remote.getGlobal('sharedObject').nData = nData_;

    // Change button text
    analyzeButton.innerText = "Analyze";

    // enable the slider
    main.setFileReadStatus(true);
    ipcRenderer.send('requestUpdateAnimationSlider',null);

    // update plots
    ipcRenderer.send('requestPlotUpdate',null);
  });

}, false);

// =============================================================================
// Action on dropdown click
$('#aircraftTypeDJI').click(function(e){
  main.setAircraftType("DJI");
  updateNavigationBar();
});
$('#aircraftTypeUTSmallQuad').click(function(e){
  main.setAircraftType("UT Small Quad");
  updateNavigationBar();
});
$('#aircraftTypeSample').click(function(e){
  main.setAircraftType("Sample");
  updateNavigationBar();
});

// =============================================================================
// ipc handler
ipcRenderer.on('updateNavigationBar', (event, arg) => {
  updateNavigationBar();
})

// =============================================================================
// Navigation bar update
function updateNavigationBar(){
  // Dropdown menu
  var type = main.getAircraftType();
  if(type == null){
    // default type: DJI
    // this will be called on start
    type = "DJI";
    main.setAircraftType(type);
    $('#aircraftTypeDropdownText').text(type);
  }else{
    $('#aircraftTypeDropdownText').text(type);
  }

  // Filename text
  var path = main.getPath();
  if(path == null){
    $('#fileName').text("(No file selected)")
  }else{
    $('#fileName').text(path);
  }
}
