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
    height = window.innerHeight,
    color = d3.scale.linear()
        .domain([0, 100, 617])
        .range(['#fec576', '#f99d1c', '#E31A1C']);

var scene = new THREE.Scene();

var geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight, 1, 1);

var material = new THREE.MeshPhongMaterial();

var textureLoader = new THREE.TextureLoader();
textureLoader.load('data/wms_oslo_topo2_graatone.jpg', function(texture) {
    material.map = texture;
});

var plane = new THREE.Mesh(geometry, material);
scene.add(plane);

var aLight = new THREE.AmbientLight(0x777777); // soft white light
scene.add(aLight);

var dLight = new THREE.DirectionalLight(0xcccccc, 1);
dLight.position.set(-70, -50, 80);
scene.add(dLight);

var camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
camera.position.set(0, -200, 120);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

var controls = new THREE.TrackballControls(camera);

document.body.appendChild(renderer.domElement);

function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

var csv = d3.dsv(' ', 'text/plain');

var dataBounds = [];
var max = 0;

csv('data/Oslo_bef_100m_2015.csv').get(function(error, data) { // ru250m_2015.csv
    for (var i = 0; i < data.length; i++) {
        var id = data[i].rute_100m,
            x = parseInt(id.substring(0, 7)) - 2000000 + cellSize, // First seven digits minus false easting
            y = parseInt(id.substring(7, 14)) + cellSize; // Last seven digits

        if (!dataBounds[0] || x < dataBounds[0]) dataBounds[0] = x;
        if (!dataBounds[1] || y < dataBounds[1]) dataBounds[1] = y;
        if (!dataBounds[2] || x > dataBounds[2]) dataBounds[2] = x;
        if (!dataBounds[3] || y > dataBounds[3]) dataBounds[3] = y;

        if (parseInt(data[i].sum) > max) {
            max = parseInt(data[i].sum);
        }

        if (x > bounds[0] && x < bounds[2] && y > bounds[1] && y < bounds[3]) {
            scene.add(getBoxGeometry(x, y, parseInt(data[i].sum)));
        }
    }
    render();
});



function getBoxGeometry(x, y, value) {
    x = (x - bounds[0]) / (boundsWidth / sceneWidth) - sceneWidth / 2;
    y = (y - bounds[1]) / (boundsHeight / sceneHeight) - sceneHeight / 2;

    var geometry = new THREE.BoxGeometry(boxSize, boxSize, value * valueFactor);

    var material = new THREE.MeshLambertMaterial({    // MeshLambertMaterial
        color: color(value)
    });

    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, value * valueFactor / 2);

    return cube;
}