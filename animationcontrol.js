// スライダーの挙動を定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var Slider = require('bootstrap-slider') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

var slider = new Slider("#animationSlider",{
  // view options at https://github.com/seiyria/bootstrap-slider
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  tooltip: 'show',
  tooltip_position: 'bottom',
  range: true,
  enabled: false
});

// =============================================================================
// Request plot update on slide
slider.on('slideStop', function(e) {
  //main.setIndexStart(Math.max(0,slider.getValue()-1350));
  var range = slider.getValue();
  console.log(range);
  main.setIndexStart(range[0]);
  main.setIndexEnd(range[1]);
  ipcRenderer.send('requestPlotUpdate',-1);
});

// =============================================================================
// ipc handler
ipcRenderer.on('updateAnimationSlider', (event, arg) => {
  updateAnimationSlider();
})

// =============================================================================
// Animation slider update
function updateAnimationSlider(){
  // Set slider state and value
  if(main.getFileReadStatus()==true){
    slider.setAttribute('max', main.getNData());
    slider.enable();
    slider.setValue([main.getIndexStart(),main.getIndexEnd()]);
  }else{
    slider.disable();
  }

}
