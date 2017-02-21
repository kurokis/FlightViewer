// =============================================================================
// スライダーの挙動を定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var Slider = require('bootstrap-slider') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

var frameChangeFlag = "none"; // "none","frameSlider","frameForm.time","frameForm.frame","frameRangeSlider"
var frameRangeChangeFlag = "none"; // "none","frameRangeSlider","frameRangeForm.time","frameRangeForm.frame"

var frameRangeForm = document.getElementById('frameRangeForm');
var frameForm = document.getElementById('frameForm');

var frameRangeSlider = new Slider("#frameRangeSlider",{
  // view options at https://github.com/seiyria/bootstrap-slider
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  range: true,
  enabled: false
});

var frameSlider = new Slider("#frameSlider",{
  // view options at https://github.com/seiyria/bootstrap-slider
  min: 0,
  max: 0,
  step: 1,
  value: 0,
  tooltip: 'show',
  tooltip_position: 'bottom',
  enabled: false
});

// =============================================================================
// フレームスライダーが動いたときの処理
frameSlider.on('slide', function(e){
  frameChangeFlag = "frameSlider";
  updateFrameSlider();
});

// テキストボックスが変更されたときの処理
frameForm.frame.addEventListener('blur', function(e){
  frameChangeFlag = "frameForm.frame";
  updateFrameSlider();
});
frameForm.time.addEventListener('blur', function(e){
  frameChangeFlag = "frameForm.time";
  updateFrameSlider();
});
frameForm.frame.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameChangeFlag = "frameForm.frame";
    updateFrameSlider();
  }
});
frameForm.time.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameChangeFlag = "frameForm.time";
    updateFrameSlider();
  }
});

// =============================================================================
// フレーム範囲スライダーが動いたときの処理
frameRangeSlider.on('slide', function(e){
  // スライダーが動いている感覚を与えるための例外的な処理
  // テキストボックスの表示だけ変更し、フレーム範囲変更のイベントは発火しない
  var range = frameRangeSlider.getValue();
  frameRangeForm.frameStart.value = range[0];
  frameRangeForm.frameEnd.value = range[1];
  frameRangeForm.timeStart.value = main.getTimeFromFrame(range[0]);
  frameRangeForm.timeEnd.value = main.getTimeFromFrame(range[1]);
});

// フレーム範囲スライダーが動き終わったときの処理
frameRangeSlider.on('slideStop', function(e) {
  frameRangeChangeFlag = "frameRangeSlider";
  updateFrameRangeSlider();
});

// テキストボックスが変更されたときの処理
frameRangeForm.frameStart.addEventListener('blur', function(e){
  frameRangeChangeFlag = "frameRangeForm.frame";
  updateFrameRangeSlider();
});
frameRangeForm.frameEnd.addEventListener('blur', function(e){
  frameRangeChangeFlag = "frameRangeForm.frame";
  updateFrameRangeSlider();
});
frameRangeForm.timeStart.addEventListener('blur', function(e){
  frameRangeChangeFlag = "frameRangeForm.time";
  updateFrameRangeSlider();
});
frameRangeForm.timeEnd.addEventListener('blur', function(e){
  frameRangeChangeFlag = "frameRangeForm.time";
  updateFrameRangeSlider();
});
frameRangeForm.frameStart.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameRangeChangeFlag = "frameRangeForm.frame";
    updateFrameRangeSlider();
  }
});
frameRangeForm.frameEnd.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameRangeChangeFlag = "frameRangeForm.frame";
    updateFrameRangeSlider();
  }
});
frameRangeForm.timeStart.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameRangeChangeFlag = "frameRangeForm.time";
    updateFrameRangeSlider();
  }
});
frameRangeForm.timeEnd.addEventListener('keydown', function(e){
  if(e.keyCode==13){ // Enter
    frameRangeChangeFlag = "frameRangeForm.time";
    updateFrameRangeSlider();
  }
});

// =============================================================================
// ipc handler
ipcRenderer.on('sliderStatesUpdate', (event, arg) => {
  updateSliderStates();
})

