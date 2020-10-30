 import * as THREE from '/js/three.module.js';
 import {
     GUI
 } from '/js/dat.gui.module.js';


 var camera, scene, renderer;

 var mesh;
 var amount = parseInt(window.location.search.substr(1)) || 10;
 var count = Math.pow(amount, 3);
 var dummy = new THREE.Object3D();

 init();
 animate();

 function init() {

     camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
     camera.position.set(amount * 0.9, amount * 0.9, amount * 0.9);
     camera.lookAt(0, 0, 0);

     scene = new THREE.Scene();





     var loader = new THREE.BufferGeometryLoader();
     loader.load('models/suzanne_buffergeometry.json', function (geometry) {

         geometry.computeVertexNormals();
         geometry.scale(0.5, 0.5, 0.5);

         var material = new THREE.MeshNormalMaterial();
         // check overdraw
         // var material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.1, transparent: true } );

         mesh = new THREE.InstancedMesh(geometry, material, count);
         mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
         scene.add(mesh);

         //

         var gui = new GUI();
         gui.add(mesh, 'count', 0, count);

     });



     //

     renderer = new THREE.WebGLRenderer({
         antialias: true
     });
     renderer.setPixelRatio(window.devicePixelRatio);
     renderer.setSize(window.innerWidth - 100, window.innerHeight - 100);
     document.body.appendChild(renderer.domElement);

     //

     window.addEventListener('resize', onWindowResize, false);

 }

 function onWindowResize() {

     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();

     renderer.setSize(window.innerWidth, window.innerHeight);

 }

 //

 function animate() {

     requestAnimationFrame(animate);

     render();

 }

 function render() {

     if (mesh) {

         var time = Date.now() * 0.001;

         mesh.rotation.x = Math.sin(time / 4);
         mesh.rotation.y = Math.sin(time / 2);

         var i = 0;
         var offset = (amount - 1) / 2;

         for (var x = 0; x < amount; x++) {

             for (var y = 0; y < amount; y++) {

                 for (var z = 0; z < amount; z++) {

                     dummy.position.set(offset - x, offset - y, offset - z);
                     dummy.rotation.y = (Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time));
                     dummy.rotation.z = dummy.rotation.y * 2;

                     dummy.updateMatrix();

                     mesh.setMatrixAt(i++, dummy.matrix);

                 }

             }

         }

         mesh.instanceMatrix.needsUpdate = true;

     }

     renderer.render(scene, camera);

 }
