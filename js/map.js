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

var bbox = '253700,6637800,273800,6663700';
var layers='N5000Hoydelag,N2000Hoydelag,N1000Hoydelag,N500Hoydelag,N250Hoydelag,N5000Arealdekkeflate,N2000Arealdekkeflate,N1000Arealdekkeflate,N500Arealdekkeflate,N250Arealdekkeflate,N50Arealdekkeflate,fkb_ar5,fkb_arealbruk,fjellskygge,N5000Vannflate,N2000Vannflate,N1000Vannflate,N500Vannflate,N250Vannflate,N50Vannflate,fkb_vannflate,N5000Vannkontur,N2000Vannkontur,N1000Vannkontur,N500Vannkontur,N250Vannkontur,N50Vannkontur,fkb_vannkontur,N5000Elver,N2000Elver,N1000Elver,N500Elver,N250Elver,N50Elver,fkb_elver,N50Flomlop,N5000Bilveg,N2000Bilveg,N1000Bilveg,N500Bilveg,N250Bilveg,N50Bilveg,N500Annenveg,N250Annenveg,N50Annenveg,fkb_vegnett,fkb_baneitunnel,fkb_lufthavn,fkb_veg,fkb_vegavgrensning,fkb_bane,fkb_bru,fkb_banebru,fkb_vegbru,fkb_vegavgrensningbru,N5000Jernbane,N2000Jernbane,N1000Jernbane,N500Jernbane,N250Jernbane,N50Jernbane,N5000Bilferge,N2000Bilferge,N1000Bilferge,N500Bilferge,N250Bilferge,N50Bilferge,N5000AnnenBatrute,N2000AnnenBatrute,N1000Passasjerferge,N500Passasjerferge,N250Passasjerferge,N50Passasjerferge,fkb_naturinfo,N1000Anleggslinje,N500Anleggslinje,N250Anleggslinje,N50Anleggslinje,fkb_anleggslinje,fkb_ledning_el,fkb_bygnanleggsfalte,N50Bygningsflate,N50Tankflate,fkb_bygningsflate,fkb_bygningsavgrensning,fkb_pbltiltak,fkb_bygningspunkt,N1000Bygningspunkt,N500Bygningspunkt,N250Bygningspunkt,N50Bygningspunkt,fkb_fastmerke,N2000Jernbanestasjon,N1000Jernbanestasjon,N500Jernbanestasjon,N250Jernbanestasjon,N50Jernbanestasjon,N50Vegbom,N500Turisthytte,N250Turisthytte,N50Turisthytte,N2000Anleggspunkt,N1000Anleggspunkt,N500Anleggspunkt,N250Anleggspunkt,N50Anleggspunkt,fkb_vannpunkt,fkb_anleggspunkt,fkb_ledning_el_punkt,N5000Arealdekkepunkt,N2000Arealdekkepunkt,N1000Arealdekkepunkt,N500Arealdekkepunkt,N250Arealdekkepunkt,N50Arealdekkepunkt,N5000Tettsted,N2000Tettsted,N1000Tettsted,N500Tettsted';
var wmsUrl = 'http://openwms.statkart.no/skwms1/wms.topo.graatone2?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:32633&BBOX=' + bbox + '&WIDTH=2010&HEIGHT=2590&LAYERS=' + layers + '&FORMAT=image/png';

var scene = new THREE.Scene();

var geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight, 1, 1);

var material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('data/wms_oslo_topo2_graatone.png')
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