// =============================================================================
// スライダーの有効/無効を更新
function updateSliderStates(){
  if(main.getFileReadStatus()==true){
    frameRangeSlider.setAttribute('max', main.getNFrames()-1);
    frameRangeSlider.enable();
    frameRangeSlider.setValue([main.getFrameStart(),main.getFrameEnd()]);

    frameRangeForm.frameStart.value = main.getFrameStart();
    frameRangeForm.frameEnd.value = main.getFrameEnd();
    frameRangeForm.timeStart.value = main.getTimeFromFrame(main.getFrameStart());
    frameRangeForm.timeEnd.value = main.getTimeFromFrame(main.getFrameEnd());

    frameSlider.setAttribute('min', main.getFrameStart());
    frameSlider.setAttribute('max', main.getFrameEnd());
    frameSlider.enable();
    frameSlider.setValue(main.getFrameCurrent());

    frameForm.frame.value = main.getFrameCurrent();
    frameForm.time.value = main.getTimeFromFrame(main.getFrameCurrent());
  }else{
    frameRangeSlider.disable();
    frameSlider.disable();
  }
}

// 文字列が数字かどうかの判定
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateFrameSlider(){
  // スライダー、テキストボックス間の整合性を整える
  if(frameChangeFlag == "frameSlider"){
    // 連動：スライダー ==> テキストボックス(frame)、テキストボックス(time)
    var frame = frameSlider.getValue();
    frameForm.frame.value = frame;
    frameForm.time.value = main.getTimeFromFrame(frame);
  }else if(frameChangeFlag == "frameForm.frame"){
    // 数字かどうかをチェックし、数字でなかったら以前の値に戻す
    if(!isNumeric(frameForm.frame.value)){
      frameForm.frame.value = main.getFrameCurrent();
    }

    // 数字の整合性をチェックし、適切な値に直す
    var frame = parseFloat(frameForm.frame.value);
    if(frame<main.getFrameStart()){frame = main.getFrameStart();}
    if(frame>main.getFrameEnd()){frame = main.getFrameEnd();}
    frameForm.frame.value = frame;

    // 連動：テキストボックス(frame) ==> スライダー、テキストボックス(time)
    frameSlider.setValue(frame);
    frameForm.time.value = main.getTimeFromFrame(frame);
  }else if(frameChangeFlag == "frameForm.time"){
    // 数字かどうかをチェックし、数字でなかったら以前の値に戻す
    if(!isNumeric(frameForm.time.value)){
      frameForm.time.value = main.getTimeFromFrame(main.getFrameCurrent());
    }

    // 数字の整合性をチェックし、適切な値に直す
    // timecurrentよりも時刻が大きくなる最初のフレームを現在のフレームとする
    var time = parseFloat(frameForm.time.value);
    var frame = 0, nframes = main.getNFrames();
    while(frame < nframes-1){
      if(main.getTimeFromFrame(frame)>=time){
        break;
      }
      frame = frame + 1;
    }
    if(frame<main.getFrameStart()){frame = main.getFrameStart();}
    if(frame>main.getFrameEnd()){frame = main.getFrameEnd();}

    // 連動：テキストボックス(time) ==> スライダー、テキストボックス(time)、テキストボックス(time)
    frameSlider.setValue(frame);
    frameForm.time.value = main.getTimeFromFrame(frame);
    frameForm.frame.value = frame;
  }else if(frameChangeFlag == "frameRangeSlider"){
    // フレーム範囲に収まるようフレームを変更
    // frameSlider、frameForm.frame、frameForm.timeを更新
    var frame = frameSlider.getValue();
    var range = frameRangeSlider.getValue();
    if(frame<range[0]){frame = range[0];}
    if(frame>range[1]){frame = range[1];}
    frameSlider.setAttribute('min', range[0]);
    frameSlider.setAttribute('max', range[1]);
    frameSlider.setValue(frame);

    frameForm.frame.value = frame;
    frameForm.time.value = main.getTimeFromFrame(frame);
  }else{
    console.log("pass");
  }
  frameChangeFlag = "none";

  // メインプロセスに新しい値を送る
  var frame = frameSlider.getValue();
  main.setFrameCurrent(frame);

  // フレーム変更のイベントを発火
  ipcRenderer.send('fireFrameUpdate',-1);
}

