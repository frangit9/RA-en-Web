import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

// Mensaje de guía
const guideMessage = document.querySelector("#guideMessage");

// Inicialización de MindAR
const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./assets/targets.mind" // Asegúrate de que este archivo .mind contenga DOS marcadores
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

/**
 * Función reutilizable para cargar un modelo GLB y añadirlo a un anclaje.
 * @param {string} path - Ruta al archivo .glb del modelo.
 * @param {THREE.Group} anchorGroup - El grupo del anclaje donde se añadirá el modelo.
 */
const loadModel = (path, anchorGroup) => {
  const loader = new GLTFLoader();
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      
      // Centramos el modelo para facilitar su manipulación
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);
      
      // Creamos un contenedor para aplicar transformaciones
      //Ahora vamos a poner que cuando el mind sea kirby.glb, el tamaño sea diferente y sino es kirby se mantiene el tamaño original
        const wrapper = new THREE.Group();
        if (path.includes('kirby')) {
            wrapper.scale.set(2.5, 2.5, 2.5); // Escala más pequeña para kirby.glb
            wrapper.rotation.y = 0; // Rotación de 0 grados en el eje Y
        } else {
            wrapper.scale.set(0.3, 0.3, 0.3); // Escala original para otros modelos
            wrapper.rotation.y = Math.PI/2; // Sin rotación adicional
        }

      
      wrapper.add(model);
      
      // Añadimos el contenedor al grupo del anclaje
      anchorGroup.add(wrapper);
    },
    undefined, // onProgress, no lo usamos aquí
    (error) => {
      console.error(`Error al cargar el modelo ${path}:`, error);
    }
  );
};

// -------------------- ANCLAJES Y MODELOS --------------------

// Anclaje y modelo para el primer marcador (índice 0)
const anchor1 = mindarThree.addAnchor(0);
anchor1.onTargetFound = () => guideMessage.classList.add('hidden');
anchor1.onTargetLost = () => guideMessage.classList.remove('hidden');
loadModel('./assets/baller_roblox.glb', anchor1.group);

// Anclaje y modelo para el segundo marcador (índice 1)
const anchor2 = mindarThree.addAnchor(1);
anchor2.onTargetFound = () => guideMessage.classList.add('hidden');
anchor2.onTargetLost = () => guideMessage.classList.remove('hidden');
// Reemplaza './assets/another_model.glb' con la ruta al segundo modelo
loadModel('./assets/kirby.glb', anchor2.group);
//yo cuando el nombre del modelo estaba con k mayúscula entonces sólo cargaba en mi compu

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
