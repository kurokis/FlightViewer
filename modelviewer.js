// =============================================================================
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
var Slider = require('bootstrap-slider') // bootstrap-slider (npm install bootstrap-slider)
var {ipcRenderer, remote} = require('electron');
const main = remote.require("./main");
var OrbitControls = require('three-orbit-controls')(THREE)

var APP={ };

//レンダラー
APP.canvas = document.getElementById('modelviewer'); // div要素の取得
APP.renderer = new THREE.WebGLRenderer({ alpha: true ,antialias:true});
APP.renderer.setClearColor( new THREE.Color(0xffffff),0.0);//背景色
APP.renderer.setSize( APP.canvas.clientWidth, APP.canvas.clientHeight);
APP.canvas.appendChild(APP.renderer.domElement); // div領域にレンダラーを配置
APP.renderer.autoClear = false; // 複数のシーンを重ねて表示する場合は、falseにする必要がある

//カメラ
APP.camera = new THREE.PerspectiveCamera( 35, APP.canvas.clientWidth/APP.canvas.clientHeight, 0.1, 1000 );
APP.camera.position.set(-2,1,-1.7);
APP.camera.up.set(0,0,-1);
APP.camera.rotation.order = "ZYX";
//APP.camera.up.z = -1;

//シーン
APP.scene = new THREE.Scene();

//ライティング
APP.directionalLight = new THREE.DirectionalLight( 0xffffff, 3 ); //平行光源（色、強度）
APP.directionalLight.position.set(0,0,3);
APP.scene.add( APP.directionalLight );

//ドローンのオブジェクト
APP.drone = new THREE.Mesh();
var loader = new THREE.JSONLoader();
loader.load( './models/drone.json', function (geometry, materials){
  //第１引数(geometry)はジオメトリー、第２引数(materials)はマテリアルが自動的に取得される

  var faceMaterial  = new THREE.MeshNormalMaterial();//法線マップにする（簡単に立体的に見せるため）
  APP.drone = new THREE.Mesh( geometry, faceMaterial );
  APP.drone.scale.set( 0.1, 0.1, 0.1 );
  APP.drone.rotation.order = "ZYX";

  // file specific rotation for adjustment
  APP.drone.rotation.z += Math.PI/4;
  APP.drone.rotation.x -= Math.PI/2;

  APP.scene.add( APP.drone );
});

//平面
var planeGeometry = new THREE.PlaneGeometry( 10, 10, 100, 100 );//大きさ10*10,分割数10*100
var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x533E25, wireframe:true} );
APP.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
APP.scene.add( APP.planeMesh );

// Controlを用意
APP.controls = new OrbitControls( APP.camera, APP.canvas );

// AxisHelper on corner
var width = 10;
var height = 10;
APP.camera2 = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
APP.camera2.position.z = 10;
APP.camera2.up = APP.camera.up; // important!
APP.scene2 = new THREE.Scene();
APP.axisHelper = new THREE.AxisHelper( 5 );
APP.scene2.add( APP.axisHelper );
APP.directionalLight2 = new THREE.DirectionalLight( 0xffffff, 3 ); //平行光源（色、強度）
APP.directionalLight2.position.set(0,0,3);
APP.scene2.add( APP.directionalLight2 );

// Slider for control
APP.slider = new Slider("#modelViewerSlider",{
  // view options at https://github.com/seiyria/bootstrap-slider
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  tooltip: 'show',
  tooltip_position: 'bottom',
  enabled: true
});

animate();

// =============================================================================
// Change renderer dimension on resize
$(window).resize(function() {
  if(APP.canvas){ // APP.canvasが存在すれば（ページ読み込み時のエラー回避）
    APP.camera.aspect = APP.canvas.clientWidth/APP.canvas.clientHeight;
    APP.camera.updateProjectionMatrix();

    APP.renderer.setSize( APP.canvas.clientWidth, APP.canvas.clientHeight);
  }
});

// =============================================================================
// Update on slide
APP.slider.on('slide', function(e) {
  setAttitude();

});

// =============================================================================
// ipc handler
ipcRenderer.on('plotUpdate', (event, arg) => {
  setAttitude();
})

// =============================================================================
// Animating function
function animate() {
   requestAnimationFrame( animate ); //自身を呼ぶことで繰り返し更新される

   APP.controls.update();

   // Render main viewport
   var width = APP.canvas.clientWidth;
   var height = APP.canvas.clientHeight;
   APP.renderer.clear(); // autoclearをfalseにしたので、自分でクリアする
   APP.renderer.setViewport( 0, 0, width, height );
   APP.renderer.render( APP.scene, APP.camera );

   // Render axis helper
   var insetWidth = 100;
   var insetHeight = 100;
   APP.camera2.position.copy( APP.camera.position );
	 APP.camera2.position.sub( APP.controls.target ); // added by @libe
	 APP.camera2.position.setLength( 10 );
   APP.camera2.lookAt( APP.scene2.position );
   APP.renderer.clearDepth(); // important! clear the depth buffer
   APP.renderer.setViewport( 0, 0, insetWidth, insetHeight );
   APP.renderer.render( APP.scene2, APP.camera2 );
}

// =============================================================================
// Update attitude
function setAttitude(){
  if(main.getFileReadStatus()){
    var percentage = APP.slider.getValue();
    var range = main.getIndexEnd()-main.getIndexStart();
    var index = main.getIndexStart()+Math.floor(0.01*percentage*range);

    // ドローンとカメラの相対位置を取得
    var rel = {
      'x': APP.camera.position.x - APP.drone.position.x,
      'y': APP.camera.position.y - APP.drone.position.y,
      'z': APP.camera.position.z - APP.drone.position.z,
    }

    // ドローンの位置と姿勢を更新
    var euler = main.getEuler(index);
    APP.drone.rotation.set(euler.roll,euler.pitch,euler.yaw);
    APP.drone.rotation.z += Math.PI/4; // file specific rotation for adjustment
    APP.drone.rotation.x -= Math.PI/2; // file specific rotation for adjustment
    var position = main.getPosition(index);
    APP.drone.position.set(position.x,position.y,position.z);

    // カメラもドローンに追従させる
    APP.camera.position.set(position.x+rel.x,position.y+rel.y,position.z+rel.z);

    // OrbitControlsの中心をドローンに合わせる
    APP.controls.target.set(APP.drone.position.x,APP.drone.position.y,APP.drone.position.z);

  }
}