function updateFrameRangeSlider(){
  // スライダー、テキストボックス間の整合性を整える
  if(frameRangeChangeFlag == "frameRangeSlider"){
    // 連動：スライダー ==> テキストボックス
    var range = frameRangeSlider.getValue();
    frameRangeForm.frameStart.value = range[0];
    frameRangeForm.frameEnd.value = range[1];
    frameRangeForm.timeStart.value = main.getTimeFromFrame(range[0]);
    frameRangeForm.timeEnd.value = main.getTimeFromFrame(range[1]);
  }else if(frameRangeChangeFlag == "frameRangeForm.frame"){
    // 数字かどうかをチェックし、数字でなかったら以前の値に戻す
    if(!isNumeric(frameRangeForm.frameStart.value)){
      frameRangeForm.frameStart.value = main.getFrameStart();
    }
    if(!isNumeric(frameRangeForm.frameEnd.value)){
      frameRangeForm.frameEnd.value = main.getFrameEnd();
    }

    // 数字の整合性をチェックし、適切な値に直す
    var fstart = parseFloat(frameRangeForm.frameStart.value);
    var fend = parseFloat(frameRangeForm.frameEnd.value);
    if(fstart<0){fstart = 0;}
    if(fend>main.getNFrames()-1){fend = main.getNFrames()-1;}
    if(fstart>fend){fstart=fend;}
    frameRangeForm.frameStart.value = fstart;
    frameRangeForm.frameEnd.value = fend;

    // 連動：テキストボックス ==> スライダー
    frameRangeForm.timeStart.value = main.getTimeFromFrame(fstart);
    frameRangeForm.timeEnd.value = main.getTimeFromFrame(fend);
    frameRangeSlider.setValue([parseFloat(frameRangeForm.frameStart.value), parseFloat(frameRangeForm.frameEnd.value)]);
  }else if(frameRangeChangeFlag == "frameRangeForm.time"){
    // 数字かどうかをチェックし、数字でなかったら以前の値に戻す
    if(!isNumeric(frameRangeForm.timeStart.value)){
      frameRangeForm.timeStart.value = main.getTimeFromFrame(main.getFrameStart());
    }
    if(!isNumeric(frameRangeForm.timeEnd.value)){
      frameRangeForm.timeEnd.value = main.getTimeFromFrame(main.getFrameEnd());
    }

    // 数字の整合性をチェックし、適切な値に直す
    // timecurrentよりも時刻が大きくなる最初のフレームを現在のフレームとする
    var tstart = parseFloat(frameRangeForm.timeStart.value);
    var tend = parseFloat(frameRangeForm.timeEnd.value);
    var fstart = 0, fend = 0, nframes = main.getNFrames();
    while(fstart < nframes-1){
      if(main.getTimeFromFrame(fstart)>=tstart){
        break;
      }
      fstart = fstart + 1;
    }
    while(fend < nframes-1){
      if(main.getTimeFromFrame(fend)>=tend){
        break;
      }
      fend = fend + 1;
    }
    if(fstart<0){fstart = 0;}
    if(fend>main.getNFrames()-1){fend = main.getNFrames()-1;}
    if(fstart>fend){fstart=fend;}
    frameRangeForm.timeStart.value = main.getTimeFromFrame(fstart);
    frameRangeForm.timeEnd.value = main.getTimeFromFrame(fend);

    // 連動：テキストボックス ==> スライダー
    frameRangeForm.frameStart.value = fstart;
    frameRangeForm.frameEnd.value = fend;
    frameRangeSlider.setValue([parseFloat(frameRangeForm.frameStart.value), parseFloat(frameRangeForm.frameEnd.value)]);
  }else{
    // pass
  }
  frameRangeChangeFlag = "none";

  // メインプロセスに新しい値を送る
  var range = frameRangeSlider.getValue();
  main.setFrameStart(range[0]);
  main.setFrameEnd(range[1]);

  // フレーム範囲変更のイベントを発火
  ipcRenderer.send('fireFrameRangeUpdate',-1);

  // 最後にフレーム変化の処理を実行
  frameChangeFlag = "frameRangeSlider";
  updateFrameSlider();
}
