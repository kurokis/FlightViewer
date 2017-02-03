// =============================================================================
OrbitControls = require('three-orbit-controls')(THREE)

var APP={ };
var HUD={ };

//ドキュメント読み込み時の即時実行関数
$(document).ready( function() {
  //レンダラー
  APP.canvas = document.getElementById('modelviewer'); // div要素の取得
  APP.renderer = new THREE.WebGLRenderer({ alpha: true ,antialias:true});
  APP.renderer.setClearColor( new THREE.Color(0xffffff),0.0);//背景色
  APP.renderer.setSize( APP.canvas.clientWidth, APP.canvas.clientWidth*0.66);
  APP.canvas.appendChild(APP.renderer.domElement); // div領域にレンダラーを配置
  APP.renderer.autoClear = false; // 複数のシーンを重ねて表示する場合は、falseにする必要がある

  //カメラ
  APP.camera = new THREE.PerspectiveCamera( 35, 640/480, 1, 10000 );
  APP.camera.position.set(-700,300,-300);
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
         APP.drone.scale.set( 100, 100, 100 );
         APP.drone.rotation.order = "ZYX";
         APP.drone.rotation.z += Math.PI/4;
         APP.drone.rotation.x -= Math.PI/2;
         APP.scene.add( APP.drone );
  });

  //平面
  var planeGeometry = new THREE.PlaneGeometry( 1000, 1000, 10, 10 );//大きさ100*100,分割数1*1
  var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x533E25, wireframe:true} );
  APP.planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
  APP.scene.add( APP.planeMesh );

  // Controlを用意
  //APP.controls = new THREE.TrackballControls( APP.camera, APP.canvas );
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

  animate();
});

// =============================================================================
// Change renderer dimension on resize
$(window).resize(function() {
  if(APP.canvas){ // APP.canvasが存在すれば（ページ読み込み時のエラー回避）
    APP.renderer.setSize( APP.canvas.clientWidth, APP.canvas.clientWidth*0.66);
  }
});

// =============================================================================
// Animating function
function animate() {
   requestAnimationFrame( animate ); //自身を呼ぶことで繰り返し更新される

   APP.controls.update();
   //APP.renderer.render( APP.scene, APP.camera );

   var width = APP.canvas.clientWidth
   var height = APP.canvas.clientWidth*0.66;
   var insetWidth = 100;
   var insetHeight = 100;

   APP.renderer.clear(); // autoclearをfalseにしたので、自分でクリアする
   APP.renderer.setViewport( 0, 0, width, height );
   APP.renderer.render( APP.scene, APP.camera );

   // HUD
   APP.camera2.position.copy( APP.camera.position );
	 APP.camera2.position.sub( APP.controls.target ); // added by @libe
	 APP.camera2.position.setLength( 10 );
   APP.camera2.lookAt( APP.scene2.position );
   APP.renderer.clearDepth(); // important! clear the depth buffer
   APP.renderer.setViewport( 0, 0, insetWidth, insetHeight );
   APP.renderer.render( APP.scene2, APP.camera2 );
}

function setAttitude(roll,pitch,yaw){
  // APP内のカメラはデフォルトで[x,y,z]=[右,上、手前]（右手系）になっている。
  //
  // [x]      [ ] [x]
  // [y]    = [ ] [y]
  // [z]_app  [ ] [z]_world

}
