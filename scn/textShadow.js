import * as THREE from '/js/three.module.js';

import {
    OrbitControls
} from '/js/OrbitControls.js';

var camera, scene, renderer;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, -400, 600);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 250, 1400);

    // LIGHTS

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);

    var pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);



    var loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {

        var xMid, text;

        var color = 0xff6699;

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

        var message = "   ||||||||\npustota";

        var shapes = font.generateShapes(message, 100);

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

    }); //end load function

    var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10000, 10000),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true
        })
    );

    plane.position.y = -300;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize, false);

} // end init

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    renderer.render(scene, camera);

}
