// =============================================================================
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
  analyzeButton.innerText = "Decoding";
  ipcRenderer.send('requestUpdateNavigationBar',null);

  // disable the slider
  main.setFileReadStatus(false);
  ipcRenderer.send('requestUpdateSliderStates',null);

  // get file path
  var path = main.getPath(); // path to selected file
  var dpath = path.replace('.csv','_out.csv'); // path to decoded file

  // decode file and replace path with dpath
  switch(main.getAircraftType()){
    case "DJI":
      main.decode(path);
      ipcRenderer.send('fireNavigationBarUpdate',null); // パス表示を更新
      break;
    default:
      dpath = path;
      break;
  }


  // Change button text
  analyzeButton.innerText = "Loading";

  // CSVヘッダ行とプログラム上の名称の対応表を作成
  // 左：CSVファイル上の列名 / 右：プログラム上の名称
  var columns;
  switch(main.getAircraftType()){
    case "DJI":
      columns = {
        'Index': 'frame',
        'Time (s)': 'time',
        'Latitude (deg)': 'latitude',
        'Longitude (deg)': 'longitude',
        'GPS Altitude (m)': 'gpsaltitude',
        'Barometric Altitude (m)': 'barometricaltitude',
        'Quaternion W': 'quaternionw',
        'Quaternion X': 'quaternionx',
        'Quaternion Y': 'quaterniony',
        'Quaternion Z': 'quaternionz',
	      'Roll (deg)': 'roll',
        'Pitch (deg)': 'pitch',
        'Yaw (deg)': 'yaw',
	      'Accelerometer X (g)': 'accelerometerx',
        'Accelerometer Y (g)': 'accelerometery',
        'Accelerometer Z (g)': 'accelerometerz',
	      'Gyro X (deg/s)': 'gyrox',
        'Gyro Y (deg/s)': 'gyroy',
        'Gyro Z (deg/s)': 'gyroz',
	      'Magnetic X (G)': 'magnetometerx',
        'Magnetic Y (G)': 'magnetometery',
        'Magnetic Z (G)': 'magnetometerz'
      }
      break;
    case "DJI Raw":
      columns = {
        'Latitude (Deg)': 'latitude',
        ' Longitude (Deg)': 'longitude',
        ' GPS Altitude (m)': 'galt',
        ' N Velocity(m/s)': 'vn',
        ' E Velocity(m/s)': 've',
        ' D Velocity(m/s)': 'vd',
        ' Velocity(m/s)': 'velocity',
        ' Ground Speed(m/s)': 'gs',
        ' AccelerometerX(g)': 'accelerometerx',
        ' AccelerometerY(g)': 'accelerometery',
        ' AccelerometerZ(g)': 'accelerometerz',
        ' GyroY(rad/s)': 'gyrox',
        ' GyroX(rad/s)': 'gyroy',
        ' GyroZ(rad/s)': 'gyroz',
        ' Barometric Alt(m)': 'barometricaltitude',
        ' QuaternionX': 'quaternionx',
        ' QuaternionY': 'quaterniony',
        ' QuaternionZ': 'quaternionz',
        ' QuaternionW': 'quaternionw',
        ' Roll(deg)': 'roll',
        ' Pitch(deg)': 'pitch',
        ' Yaw(deg)': 'yaw',
        ' MagneticX': 'magnetometerx',
        ' MagneticY': 'magnetometery',
        ' MagneticZ': 'magnetometerz',
        ' Satellites': 'sat',
        ' Sequence(135 Hz) ': 'time',
        '': 'none_' // 2行目以降は終わりに,がついているため、列数を合わせるために必要
        };
      break;
    case "UT Small Quad":
      columns = {};
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
  const readableStream = fs.createReadStream(dpath, {encoding: 'utf-8'});
  readableStream.pipe(parser);

  // ローカル変数
  var time_ = [], latitude_ = [], longitude_ = [], gpsaltitude_ = [], barometricaltitude_ = [];
  var quaternionw_ = [], quaternionx_ = [], quaterniony_ = [], quaternionz_ = [];
  var roll_ = [], pitch_ = [], yaw_ = [];
  var accelerometerx_ = [], accelerometery_ = [], accelerometerz_ = [];
  var gyrox_ = [], gyroy_ = [], gyroz_ = [];
  var magnetometerx_ = [], magnetometery_ = [], magnetometerz_ = [];
  var nframes_ = 0;

  // 読み込み途中の処理
  parser.on('readable', () => {
    // データをローカルの配列に追加
    var data;
    while(data = parser.read()){
      if(isNaN(data.time)){
        // まれにNaNになる場合があるため、その場合は飛ばす
        // データが失われるわけではない
      }else{
        time_.push(parseFloat(data.time));
        latitude_.push(parseFloat(data.latitude));
        longitude_.push(parseFloat(data.longitude));
        gpsaltitude_.push(parseFloat(data.gpsaltitude));
        barometricaltitude_.push(parseFloat(data.barometricaltitude));
        quaternionw_.push(parseFloat(data.quaternionw));
        quaternionx_.push(parseFloat(data.quaternionx));
        quaterniony_.push(parseFloat(data.quaterniony));
        quaternionz_.push(parseFloat(data.quaternionz));
        roll_.push(parseFloat(data.roll));
        pitch_.push(parseFloat(data.pitch));
        yaw_.push(parseFloat(data.yaw));
        accelerometerx_.push(parseFloat(data.accelerometerx));
        accelerometery_.push(parseFloat(data.accelerometery));
        accelerometerz_.push(parseFloat(data.accelerometerz));
        gyrox_.push(parseFloat(data.gyrox));
        gyroy_.push(parseFloat(data.gyroy));
        gyroz_.push(parseFloat(data.gyroz));
        magnetometerx_.push(parseFloat(data.magnetometerx));
        magnetometery_.push(parseFloat(data.magnetometery));
        magnetometerz_.push(parseFloat(data.magnetometerz));
        nframes_=nframes_+1;
      }
    }
  });

  // 読み込みが完了時の処理
  parser.on('end', () => {
    // データをグローバル変数に格納
    remote.getGlobal('sharedObject').time = time_;
    remote.getGlobal('sharedObject').latitude = latitude_;
    remote.getGlobal('sharedObject').longitude = longitude_;
    remote.getGlobal('sharedObject').gpsaltitude = gpsaltitude_;
    remote.getGlobal('sharedObject').barometricaltitude = barometricaltitude_;
    remote.getGlobal('sharedObject').quaternionw = quaternionw_;
    remote.getGlobal('sharedObject').quaternionx = quaternionx_;
    remote.getGlobal('sharedObject').quaterniony = quaterniony_;
    remote.getGlobal('sharedObject').quaternionz = quaternionz_;
    remote.getGlobal('sharedObject').roll = roll_;
    remote.getGlobal('sharedObject').pitch = pitch_;
    remote.getGlobal('sharedObject').yaw = yaw_;
    remote.getGlobal('sharedObject').accelerometerx = accelerometerx_;
    remote.getGlobal('sharedObject').accelerometery = accelerometery_;
    remote.getGlobal('sharedObject').accelerometerz = accelerometerz_;
    remote.getGlobal('sharedObject').gyrox = gyrox_;
    remote.getGlobal('sharedObject').gyroy = gyroy_;
    remote.getGlobal('sharedObject').gyroz = gyroz_;
    remote.getGlobal('sharedObject').magnetometerx = magnetometerx_;
    remote.getGlobal('sharedObject').magnetometery = magnetometery_;
    remote.getGlobal('sharedObject').magnetometerz = magnetometerz_;

    remote.getGlobal('sharedObject').nframes = nframes_;
    remote.getGlobal('sharedObject').frameend = nframes_-1;


    // Change button text
    analyzeButton.innerText = "Analyze";

    // enable the slider
    main.setFileReadStatus(true);
    ipcRenderer.send('fireSliderStatesUpdate',null);

    // update plots
    ipcRenderer.send('fireFrameRangeUpdate',null);
    ipcRenderer.send('fireFrameUpdate',null);
  });

}, false);

// =============================================================================
// Action on dropdown click
$('#aircraftTypeDJI').click(function(e){
  main.setAircraftType("DJI");
  updateNavigationBar();
});
$('#aircraftTypeDJIRaw').click(function(e){
  main.setAircraftType("DJI Raw");
  updateNavigationBar();
});
$('#aircraftTypeUTSmallQuad').click(function(e){
  main.setAircraftType("UT Small Quad");
  updateNavigationBar();
});

// =============================================================================
// ipc handler
ipcRenderer.on('navigationBarUpdate', (event, arg) => {
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
    var filename=path.slice(path.lastIndexOf("\\")+1);
    $('#fileName').text(filename);
  }
}
