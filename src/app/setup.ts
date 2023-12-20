import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const DIM = 3;
const OPACITY = 0.5;




const data = [];

function parseContent(text: string, scene: THREE.Scene){
    console.log("parse ---")
    const lol = text.split("\n").map(line => {
        return line.split(" ").map(value => {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)){
                throw new Error();
            }
            return parsedValue;
        })
    })
    if (lol.length %2 == 1){
        return;
    }
    for (let i = 0 ; i < lol.length ; i ++){
        if (i % 2 == 0){
            if (lol[i].length != 3){
                return;
            } 
        } else {
            if(lol[i].length %3 != 0){
                return;
            }
        }
    }
    console.log("valid")

    for (let i = scene.children.length - 1; i >= 0; i--) {
        scene.remove(scene.children[i]);
     }

    for (const div of document.getElementsByClassName("color-shadow")){
        div.parentNode?.removeChild(div);
    }


    drawHalfAxis(scene, 5, 0xFF0000, new THREE.Vector3(1, 0, 0)); // X axis
    drawHalfAxis(scene, 5, 0x00FF00, new THREE.Vector3(0, 1, 0)); // Y axis
    drawHalfAxis(scene, 5, 0x0000FF, new THREE.Vector3(0, 0, 1)); // Z axis

    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
    let colorIndex = 0;

    for (let i = 0 ; i < lol.length ; i ++){
        if (i % 2 == 0){
            const colorShadow = document.createElement("div");
            colorShadow.classList.add("color-shadow");
            colorShadow.style.top = (5+i*15) + "px"
            colorShadow.style.backgroundColor = hexToRGBA(colors[colorIndex], 0.3);
            document.body.appendChild(colorShadow);

            
            for (let j = 0 ; j < lol[i+1].length ; j += 3){
                const w = lol[i+1][j];
                const h = lol[i+1][j+1];
                const d = lol[i+1][j+2];
                const geometry = new THREE.BoxGeometry(w, h,d); 
                
                const material = new THREE.MeshBasicMaterial({color: colors[colorIndex],
                transparent: true,
            opacity: OPACITY}); // Red color

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(lol[i][0] + w/2, lol[i][1] + h/2, lol[i][2] + d/2);
                scene.add(mesh)
            }
            colorIndex = (colorIndex + 1)% colors.length;
        }
        
       

    }


    data.splice(0, data.length);
}

function setup(){

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0); // x, y, z
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.5, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0,0,0);


    // const geometry = new THREE.BoxGeometry(1,1,1,1,1,1); 
    // const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.set(0.5,0.5,0.5);
    // scene.add(mesh)


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    controls.target.copy(new THREE.Vector3(0,0,0))
    
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    renderer.render(scene, camera);





    const div = document.createElement("textarea");
    div.id = "data"
    document.body.appendChild(div);
    div.value = "0 0 0\n2 1 1\n1 0 1\n1 1 1";
    parseContent(div.value, scene);

    div.oninput = () => {
        if (div.value){
            parseContent(div.value, scene);
        }
    }
    
}

function drawHalfAxis(scene, length, color, direction) {
    var material = new THREE.LineBasicMaterial({color: color});
    var geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(direction.x * length, direction.y * length, direction.z * length)
    ]);
    var line = new THREE.Line(geometry, material);
    scene.add(line);
 }


 function hexToRGBA(hex, alpha) {
    var r = (hex >> 16) & 0xFF;
    var g = (hex >> 8) & 0xFF;
    var b = hex & 0xFF;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
 }


setup();