import * as THREE from 'three';
import { Disk } from './Disk.js'; // Asegúrate de que Disk.js también exporte la clase Disk

/**
 * Clase que representa una torre en el juego Torre de Hanoi
 */
export class Tower {
    /**
     * Constructor de la clase Tower
     * @param {number} id - Identificador de la torre (0, 1, 2)
     * @param {THREE.Vector3} position - Posición de la torre
     * @param {THREE.Scene} scene - La escena principal del juego
     * @param {string} theme - Tema de la torre (default, japanese, futuristic, ancient)
     */
    constructor(id, position, scene, theme = 'default') {
        this.id = id;
        this.position = position;
        this.disks = [];
        this.theme = theme;
        this.baseMesh = this.createBaseMesh();
        this.mesh = this.createMesh();
        this.decorations = [];
        
        // Crear decoraciones según el tema
        this.createDecorations();
    }

    /**
     * Crea el mesh 3D de la torre (poste vertical)
     * @return {THREE.Mesh} - Mesh de la torre
     */
    createMesh() {
        let height = 12;
        let radius = 0.5;
        let geometry, material;
        
        switch (this.theme) {
            case 'japanese':
                // Para el tema japonés, cargaremos un modelo predefinido en otra parte
                // Aquí solo creamos un objeto mesh temporal que será reemplazado
                geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 6);
                material = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    visible: false // Hacemos el poste central invisible
                });
                break;
                
            case 'futuristic':
                // Poste futurista con secciones
                geometry = this.createFuturisticTowerGeometry(height, radius);
                material = new THREE.MeshPhongMaterial({
                    color: 0x00FFFF,
                    shininess: 100,
                    specular: 0xFFFFFF,
                    emissive: 0x003366,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            case 'ancient':
                // Columna antigua
                geometry = this.createAncientColumnGeometry(height, radius * 1.5);
                material = new THREE.MeshPhongMaterial({
                    color: 0xE0DFBD,
                    shininess: 5,
                    bumpScale: 0.1
                });
                break;
                
            case 'crystal':
                // Torre de cristal
                geometry = new THREE.CylinderGeometry(radius * 0.7, radius, height, 16);
                material = new THREE.MeshPhysicalMaterial({
                    color: 0x88CCFF,
                    metalness: 0.1,
                    roughness: 0.2,
                    transparent: true,
                    opacity: 0.7,
                    clearcoat: 1,
                    clearcoatRoughness: 0.1
                });
                break;
                
            default:
                // Torre clásica
                geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
                material = new THREE.MeshPhongMaterial({
                    color: 0x8B4513,
                    shininess: 10
                });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.position.y += height / 2;
        
        // Añadir sombras
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    /**
     * Crea el mesh 3D de la base de la torre
     * @return {THREE.Mesh} - Mesh de la base
     */
    createBaseMesh() {
        let width = 8;
        let height = 1;
        let depth = 8;
        let geometry, material;
        
        switch (this.theme) {
            case 'japanese':
                // Base estilo japonés - Low Poly
                width = 9;
                depth = 9;
                height = 1.2;
                // Usar BoxGeometry con menos detalle para low poly
                geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
                material = new THREE.MeshPhongMaterial({
                    color: 0x4A0D00, // Marrón rojizo oscuro
                    shininess: 20,
                    map: this.createWoodTexture('japanese')
                });
                break;
                
            case 'futuristic':
                // Base futurista con iluminación
                geometry = new THREE.CylinderGeometry(width/2, width/2, height, 32);
                material = new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    shininess: 80,
                    emissive: 0x003366,
                    emissiveIntensity: 0.5
                });
                break;
                
            case 'ancient':
                // Base antigua
                geometry = new THREE.BoxGeometry(width * 1.2, height * 1.5, depth * 1.2);
                material = new THREE.MeshPhongMaterial({
                    color: 0xD4CBA3,
                    shininess: 5
                });
                break;
                
            case 'crystal':
                // Base de cristal
                geometry = new THREE.CylinderGeometry(width/2, width/2 * 1.1, height, 16);
                material = new THREE.MeshPhysicalMaterial({
                    color: 0xAACCEE,
                    metalness: 0.1,
                    roughness: 0.3,
                    transparent: true,
                    opacity: 0.6,
                    clearcoat: 0.8
                });
                break;
                
            default:
                // Base clásica
                geometry = new THREE.BoxGeometry(width, height, depth);
                material = new THREE.MeshPhongMaterial({
                    color: 0x654321,
                    shininess: 5
                });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        
        // Añadir sombras
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    /**
     * Crea decoraciones para la torre según el tema
     */
    createDecorations() {
        switch (this.theme) {
            case 'japanese':
                this.createJapaneseDecorations();
                break;
                
            case 'futuristic':
                this.createFuturisticDecorations();
                break;
                
            case 'ancient':
                this.createAncientDecorations();
                break;
                
            case 'crystal':
                this.createCrystalDecorations();
                break;
                
            default:
                // Sin decoraciones para el tema clásico
                break;
        }
    }
    
    /**
     * Crea decoraciones para el tema japonés
     */
    createJapaneseDecorations() {
        // Cargar el modelo japonés predefinido
        if (typeof jtowermodel !== 'undefined' && jtowermodel !== null) {
            console.log('Usando modelo japonés predefinido para la torre', this.id);
            
            try {
                // Clonar el modelo para evitar problemas con múltiples torres
                const towerModel = jtowermodel.clone();
                
                // Posicionar el modelo en la ubicación de la torre
                towerModel.position.copy(this.position);
                
                // Ajustar escala si es necesario
                towerModel.scale.set(1, 1, 1);
                
                // Ajustar rotación si es necesario
                // towerModel.rotation.y = Math.PI; // Ejemplo: rotar 180 grados
                
                // Aplicar sombras a todos los componentes del modelo
                towerModel.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                console.log('Modelo japonés añadido exitosamente a la torre', this.id);
                
                // Añadir el modelo a las decoraciones
                this.decorations.push(towerModel);
            } catch (error) {
                console.error('Error al clonar el modelo japonés:', error);
                this.createFallbackJapaneseDecorations();
            }
        } else {
            console.warn(`El modelo jtowermodel no está disponible para la torre ${this.id}. Estado: ${jtowermodel === null ? 'null' : 'undefined'}`);
            this.createFallbackJapaneseDecorations();
        }
    }
    
    /**
     * Crea decoraciones japonesas de respaldo si el modelo 3D no está disponible
     */
    createFallbackJapaneseDecorations() {
        console.log('Creando decoraciones japonesas de respaldo para la torre', this.id);
        
        // Estructura de pisos de pagoda japonesa (low poly)
        const numPisos = 3; // Número de pisos de la pagoda
        const baseSize = 3.5; // Tamaño de la base del techo
        const roofHeight = 1.2; // Altura del techo
        
        // Material rojo característico de pagodas japonesas
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0xC02020, // Rojo brillante
            shininess: 20,
            specular: 0x222222
        });
        
        // Material para paredes (blanco/beige)
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0xF5EFE0,
            shininess: 10
        });
        
        // Crear pisos de la pagoda
        for (let i = 0; i < numPisos; i++) {
            // Posición vertical de este piso
            const posY = 4 + i * 2.5;
            const scale = 1 - (i * 0.25); // Cada piso es más pequeño que el anterior
            
            // Techo de pagoda - Usando menos segmentos para estilo low poly
            const roofGeometry = new THREE.ConeGeometry(baseSize * scale, roofHeight, 6);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.copy(this.position);
            roof.position.y = posY + 0.8; // Ajustar altura
            
            // Bordes del techo curvados (típicos de pagodas)
            const curveAmount = 0.3 * scale;
            
            // Aplicar curva a los vértices del techo (efecto de bordes elevados)
            const vertices = roof.geometry.attributes.position;
            for (let j = 0; j < vertices.count; j++) {
                const y = vertices.getY(j);
                if (y < 0) { // Solo afectar a los bordes inferiores
                    const x = vertices.getX(j);
                    const z = vertices.getZ(j);
                    const distFromCenter = Math.sqrt(x * x + z * z);
                    if (distFromCenter > baseSize * scale * 0.7) {
                        vertices.setY(j, y - curveAmount);
                    }
                }
            }
            vertices.needsUpdate = true;
            
            // Sección cúbica bajo el techo (habitación)
            if (i < numPisos - 1) { // No poner sección para el piso superior
                const wallSize = baseSize * scale * 0.7;
                const wallHeight = 0.8;
                const wallGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize, 1, 1, 1); // Low poly
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.copy(this.position);
                wall.position.y = posY - 0.4;
                
                this.decorations.push(wall);
            }
            
            this.decorations.push(roof);
        }
        
        // Añadir linterna japonesa 
        const lanternSize = 0.4;
        const lanternGeometry = new THREE.CylinderGeometry(lanternSize, lanternSize, lanternSize*2, 6, 1); // Low poly
        const lanternMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFF5E0,
            emissive: 0xFFCC77,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        
        const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
        lantern.position.copy(this.position);
        lantern.position.x += 1.5;
        lantern.position.z += 1.5;
        lantern.position.y = 1.5;
        
        this.decorations.push(lantern);
        
        console.log('Decoraciones japonesas de respaldo creadas para la torre', this.id);
    }
    
    /**
     * Crea decoraciones para el tema futurista
     */
    createFuturisticDecorations() {
        // Anillo flotante
        const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x00FFFF,
            emissive: 0x00AAFF,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(this.position);
        ring.position.y = 12 + 1; // Encima de la torre
        ring.rotation.x = Math.PI / 2; // Horizontal
        
        this.decorations.push(ring);
        
        // Luces/partículas aquí si se implementan
    }
    
    /**
     * Crea decoraciones para el tema antiguo
     */
    createAncientDecorations() {
        // Capitel de columna
        const capitalGeometry = new THREE.CylinderGeometry(1.2, 0.8, 0.8, 16);
        const capitalMaterial = new THREE.MeshPhongMaterial({
            color: 0xE0DFBD,
            shininess: 5
        });
        
        const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
        capital.position.copy(this.position);
        capital.position.y = 12 + 0.4; // Arriba de la torre
        
        this.decorations.push(capital);
    }
    
    /**
     * Crea decoraciones para el tema de cristal
     */
    createCrystalDecorations() {
        // Cristales pequeños flotantes
        for (let i = 0; i < 3; i++) {
            const crystalGeometry = new THREE.OctahedronGeometry(0.3);
            const crystalMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xFFFFFF,
                metalness: 0.1,
                roughness: 0.2,
                transparent: true,
                opacity: 0.7,
                clearcoat: 1
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.copy(this.position);
            crystal.position.x += Math.cos(i * Math.PI * 2 / 3) * 1.2;
            crystal.position.z += Math.sin(i * Math.PI * 2 / 3) * 1.2;
            crystal.position.y = 6 + i * 2; // Distribuidos en altura
            
            this.decorations.push(crystal);
        }
    }
    
    /**
     * Crea una textura de madera procedural
     * @param {string} style - Estilo de la textura de madera ('default', 'japanese', etc.)
     * @return {THREE.Texture} - Textura de madera
     */
    createWoodTexture(style = 'default') {
        // En un entorno real, cargaríamos una textura desde un archivo
        // Aquí creamos una textura básica para simulación
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        if (style === 'japanese') {
            // Textura de madera roja para estilo japonés
            context.fillStyle = '#8B2500'; // Base roja oscura
            context.fillRect(0, 0, 128, 128);
            
            // Añadir vetas de madera más marcadas y regulares (estilo japonés)
            const numVetas = 7; // Menos vetas pero más pronunciadas
            const spacing = canvas.height / numVetas;
            
            for (let i = 0; i < numVetas; i++) {
                context.beginPath();
                context.strokeStyle = `rgba(60, 20, 5, 0.3)`;
                context.lineWidth = 3; // Líneas más gruesas
                
                const y = i * spacing + spacing/2;
                context.moveTo(0, y);
                
                // Líneas más rectas, con menos variación (más geométricas)
                for (let x = 0; x < 128; x += 32) {
                    context.lineTo(x, y + Math.sin(x * 0.05) * 2);
                }
                
                context.stroke();
            }
            
            // Añadir patrón de paneles tradicionales
            for (let i = 0; i < 2; i++) {
                context.beginPath();
                context.strokeStyle = 'rgba(30, 10, 5, 0.5)';
                context.lineWidth = 2;
                const x = 42 + i * 42;
                context.moveTo(x, 0);
                context.lineTo(x, 128);
                context.stroke();
            }
        } else {
            // Textura de madera estándar
            context.fillStyle = '#8B4513';
            context.fillRect(0, 0, 128, 128);
            
            // Añadir vetas de madera
            for (let i = 0; i < 10; i++) {
                context.beginPath();
                context.strokeStyle = `rgba(80, 40, 10, ${Math.random() * 0.3 + 0.1})`;
                context.lineWidth = Math.random() * 4 + 1;
                
                const y = Math.random() * 128;
                context.moveTo(0, y);
                
                // Línea ondulada
                for (let x = 0; x < 128; x += 10) {
                    context.lineTo(x, y + Math.sin(x * 0.1) * 5);
                }
                
                context.stroke();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 3);
        
        return texture;
    }
    
    /**
     * Crea geometría para una torre futurista con secciones
     * @param {number} height - Altura total
     * @param {number} radius - Radio base
     * @return {THREE.BufferGeometry} - Geometría para la torre
     */
    createFuturisticTowerGeometry(height, radius) {
        const geometry = new THREE.CylinderGeometry(radius * 0.7, radius, height, 16);
        
        // Aquí se podría personalizar la geometría para hacerla más futurista
        // Por ejemplo, añadiendo extrusiones o modificando vértices
        
        return geometry;
    }
    
    /**
     * Crea geometría para una columna antigua
     * @param {number} height - Altura total
     * @param {number} radius - Radio base
     * @return {THREE.BufferGeometry} - Geometría para la torre
     */
    createAncientColumnGeometry(height, radius) {
        // Geometría base
        const geometry = new THREE.CylinderGeometry(radius * 0.8, radius, height, 16);
        
        // Aquí se podría personalizar la geometría para hacerla como columna antigua
        // con estrías y otros detalles
        
        return geometry;
    }

    /**
     * Añade un disco a la torre
     * @param {Disk} disk - Disco a añadir
     */
    addDisk(disk) {
        // Calcular la posición Y del disco
        const diskHeight = 0.8;
        const y = calculateDiskY(this.disks.length, diskHeight, this.baseMesh.geometry.parameters.height);
        
        // Actualizar posición del disco
        disk.updatePosition(
            this.position.x,
            y,
            this.position.z,
            true // Animar
        );
        
        // Actualizar referencias
        disk.setTower(this);
        this.disks.push(disk);
    }

    /**
     * Quita el disco superior de la torre
     * @return {Disk|null} - Disco quitado o null si no hay discos
     */
    removeDisk() {
        if (this.disks.length === 0) {
            return null;
        }
        
        const disk = this.disks.pop();
        disk.setTower(null);
        return disk;
    }

    /**
     * Obtiene el disco superior de la torre sin quitarlo
     * @return {Disk|null} - Disco superior o null si no hay discos
     */
    getTopDisk() {
        if (this.disks.length === 0) {
            return null;
        }
        
        return this.disks[this.disks.length - 1];
    }

    /**
     * Verifica si se puede añadir un disco a la torre
     * @param {Disk} disk - Disco a verificar
     * @return {boolean} - true si se puede añadir
     */
    canAddDisk(disk) {
        if (this.disks.length === 0) {
            return true;
        }
        
        const topDisk = this.getTopDisk();
        return disk.size < topDisk.size;
    }

    /**
     * Resalta la torre para indicar que es un objetivo válido
     * @param {boolean} highlight - true para resaltar, false para quitar resaltado
     */
    highlight(highlight) {
        if (highlight) {
            // Color según el tema
            let emissiveColor;
            switch (this.theme) {
                case 'japanese':
                    emissiveColor = 0x993333;
                    break;
                case 'futuristic':
                    emissiveColor = 0x00AAFF;
                    break;
                case 'ancient':
                    emissiveColor = 0xCCAA66;
                    break;
                case 'crystal':
                    emissiveColor = 0x88CCFF;
                    break;
                default:
                    emissiveColor = 0x222222;
                    break;
            }
            
            this.baseMesh.material.emissive.setHex(emissiveColor);
            // Animar decoraciones si hay
            this.animateDecorations(true);
        } else {
            this.baseMesh.material.emissive.setHex(0x000000);
            this.animateDecorations(false);
        }
    }
    
    /**
     * Anima las decoraciones al resaltar/deseleccionar
     * @param {boolean} active - true para animar, false para detener
     */
    animateDecorations(active) {
        // La animación real se implementaría en el loop de animación
        // Aquí solo marcamos el estado para animación
        this.decorations.forEach(decoration => {
            decoration.userData.animating = active;
        });
    }

    /**
     * Verifica si todos los discos están en orden correcto
     * @param {number} totalDisks - Número total de discos en el juego
     * @return {boolean} - true si todos los discos están en orden correcto
     */
    isComplete(totalDisks) {
        if (this.disks.length !== totalDisks) {
            return false;
        }
        
        for (let i = 0; i < totalDisks; i++) {
            if (this.disks[i].size !== totalDisks - i) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Actualiza las animaciones de las decoraciones
     * @param {number} time - Tiempo actual en milisegundos
     */
    update(time) {
        this.decorations.forEach(decoration => {
            if (decoration.userData.animating) {
                // Animaciones según el tema
                switch (this.theme) {
                    case 'japanese':
                        // Oscilación suave
                        decoration.rotation.y = Math.sin(time * 0.001) * 0.1;
                        break;
                        
                    case 'futuristic':
                        // Rotación constante
                        decoration.rotation.z += 0.01;
                        break;
                        
                    case 'ancient':
                        // Pulsación suave
                        decoration.scale.set(
                            1 + Math.sin(time * 0.002) * 0.05,
                            1 + Math.sin(time * 0.002) * 0.05,
                            1 + Math.sin(time * 0.002) * 0.05
                        );
                        break;
                        
                    case 'crystal':
                        // Flotación y rotación
                        decoration.position.y += Math.sin(time * 0.002 + decoration.position.x) * 0.01;
                        decoration.rotation.y += 0.01;
                        decoration.rotation.z += 0.005;
                        break;
                }
            }
        });
    }
    
    /**
     * Cambia el tema de la torre
     * @param {string} newTheme - Nuevo tema
     */
    changeTheme(newTheme) {
        console.log(`Torre ${this.id}: Cambiando tema de '${this.theme}' a '${newTheme}'`);
        
        // Guardar las referencias a los objetos actuales
        const oldMesh = this.mesh;
        const oldBase = this.baseMesh;
        const oldDecorations = [...this.decorations];
        
        // Limpiar decoraciones actuales del array (para no duplicarlas)
        this.decorations = [];
        
        // Actualizar tema
        this.theme = newTheme;
        
        // Crear nuevos objetos con el nuevo tema
        this.baseMesh = this.createBaseMesh();
        this.mesh = this.createMesh();
        
        // Crear nuevas decoraciones según el tema
        this.createDecorations();
        
        console.log(`Torre ${this.id}: Tema cambiado. ${this.decorations.length} nuevas decoraciones creadas.`);
        
        // Devolver los cambios para que Game.js pueda actualizar la escena
        return {
            newTowerMesh: this.mesh,
            newBaseMesh: this.baseMesh,
            decorations: this.decorations,
            oldTowerMesh: oldMesh,
            oldBaseMesh: oldBase,
            oldDecorations: oldDecorations
        };
    }
} 