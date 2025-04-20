import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Archivo de gestión de modelos 3D
 * Carga modelos externos y los prepara para ser usados en el juego
 */

// Variable global que contendrá el modelo de la torre japonesa
// Exportamos la variable para que sea accesible desde otros módulos si es necesario
export let jtowermodel = null;

// Exportamos la función principal para que Game.js pueda importarla
export function loadJapaneseTowerModel() {
    console.log('Iniciando carga del modelo japonés...');
    
    const loader = new GLTFLoader();
        
    // Ruta al modelo (ajusta según dónde se encuentre)
    const modelPath = 'assets/models/jtowermodel.glb';
    console.log('Intentando cargar modelo desde:', modelPath);
    
    return new Promise((resolve, reject) => {
        loader.load(
            modelPath,
            // Callback de éxito
            (gltf) => {
                console.log('Modelo japonés cargado correctamente', gltf);
                jtowermodel = gltf.scene;
                
                // Ajustar posición, escala o rotación si es necesario
                // Estos valores tendrán que ajustarse según las características del modelo
                jtowermodel.scale.set(14, 14, 14);
                jtowermodel.position.set(0, 0, 0);
                
                // Configurar materiales y sombras
                jtowermodel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Opcional: mejorar materiales
                        if (child.material) {
                            child.material.roughness = 0.7;
                            child.material.metalness = 0.3;
                        }
                    }
                });
                
                console.log('Modelo japonés procesado y listo para usar');
                resolve(jtowermodel);
            },
            // Callback de progreso de carga
            (xhr) => {
                const percentage = (xhr.loaded / xhr.total) * 100;
                console.log(`Cargando modelo japonés: ${Math.round(percentage)}%`);
            },
            // Callback de error
            (error) => {
                console.error('Error al cargar el modelo japonés:', error);
                console.error('Ruta intentada:', modelPath);
                // Intentar con una ruta alternativa
                tryAlternativePath(loader, resolve, reject);
            }
        );
    });
}

/**
 * Intenta cargar el modelo desde rutas alternativas
 */
function tryAlternativePath(loader, resolve, reject) {
    // Intentar con nombres alternativos o ubicaciones diferentes
    const alternatePaths = [
        'assets/models/jtowermodel.glb',
        './assets/models/jtowermodel.glb',
        '../assets/models/jtowermodel.glb',
        './models/jtowermodel.glb',
        '../models/jtowermodel.glb',
        'jtowermodel.glb',
        '/models/jtowermodel.glb',
        '/models/japanese_tower.glb'
    ];
    
    console.log('Intentando rutas alternativas...');
    
    let pathIndex = 0;
    function tryNextPath() {
        if (pathIndex >= alternatePaths.length) {
            console.error('No se pudo cargar el modelo desde ninguna ruta alternativa');
            console.log('Usando modelo de respaldo...');
            const fallbackModel = createFallbackJapaneseTower();
            resolve(fallbackModel);
            return;
        }
        
        const path = alternatePaths[pathIndex];
        console.log(`Intentando ruta alternativa ${pathIndex + 1}/${alternatePaths.length}: ${path}`);
        
        loader.load(
            path,
            (gltf) => {
                console.log(`Modelo cargado exitosamente desde ruta alternativa: ${path}`);
                jtowermodel = gltf.scene;
                jtowermodel.scale.set(4, 4, 4);
                resolve(jtowermodel);
            },
            (xhr) => {
                const percentage = (xhr.loaded / xhr.total) * 100;
                console.log(`Cargando desde ruta alternativa: ${Math.round(percentage)}%`);
            },
            (error) => {
                console.error(`Error al cargar desde ${path}:`, error);
                pathIndex++;
                tryNextPath();
            }
        );
    }
    
    tryNextPath();
}

/**
 * Crea un modelo de respaldo simple si no se puede cargar el modelo externo
 */
function createFallbackJapaneseTower() {
    const towerGroup = new THREE.Group();
    
    // Color rojo característico de torres japonesas
    const redMaterial = new THREE.MeshPhongMaterial({
        color: 0xC00000,
        shininess: 30
    });
    
    // Color madera para la estructura
    const woodMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 20
    });
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
    const base = new THREE.Mesh(baseGeometry, woodMaterial);
    base.position.y = 0.25;
    towerGroup.add(base);
    
    // Poste central
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 12, 8);
    const pole = new THREE.Mesh(poleGeometry, woodMaterial);
    pole.position.y = 6.25;
    towerGroup.add(pole);
    
    // Techos (simplificados)
    const roofHeights = [2, 5, 8, 11];
    for (let i = 0; i < roofHeights.length; i++) {
        const size = 2.5 - (i * 0.4);
        const roofGeometry = new THREE.ConeGeometry(size, 1, 6);
        const roof = new THREE.Mesh(roofGeometry, redMaterial);
        roof.position.y = roofHeights[i];
        towerGroup.add(roof);
    }
    
    jtowermodel = towerGroup;
    return Promise.resolve(towerGroup);
} 