console.log("modelviewer.js started");
var i = 0;
var scene = new THREE.Scene();
canvas = document.getElementById('modelviewer'); // div要素の取得
console.log(canvas);
renderer = new THREE.WebGLRenderer({ alpha: true ,antialias:true});
renderer.setClearColor( new THREE.Color(0xffffff),0.0);//背景色
renderer.setSize( canvas.clientWidth, canvas.clientWidth*0.66);
//renderer.setSize( $("#modelviewer").width(), $("#modelviewer").height());
canvas.appendChild(renderer.domElement); // div領域にレンダラーを配置

camera = new THREE.PerspectiveCamera( 75, 640/480, 1, 10000 );
camera.position.z = 1000;

//ライティング
var directionalLight = new THREE.DirectionalLight( 0xffffff, 3 ); //平行光源（色、強度）
directionalLight.position.set(0,0,3);
scene.add( directionalLight );

//オブジェクト
var loader = new THREE.JSONLoader();
loader.load( './models/drone.json', loadCallBack);

planeGeometry = new THREE.PlaneGeometry( 1000, 1000, 10, 10 );//大きさ100*100,分割数1*1
planeMaterial = new THREE.MeshBasicMaterial( { color: 0x533E25, wireframe:true} );
planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
planeMesh.position.y = -40;
planeMesh.rotation.x = 90 * 2 * Math.PI / 360; //左に角度いれるとラジアンに変換
scene.add( planeMesh );
// Controlを用意
controls = new THREE.TrackballControls( camera, canvas );

var json = new THREE.Mesh();
animate();

// Change renderer dimension on resize
$(window).resize(function() {
    renderer.setSize( canvas.clientWidth, canvas.clientWidth*0.66);
});

function loadCallBack(geometry, materials){
        //今回使用した熊のデータはmaterial=undefinedなので使わない。
       var faceMaterial  = new THREE.MeshNormalMaterial();//法線マップにする（簡単に立体的に見せるため）
       json = new THREE.Mesh( geometry, faceMaterial );
       json.scale.set( 100, 100, 100 );
       scene.add( json );
}

function animate() {
   requestAnimationFrame( animate );

   controls.update();
   //json.rotation.y += 1 * 2 * Math.PI / 360; //左に角度いれるとラジアンに変換
   i += Math.PI/180;
   json.position.x = 300*Math.sin(i)
   renderer.render( scene, camera );

}
