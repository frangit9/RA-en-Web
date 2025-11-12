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
    './assets/cancercino.glb', // Modelo
    (gltf) => {
        const model = gltf.scene;

        // Ajuste de escala
        model.scale.set(0.5, 0.5, 0.5);

        // Posición más baja sobre el marcador
        model.position.set(0, -0.05, 0); // bajamos un poco en Y

        // Rotación mirando al frente
        model.rotation.set(0, Math.PI, 0); // gira 180° sobre Y si está al revés

        // Material básico por si faltan texturas
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material || new THREE.MeshStandardMaterial({ color: 0xffffff });
            }
        });

        anchor.group.add(model);
        console.log("Modelo cargado correctamente:", model);
    },
    (xhr) => {
        if(xhr.total) {
            console.log(`Cargando modelo: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        }
    },
    (error) => console.error("Error al cargar el modelo GLB:", error)
);

// -------------------- OBJETO DE PRUEBA --------------------
const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.1,0.1,0.1),
    new THREE.MeshStandardMaterial({color: 0xff0000})
);
anchor.group.add(testCube);

// -------------------- FUNCIONES DE INICIO --------------------
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
