// =============================================================================
// ページ遷移を定義するスクリプト
'use strict';
var $ = jQuery = require("../lib/jquery-3.1.1.min.js"); // jQuery
var Slider = require('bootstrap-slider') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

$(document).ready(function(){
  // Update navigation bar (readfile.js)
  ipcRenderer.send('fireNavigationBarUpdate')

  // Update sliders (animationcontrol.js)
  ipcRenderer.send('fireSliderStatesUpdate');

  // Update plots (mapviewer.js, altitudeplot.js, ...)
  if(main.getFileReadStatus()==true){
    ipcRenderer.send('fireFrameRangeUpdate',null);
    ipcRenderer.send('fireFrameUpdate',null);
  }
});
