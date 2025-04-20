/**
 * Clase que representa un disco en el juego Torre de Hanoi
 */
class Disk {
    /**
     * Constructor de la clase Disk
     * @param {number} size - Tamaño del disco (1 es el más pequeño)
     * @param {number} totalDisks - Número total de discos en el juego
     * @param {number} index - Índice del disco (para determinar su color)
     * @param {string} theme - Tema del disco (default, metallic, candy, neon, gem)
     */
    constructor(size, totalDisks, index, theme = 'default') {
        this.size = size;
        this.totalDisks = totalDisks;
        this.index = index;
        this.theme = theme;
        this.shape = 'torus'; // Forma predeterminada (torus, ring, cylinder, star, custom)
        this.mesh = this.createMesh();
        this.isSelected = false;
        this.isDragging = false;
        this.currentTower = null;
        this.originalPosition = new THREE.Vector3();
    }

    /**
     * Crea el mesh 3D del disco
     * @return {THREE.Mesh} - Mesh del disco
     */
    createMesh() {
        // Calcular dimensiones del disco
        const maxRadius = 5;
        const minRadius = 1.5;
        const radius = this.calculateRadius(maxRadius, minRadius);
        const height = 0.8;
        
        // Crear geometría según la forma seleccionada
        let geometry;
        
        switch (this.shape) {
            case 'ring':
                // Anillo plano
                geometry = new THREE.RingGeometry(radius * 0.6, radius, 32);
                break;
                
            case 'cylinder':
                // Cilindro clásico
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                break;
                
            case 'star':
                // Estrella
                geometry = this.createStarGeometry(radius, height);
                break;
                
            case 'custom':
                // Forma personalizada según el tema
                if (this.theme === 'gem') {
                    geometry = new THREE.OctahedronGeometry(radius * 0.6, 1);
                } else if (this.theme === 'neon') {
                    geometry = new THREE.TorusKnotGeometry(radius * 0.5, radius * 0.15, 64, 8);
                } else {
                    geometry = new THREE.TorusGeometry(radius * 0.7, height / 2, 16, 32);
                }
                break;
                
            case 'torus':
            default:
                // Torus (forma de dona)
                const tubeRadius = height / 2;
                geometry = new THREE.TorusGeometry(
                    radius - tubeRadius,  // Radio principal
                    tubeRadius,           // Radio del tubo
                    16,                   // Segmentos tubulares
                    32                    // Segmentos radiales
                );
                break;
        }
        
        // Crear material según el tema
        let material;
        
        switch (this.theme) {
            case 'metallic':
                material = new THREE.MeshStandardMaterial({
                    color: this.getColorByIndex(),
                    metalness: 0.8,
                    roughness: 0.2,
                    envMapIntensity: 1.0
                });
                break;
                
            case 'candy':
                material = new THREE.MeshToonMaterial({
                    color: this.getColorByIndex(),
                    shininess: 0
                });
                break;
                
            case 'neon':
                material = new THREE.MeshPhongMaterial({
                    color: this.getColorByIndex(),
                    shininess: 100,
                    specular: 0xffffff,
                    emissive: this.getColorByIndex(),
                    emissiveIntensity: 0.4
                });
                break;
                
            case 'gem':
                material = new THREE.MeshPhysicalMaterial({
                    color: this.getColorByIndex(),
                    metalness: 0.0,
                    roughness: 0.0,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    reflectivity: 1.0,
                    transparent: true,
                    opacity: 0.8,
                    transmission: 0.5
                });
                break;
                
            default:
                material = new THREE.MeshPhongMaterial({
                    color: this.getColorByIndex(),
                    shininess: 30,
                    specular: 0x111111
                });
                break;
        }

        // Crear mesh y rotarlo para orientación correcta
        const mesh = new THREE.Mesh(geometry, material);
        
        // Ajustar orientación según la forma
        if (this.shape === 'ring') {
            mesh.rotation.x = -Math.PI / 2; // Plano horizontal
        } else if (this.shape !== 'cylinder') {
            mesh.rotation.x = Math.PI / 2; // Para torus, star, custom
        }
        
        // Añadir sombras
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Hacer el disco interactivo
        mesh.userData.diskObject = this;
        
        return mesh;
    }
    
