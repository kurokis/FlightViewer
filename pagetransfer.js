// ページ遷移を定義するスクリプト
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var Slider = require('bootstrap-slider') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");

// Update navigation bar (readfile.js)
ipcRenderer.send('requestUpdateNavigationBar')

// Update animation slider (animationcontrol.js)
ipcRenderer.send('requestUpdateAnimationSlider');

// Update plots (plotdemo.js, mapviewer.js)
if(main.getFileReadStatus()==true){
  ipcRenderer.send('requestPlotUpdate',null);
}
