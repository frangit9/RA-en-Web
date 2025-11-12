import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

// Mensaje de guía
const guideMessage = document.querySelector("#guideMessage");

// Inicialización de MindAR
const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./assets/ancho.mind"
});

const { renderer, scene, camera } = mindarThree;

// -------------------- ILUMINACIÓN --------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
directionalLight.position.set(1, 2, 2);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
scene.add(hemisphereLight);

// -------------------- ANCLAJE --------------------
const anchor = mindarThree.addAnchor(0);
anchor.onTargetFound = () => guideMessage.classList.add('hidden');
anchor.onTargetLost = () => guideMessage.classList.remove('hidden');

// -------------------- CARGA DEL MODELO --------------------
const loader = new GLTFLoader();
loader.load(
    './baller_roblox.glb', // Ruta de tu modelo 3D
    (gltf) => {
        const model = gltf.scene;
        // Ajuste de escala (haz el modelo más pequeño para encajar en el marcador)
        model.scale.set(0.2, 0.2, 0.2); 
        // Ajuste de posición (lo eleva ligeramente para que no se hunda en el marcador)
        model.position.y = 0.1; 
        // Agrega el modelo al anclaje
        anchor.group.add(model);
    },
    // Función que se ejecuta en caso de error
    (error) => { console.error('Error al cargar el modelo GLB:', error); }
);


// 4. Función de inicio: Enciende la cámara y el bucle de renderizado
const start = async () => {
    guideMessage.classList.remove('hidden');
    await mindarThree.start();
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
};

// -------------------- BOTONES --------------------
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");

startButton.addEventListener("click", start);
stopButton.addEventListener("click", () => {
    mindarThree.stop();
    renderer.setAnimationLoop(null);
    guideMessage.classList.add('hidden');
});
