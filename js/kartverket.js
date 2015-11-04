var bounds = [253700, 6637800, 273800, 6663700], // UTM 33N west, south, east, north
    boundsWidth = bounds[2] - bounds[0],
    boundsHeight = bounds[3] - bounds[1],
    sceneWidth = 100,
    sceneHeight = 100 * (boundsHeight / boundsWidth),
    width  = window.innerWidth,
    height = window.innerHeight;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 20, width / height, 0.1, 1000 );
camera.position.set(0, -200, 120);

var controls = new THREE.TrackballControls(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild( renderer.domElement );

var geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight, 1, 1),
    material = new THREE.MeshBasicMaterial(),
    plane = new THREE.Mesh(geometry, material);

var textureLoader = new THREE.TextureLoader();
textureLoader.load('data/wms_oslo_topo2_graatone.jpg', function(texture) {
    material.map = texture;
    scene.add(plane);
});

function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();