var bounds = [253700, 6637800, 273800, 6663700], // UTM 33N left, bottom, right, top
    boundsWidth = bounds[2] - bounds[0],
    boundsHeight = bounds[3] - bounds[1],
    cellSize = 100,
    xCells = boundsWidth / cellSize,
    yCells = boundsHeight / cellSize,
    sceneWidth = 100,
    sceneHeight = 100 * (boundsHeight / boundsWidth),
    boxSize = sceneWidth / xCells,
    valueFactor = 0.02,
    width  = window.innerWidth,
    height = window.innerHeight;

var colorScale = d3.scale.linear()
    .domain([0, 100, 617])
    .range(['#fec576', '#f99d1c', '#E31A1C']);

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

var ambLight = new THREE.AmbientLight(0x777777);
scene.add(ambLight);

var dirLight = new THREE.DirectionalLight(0xcccccc, 1);
dirLight.position.set(-70, -50, 80);
scene.add(dirLight);


function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

var csv = d3.dsv(' ', 'text/plain');

csv('data/Oslo_bef_100m_2015.csv').get(function(error, data) { // ru250m_2015.csv
    for (var i = 0; i < data.length; i++) {
        var id = data[i].rute_100m,
            utmX = parseInt(id.substring(0, 7)) - 2000000 + cellSize, // First seven digits minus false easting
            utmY = parseInt(id.substring(7, 14)) + cellSize, // Last seven digits
            sceneX = (utmX - bounds[0]) / (boundsWidth / sceneWidth) - sceneWidth / 2,
            sceneY = (utmY - bounds[1]) / (boundsHeight / sceneHeight) - sceneHeight / 2,
            value = parseInt(data[i].sum);

        var geometry = new THREE.BoxGeometry(boxSize, boxSize, value * valueFactor);

        var material = new THREE.MeshPhongMaterial({
            color: colorScale(value)
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(sceneX, sceneY, value * valueFactor / 2);

        scene.add(cube);
    }
});