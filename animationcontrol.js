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
  enabled: false
});

// Request plot update on slide
slider.on('slide', function(e) {
    main.setCurrent(slider.getValue());
    ipcRenderer.send('requestPlotUpdate',-1);
});

// Enable slider when file read is complete
ipcRenderer.on('enableAnimationSlider', (event, arg) => {
  slider.setAttribute('max', main.getNData());
  slider.enable();
})

//var button = document.getElementById('analyze');
//button.addEventListener('click', ()=>{
//  slider.setAttribute('max', main.getNData());
//  slider.enable();
//}, false);