    /**
     * Crea una geometría de estrella
     * @param {number} radius - Radio de la estrella
     * @param {number} height - Altura de la estrella
     * @return {THREE.BufferGeometry} - Geometría de la estrella
     */
    createStarGeometry(radius, height) {
        const points = [];
        const numPoints = 10; // 5 puntas
        const innerRadius = radius * 0.6;
        
        // Crear puntos para la estrella
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI * 2) / numPoints;
            const r = i % 2 === 0 ? radius : innerRadius;
            points.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
        }
        
        // Cerrar la forma
        points.push(points[0].clone());
        
        // Crear extrusión
        const shape = new THREE.Shape(points);
        const extrudeSettings = {
            steps: 1,
            depth: height,
            bevelEnabled: false
        };
        
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    /**
     * Calcula el radio del disco según su tamaño
     * @param {number} maxRadius - Radio máximo para el disco más grande
     * @param {number} minRadius - Radio mínimo para el disco más pequeño
     * @return {number} - Radio calculado
     */
    calculateRadius(maxRadius, minRadius) {
        const sizeRatio = this.size / this.totalDisks;
        return minRadius + sizeRatio * (maxRadius - minRadius);
    }
    
    /**
     * Obtiene el color del disco según el índice y el tema
     * @return {number} - Color en formato hexadecimal
     */
    getColorByIndex() {
        // Colores específicos por tema
        const colors = {
            default: DISK_COLORS,
            metallic: [0xC0C0C0, 0xFFD700, 0xB87333, 0xE5E4E2, 0xCD7F32, 0x4682B4, 0x9ACD32, 0x8B0000],
            candy: [0xFF77FF, 0x77FFFF, 0xFFFF77, 0x77FF77, 0xFF7777, 0x7777FF, 0xFFAA77, 0xBB77FF],
            neon: [0xFF00FF, 0x00FFFF, 0xFFFF00, 0x00FF00, 0xFF0000, 0x0000FF, 0xFF7700, 0x7700FF],
            gem: [0xFF0088, 0x00FFBB, 0xCCFF00, 0x00BBFF, 0xEE2200, 0x3300FF, 0xFF8800, 0xBB00FF]
        };
        
        // Usar colores del tema o los predeterminados
        const themeColors = colors[this.theme] || colors.default;
        return themeColors[this.index % themeColors.length];
    }

    /**
     * Selecciona el disco
     */
    select() {
        if (!this.isSelected) {
            this.isSelected = true;
            this.mesh.material.emissive = this.mesh.material.emissive || new THREE.Color();
            this.mesh.material.emissive.setHex(0x555555);
        }
    }

    /**
     * Deselecciona el disco
     */
    deselect() {
        if (this.isSelected) {
            this.isSelected = false;
            this.mesh.material.emissive = this.mesh.material.emissive || new THREE.Color();
            this.mesh.material.emissive.setHex(0x000000);
        }
    }

    /**
     * Inicia el arrastre del disco
     */
    startDrag() {
        this.isDragging = true;
        this.originalPosition.copy(this.mesh.position);
        this.select();
    }

    /**
     * Finaliza el arrastre del disco
     */
    endDrag() {
        this.isDragging = false;
    }

    /**
     * Actualiza la posición del disco
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} z - Posición Z
     * @param {boolean} animate - Si la actualización debe ser animada
     */
    updatePosition(x, y, z, animate = false) {
        if (animate) {
            // Animación simple
            const duration = 300; // ms
            const startTime = Date.now();
            const startPos = {
                x: this.mesh.position.x,
                y: this.mesh.position.y,
                z: this.mesh.position.z
            };
            const endPos = { x, y, z };

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Interpolación lineal
                this.mesh.position.x = startPos.x + (endPos.x - startPos.x) * progress;
                this.mesh.position.y = startPos.y + (endPos.y - startPos.y) * progress;
                this.mesh.position.z = startPos.z + (endPos.z - startPos.z) * progress;
                
                // Animación extra según tema - SOLO SI NO ESTÁ ARRASTRANDO
                if ((this.theme === 'neon' || this.theme === 'gem') && !this.isDragging) {
                    this.mesh.rotation.y += 0.1 * progress;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        } else {
            // Solo actualizar posición, preservar rotación
            this.mesh.position.set(x, y, z);
        }
    }

    /**
     * Actualiza la torre a la que pertenece el disco
     * @param {Tower} tower - Torre a la que pertenece el disco
     */
    setTower(tower) {
        this.currentTower = tower;
    }
    
    /**
     * Cambia el tema del disco
     * @param {string} newTheme - Nuevo tema
     * @param {string} newShape - Nueva forma
     */
    changeTheme(newTheme, newShape = null) {
        this.theme = newTheme;
        if (newShape) {
            this.shape = newShape;
        }
        
        // Guardar posición y torre actuales
        const currentPosition = this.mesh.position.clone();
        const currentTower = this.currentTower;
        
        // Crear nuevo mesh con el tema actualizado
        const oldMesh = this.mesh;
        this.mesh = this.createMesh();
        
        // Restaurar posición y relaciones
        this.mesh.position.copy(currentPosition);
        this.currentTower = currentTower;
        
        // Reemplazar en la escena (esto debe ser manejado por Game.js)
        return {
            newMesh: this.mesh,
            oldMesh: oldMesh
        };
    }
} 