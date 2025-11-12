import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 

// Referencia al elemento HTML del mensaje de guía
const guideMessage = document.querySelector("#guideMessage");

// 1. Inicialización de MindAR: Configura el motor de Realidad Aumentada
const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./ancho.mind" // Archivo del marcador a detectar
});

// Desestructuración para obtener los componentes base de la escena 3D
const { renderer, scene, camera } = mindarThree;

// ILUMINACIÓN DE LA ESCENA
// Algo que nos pasó fue que se veía todo el baller negro, y roberth con sus grandes conocimientos en cosas 3d pensó en que capaz tenía que ver algo con la iluminación bien tuff
// y al parecer los elementos glb si necesitan iluminación, utilizamos AmbienLight con colores en hexa y los añadimos a la escena

// Luz Ambiental: Ilumina toda la escena uniformemente.
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

//luz direccional simula una fuente de luz fuerte (como el sol), dando definición y sombras.
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(1, 1.5, 1); 
scene.add(directionalLight);
// ------------------------------------

// 2. Definición del Anclaje: El punto en el que se colocará el objeto 3D
const anchor = mindarThree.addAnchor(0); // 0 es el índice del primer marcador en ancho.mind

// --- CONTROL DE VISIBILIDAD DEL TEXTO ---

// Evento que se dispara cuando el marcador es DETECTADO (el Baller aparece)
anchor.onTargetFound = () => {
    // Oculta el mensaje de guía al encontrar el marcador
    guideMessage.classList.add('hidden');
};

// Evento que se dispara cuando el marcador se PIERDE (el Baller desaparece)
anchor.onTargetLost = () => {
    // Muestra el mensaje de guía al perder el marcador
    guideMessage.classList.remove('hidden');
};

// -----------------------------------------

// 3. Carga del Modelo 3D (baller_roblox.glb)
const loader = new GLTFLoader();

loader.load(
  './baller_roblox.glb', // Ruta de nuestro modelo 3D
  (gltf) => {
    const model = gltf.scene;

    // Esta función se complicó un poco porque hay que calcular el centro del modelo,
    // de modo que al rotar se rote desde el centro

    // 1. Calcula la "caja" que envuelve a tu modelo
    const box = new THREE.Box3().setFromObject(model);

    // 2. Obtiene el centro geométrico de esa caja
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 3. Mueve la geometría del modelo para que su centro
    //    quede en el origen [0,0,0].
    //    Lo movemos en la dirección opuesta a donde está su centro.
    model.position.sub(center);

    // 1. Crea un contenedor (wrapper)
    const wrapper = new THREE.Group();

    // 2. Aplica TUS transformaciones al CONTENEDOR
    wrapper.scale.set(0.4, 0.4, 0.4);
    wrapper.position.y = 0.1;
    wrapper.rotation.y = Math.PI; // ¡Ahora sí debería funcionar!

    // 3. Añade el modelo (ya centrado) dentro del contenedor
    wrapper.add(model);

    // 4. Agrega el CONTENEDOR al anclaje
    anchor.group.add(wrapper);
  },
  // Función que se ejecuta en caso de error
  (error) => {
    console.error('Error al cargar el modelo GLB:', error);
  }
);


// 4. Función de inicio: Enciende la cámara y el bucle de renderizado
const start = async () => {
    // Asegura que el mensaje de guía esté visible al iniciar (antes de la detección)
    guideMessage.classList.remove('hidden');
    await mindarThree.start(); 
    
    // Bucle de animación: Dibuja la escena en cada fotograma
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

// 5. Conexión de Eventos a los Botones
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");

startButton.addEventListener("click", () => {
    start();
});

stopButton.addEventListener("click", () => {
    mindarThree.stop();
    // Detiene el bucle de animación de Three.js
    mindarThree.renderer.setAnimationLoop(null); 
    // Oculta el mensaje cuando la AR se detiene
    guideMessage.classList.add('hidden'); 
});