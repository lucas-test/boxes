import { dushnikMillerDim } from 'representations';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { checkContactDimension, computeIntersectionComplex, isPacking, Stair } from './stairs';


const OPACITY = 0.5;

const elements = new Array();




function parseContent(text: string, scene: THREE.Scene){
    console.log("parse ---")
    let isValid = true;
    const lol = text.split("\n").map(line => {
        return line.split(" ").map(value => {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)){
                isValid = false;
            }
            return parsedValue;
        })
    })
    if (isValid == false){
        return;
    }

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

    const stairs = new Array<Stair>();

    const stairsData = document.getElementById("stairs-data");
    stairsData.innerHTML = "";

    for (let i = 0 ; i < lol.length ; i +=2){
        const colorShadow = document.createElement("div");
        colorShadow.classList.add("color-shadow");
        colorShadow.style.top = (5+i*15) + "px"
        colorShadow.style.backgroundColor = hexToRGBA(colors[colorIndex], 0.3);
        document.body.appendChild(colorShadow);


        const meshes = new Array<THREE.Mesh>();

        const dims = new Array<THREE.Vector3>();
        const c = new THREE.Vector3(lol[i][0] , lol[i][1] , lol[i][2] )
        for (let j = 0 ; j < lol[i+1].length ; j += 3){
            const w = lol[i+1][j];
            const h = lol[i+1][j+1];
            const d = lol[i+1][j+2];
            const geometry = new THREE.BoxGeometry(w, h,d); 
            dims.push(new THREE.Vector3(w,h,d));
            
            const material = new THREE.MeshBasicMaterial({color: colors[colorIndex],
            transparent: true,
        opacity: OPACITY}); // Red color

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(lol[i][0] + w/2, lol[i][1] + h/2, lol[i][2] + d/2);
            scene.add(mesh)
            meshes.push(mesh);
        }

        colorShadow.onclick = (e) => {
            for (const mesh of meshes){
                mesh.visible = !mesh.visible;
            }
        }

        stairs.push(new Stair(c, dims))

        colorIndex = (colorIndex + 1)% colors.length;
    }

    


    // const faces = computeSimplicialComplex(stairs);
    // printASC(faces);
    // const delta = faces.map(v => Array.from(v));

    console.time("IC");
    const faces2 = computeIntersectionComplex(stairs);
    console.timeEnd("IC");
    const faces2bis = Array.from(faces2);

    function computeDM(){
        const faces2ter = faces2bis.map(v => Array.from(v));
        console.time("DM");
        const repre = dushnikMillerDim(faces2ter, 4);
        console.timeEnd("DM");
        const button = document.getElementById("dm4");
        if (typeof repre == "undefined"){
            button.textContent = "NO"
        } else {
            button.textContent = "YES"
        }
        // console.log(repre);
    }
    

    // Check packing
    const isPack = isPacking(stairs);

    // Compute contact dimension
    const contactProperty = checkContactDimension(stairs);

    const info = document.getElementById("info");
    if (info){
        info.innerHTML = "<b>Faces:</b><br>";
        for (const face of faces2){
            info.innerHTML += Array.from(face).toString();
            info.innerHTML += "<br>"
        }

        // info.innerHTML += "Faces:<br>";
        // for (const face of delta){
        //     info.innerHTML += face.toString();
        //     info.innerHTML += "<br>"
        // }

        info.innerHTML += "is packing ? " + (isPack ? "OK" : "X") + "<br>";


        info.innerHTML += "contact dim ? " + (typeof contactProperty == "undefined" ? "OK" : contactProperty.toString())
        info.innerHTML += "<br>"
        info.innerHTML += "DM <= 4 ? " + "<button id='dm4'>compute</button>"
        
        const button = document.getElementById("dm4");
        button.addEventListener("click", computeDM);
    }

    


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



    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onDocumentMouseDown(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            console.log("Clicked object:", intersects[0].object);
        }
     }
    
    // renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);


    // Controls
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


    // Info
    const info = document.createElement("div");
    info.id = "info";
    document.body.appendChild(info);

    // Stairs Data
    const stairsData = document.createElement("div");
    stairsData.id = "stairs-data";
    document.body.appendChild(stairsData);


    // Input
    const div = document.createElement("textarea");
    div.id = "data"
    document.body.appendChild(div);
    div.value = 
`2 -1 0
1 4 1 1 1 3
-1 0 2
4 1 1 1 3 1
0 2 -1
1 1 4 3 1 1
-2 -2 -2
4 3.5 3 5 4 2 2 5 4 4 2 5 3 4 3.5 3.5 3 4
1 1 1
2 2 2
-5 3 -4
9 1 8
-4 -5 3
7 8 1
3 -4 -5
1 7 9`;
/*


`2 0 0
1 3 2
0 0 2
3 2 1
0 2 0
2 1 3
1 1 1
1 1 1
0 0 0
2 2 1 2 1 2 1 2 2`;
*/
    parseContent(div.value, scene);

    div.oninput = () => {
        if (div.value){
            parseContent(div.value, scene);
        }
    }


    // console.time("test")
    // dushnikMillerDim([[0,1,2,5],[0,1,3,4],[0,2,3,4],[1,2,3,4]], 4)
    // console.timeEnd("test")
    
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