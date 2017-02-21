// =============================================================================
'use strict';
var $ = jQuery = require("./lib/jquery-3.1.1.min.js"); // jQuery
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

//カメラ
APP.camera = new THREE.PerspectiveCamera( 35, APP.canvas.clientWidth/APP.canvas.clientHeight, 0.1, 1000 );
APP.camera.position.set(-1,0.5,-1);
APP.camera.up.set(0,0,-1);
//APP.camera.rotation.order = "ZYX";

//シーン
APP.scene = new THREE.Scene();

//ライティング
APP.directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); //平行光源（色、強度）
APP.directionalLight.position.set(0,0,-10);
APP.ambientLight = new THREE.AmbientLight( 0xffffff);
APP.scene.add( APP.directionalLight );
APP.scene.add( APP.ambientLight );

//ドローンのオブジェクト
APP.drone = new THREE.Mesh();
APP.drone.rotation.order = "ZYX";
var loader = new THREE.JSONLoader();
loader.load( './models/quad.json', function (geometry, materials){
  //第１引数(geometry)はジオメトリー、第２引数(materials)はマテリアルが自動的に取得される

  //座標系の違いをメッシュ回転で吸収する
  geometry.rotateX(-Math.PI/2);
  geometry.rotateZ(Math.PI/4);

  //var faceMaterial  = new THREE.MeshNormalMaterial();//法線マップにする（簡単に立体的に見せるため）
  var faceMaterial = new THREE.MultiMaterial(materials);　　　
  APP.drone = new THREE.Mesh( geometry, faceMaterial );
  APP.drone.scale.set( 0.1, 0.1, 0.1 );
  APP.scene.add( APP.drone );
});

//平面
var planeGeometry = new THREE.PlaneGeometry( 1, 1, 10, 10 );//大きさ10*10,分割数10*100
var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x533E25, wireframe:true} );
APP.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
APP.scene.add( APP.planeMesh );

// Controlを用意
APP.controls = new OrbitControls( APP.camera, APP.canvas );

// AxisHelperを追加
APP.axisHelper = new THREE.AxisHelper( 0.5 );
APP.axisHelper.rotation.order = "ZYX";
APP.scene.add( APP.axisHelper );

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
// ipc handler
ipcRenderer.on('frameUpdate', (event, arg) => {
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
   APP.renderer.setViewport( 0, 0, width, height );
   APP.renderer.render( APP.scene, APP.camera );
}

// =============================================================================
// Update attitude
function setAttitude(){
  if(main.getFileReadStatus()){
    var frame = main.getFrameCurrent();

    // ドローンとカメラの相対位置を取得
    var rel = {
      'x': APP.camera.position.x - APP.drone.position.x,
      'y': APP.camera.position.y - APP.drone.position.y,
      'z': APP.camera.position.z - APP.drone.position.z,
    }

    // ドローンとAxisHelperの位置と姿勢を更新
    var e = main.getEuler(frame);
    var euler = new THREE.Euler( e.roll,e.pitch,e.yaw, 'ZYX' );
    var position = main.getPosition(frame);
    APP.drone.setRotationFromEuler(euler);
    APP.drone.position.set(position.x,position.y,position.z);
    APP.axisHelper.setRotationFromEuler(euler);
    APP.axisHelper.position.set(position.x,position.y,position.z);

    // カメラもドローンに追従させる
    APP.camera.position.set(position.x+rel.x,position.y+rel.y,position.z+rel.z);

    // OrbitControlsの中心をドローンに合わせる
    APP.controls.target.set(APP.drone.position.x,APP.drone.position.y,APP.drone.position.z);
  }
}
