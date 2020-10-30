import * as THREE from '/js/three.module.js';
import {    GUI} from '/js/dat.gui.module.js';
import {    RGBELoader} from '/js/RGBELoader.js';

var camera, scene, renderer, container, controls;

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouseX = 0;
var mouseY = 0;

var params = {
    envMap: 'HDR',
    roughness: 0.0,
    metalness: 0.0,
    exposure: 0.3,
    debug: false
};

init();
animate();

$(document).ready(function () {
    var x = "HDR env + широкоугольная камера с границами обзора + текст";
    document.getElementById("info").innerHTML = x;
});




function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    // CAMERA
    camera = new THREE.PerspectiveCamera(150, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 5000);
    camera.position.z = 2500;

    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 500, 4000);

    // LIGHTS
    //    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    //    dirLight.position.set(0, 0, 1).normalize();
    //    scene.add(dirLight);
    //
    //    var pointLight = new THREE.PointLight(0xffffff, 1.5);
    //    pointLight.position.set(0, 100, 90);
    //    scene.add(pointLight);

    // LOADER

    THREE.DefaultLoadingManager.onLoad = function () {
        pmremGenerator.dispose();
    };

    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('tex/')
        .load('urban_street_01_2k_2.hdr', function (texture) {
            var envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.background = envMap;
            scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
            render();

            // model
            var loader = new THREE.FontLoader();
            //            loader.load('fonts/roboto_regular.typeface.json', function (font) {
            loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
                var xMid, text;
                var color = 0xFF0000;
                var matDark = new THREE.LineBasicMaterial({
                    color: color,
                    side: THREE.DoubleSide
                });

                var matLite = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });

                //                var message = "   ||||||||\npustota";
                var message = "FINEST\n      INTERACTIVE\n  CONTENT";
                //                var message = "СОВРЕМЕННАЯ\n      КОМПЬЮТЕРНАЯ\n  ГРАФИКА";
                var shapes = font.generateShapes(message, 1000);
                var geometry = new THREE.ShapeBufferGeometry(shapes);

                geometry.computeBoundingBox();
                xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                geometry.translate(xMid, 0, 0);

                // make shape ( N.B. edge view not visible )
                text = new THREE.Mesh(geometry, matLite);
                text.position.z = -150;
                scene.add(text);

                // make line shape ( N.B. edge view remains visible )
                var holeShapes = [];
                for (var i = 0; i < shapes.length; i++) {
                    var shape = shapes[i];
                    if (shape.holes && shape.holes.length > 0) {
                        for (var j = 0; j < shape.holes.length; j++) {
                            var hole = shape.holes[j];
                            holeShapes.push(hole);
                        }
                    }
                }

                shapes.push.apply(shapes, holeShapes);
                var lineText = new THREE.Object3D();
                for (var i = 0; i < shapes.length; i++) {
                    var shape = shapes[i];
                    var points = shape.getPoints();
                    var geometry = new THREE.BufferGeometry().setFromPoints(points);
                    geometry.translate(xMid, 0, 0);
                    var lineMesh = new THREE.Line(geometry, matDark);
                    lineText.add(lineMesh);
                }
                scene.add(lineText);
            });

        });

    // GROUND PLANE
    //    var plane = new THREE.Mesh(
    //        new THREE.PlaneBufferGeometry(10000, 10000),
    //        new THREE.MeshBasicMaterial({
    //            color: 0xffffff,
    //            opacity: 0.7,
    //            transparent: true
    //        })
    //    );
    //
    //    plane.position.y = -300;
    //    plane.rotation.x = -Math.PI / 2;
    //    scene.add(plane);

    // RENDER
    //    renderer = new THREE.WebGLRenderer({
    //        antialias: true
    //    });
    //    renderer.setPixelRatio(window.devicePixelRatio);
    //    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    //    document.body.appendChild(renderer.domElement);

    var gui = new GUI();

    gui.add(params, 'envMap', ['Generated', 'LDR', 'HDR', 'RGBM16']);
    gui.add(params, 'roughness', 0, 1, 0.01);
    gui.add(params, 'metalness', 0, 1, 0.01);
    gui.add(params, 'exposure', 0, 2, 0.01);
    gui.add(params, 'debug', false);
    gui.open();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = params.exposure;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    var pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // EVEMT LISTENERS
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

} // end init

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    camera.position.x += (mouseX - camera.position.x) * .03;
    camera.position.y += (-(mouseY - 200) - camera.position.y) * .03;
    camera.lookAt(scene.position);
    renderer.toneMappingExposure = params.exposure;
    renderer.render(scene, camera);
}
