import * as THREE from 'three';
import { Tower } from './Tower.js';
import { Disk } from './Disk.js';
import { loadJapaneseTowerModel, jtowermodel } from './models.js'; // Importar función y variable
import { formatTime, calculateDiskY, calculateMinMoves, isMobileDevice, DISK_COLORS } from './utils.js'; // Importar utilidades

/**
 * Clase principal que maneja el juego Torre de Hanoi
 */
export class Game { // Exportar la clase
    /**
     * Constructor de la clase Game
     * @param {HTMLElement} container - Contenedor donde se renderizará el juego
     */
    constructor(container) {
        this.container = container;
        this.numDisks = 4; // Valor por defecto
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.solutionInterval = null;
        this.selectedDisk = null;
        this.draggingDisk = null;
        this.towers = [];
        this.disks = [];
        this.isGameOver = false;
        this.gameMode = 'normal'; // 'normal', 'contrarreloj', 'desafio', 'puzzle'
        this.timeLimit = 0; // Para modo contrarreloj
        this.bestScore = this.loadBestScore();
        this.currentTheme = this.loadThemeSettings() || {
            tower: 'default',
            disk: 'default',
            diskShape: 'torus'
        };
        
        // Tiempo para animaciones
        this.clock = new THREE.Clock();
        
        // Plano para detectar colisiones durante el arrastre
        this.dragPlane = null;
        
        // Inicialización de Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Referencias a elementos del DOM
        this.movesCounter = document.querySelector('#moves-counter span');
        this.timerDisplay = document.querySelector('#timer span');
        this.resetButton = document.querySelector('#reset-btn');
        this.difficultySelect = document.querySelector('#difficulty-select');
        this.gameModeSelect = document.querySelector('#game-mode-select');
        this.gameStatus = document.querySelector('#game-status');
        this.solutionButton = document.querySelector('#solution-btn');
        this.themeButton = document.querySelector('#theme-btn');
        
        // Audio
        this.moveSound = null;
        this.victorySound = null;
        this.errorSound = null;
        this.timeTick = null;
        
        // Inicializar el juego
        this.init();
    }
    
    /**
     * Inicializa el juego
     */
    init() {
        // Cargar modelos 3D primero si están disponibles
        this.loadModels().then(() => {
            this.setupThreeJs();
            this.setupLights();
            this.setupCamera();
            this.setupRaycaster();
            this.setupDragPlane();
            this.createTowers();
            this.setupControls();
            this.loadSounds();
            this.resetGame();
            this.animate();
        });
    }
    
    /**
     * Carga los modelos 3D necesarios para el juego
     * @return {Promise} - Promise que se resuelve cuando todos los modelos están cargados
     */
    loadModels() {
        // Si la función de carga de modelos existe, la llamamos
        if (typeof loadJapaneseTowerModel === 'function') {
            console.log('Cargando modelos 3D...');
            return loadJapaneseTowerModel().catch(error => {
                console.error('Error al cargar modelos:', error);
                // Continuar aunque falle la carga
                return Promise.resolve();
            });
        } else {
            console.log('Función de carga de modelos no disponible');
            // Si no existe la función, continuamos con inicialización
            return Promise.resolve();
        }
    }
    
    /**
     * Configura el entorno de Three.js
     */
    setupThreeJs() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Manejar redimensionamiento
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    /**
     * Configura las luces de la escena
     */
    setupLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Luz direccional (simula sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        
        // Configuración de sombras
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        
        this.scene.add(directionalLight);
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);
    }
    
    /**
     * Configura la cámara
     */
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        
        // Posicionamos la cámara para ver las tres torres
        this.camera.position.set(0, 15, 25);
        this.camera.lookAt(0, 5, 0);
    }
    
    /**
     * Configura el raycaster para detectar clics/toques
     */
    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Eventos de ratón/touch
        const canvas = this.renderer.domElement;
        
        // Eventos de mouse
        canvas.addEventListener('mousedown', (event) => this.onMouseDown(event), false);
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        canvas.addEventListener('mouseup', (event) => this.onMouseUp(event), false);
        
        // Eventos táctiles para dispositivos móviles
        if (isMobileDevice()) {
            canvas.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.onTouchStart(event);
            }, false);
            
            canvas.addEventListener('touchmove', (event) => {
                event.preventDefault();
                this.onTouchMove(event);
            }, false);
            
            canvas.addEventListener('touchend', (event) => {
                event.preventDefault();
                this.onTouchEnd(event);
            }, false);
        }
    }
    
    /**
     * Configura el plano de arrastre
     */
    setupDragPlane() {
        // Crear un plano invisible para las intersecciones durante el arrastre
        const planeGeometry = new THREE.PlaneGeometry(50, 50);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            visible: false, 
            side: THREE.DoubleSide 
        });
        this.dragPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.dragPlane.rotation.x = Math.PI / 2; // Plano horizontal
        this.dragPlane.position.y = 6; // Altura para el arrastre
        this.scene.add(this.dragPlane);
    }
    
    /**
     * Carga los efectos de sonido
     */
    loadSounds() {
        try {
            this.moveSound = new Audio();
            this.victorySound = new Audio();
            this.errorSound = new Audio();
            this.timeTick = new Audio();
            
            // Intentar cargar sonidos, pero continuar si falla
            this.moveSound.src = 'assets/sounds/move.mp3';
            this.victorySound.src = 'assets/sounds/victory.mp3';
            this.errorSound.src = 'assets/sounds/error.mp3';
            this.timeTick.src = 'assets/sounds/tick.mp3';
            
            // Manejar errores en la carga
            this.moveSound.addEventListener('error', () => console.log('Error al cargar sonido de movimiento'));
            this.victorySound.addEventListener('error', () => console.log('Error al cargar sonido de victoria'));
            this.errorSound.addEventListener('error', () => console.log('Error al cargar sonido de error'));
            this.timeTick.addEventListener('error', () => console.log('Error al cargar sonido de tick'));
        } catch (e) {
            console.error('Error al inicializar sonidos:', e);
            // Crear objetos falsos para evitar errores
            this.moveSound = { play: () => {}, currentTime: 0 };
            this.victorySound = { play: () => {}, currentTime: 0 };
            this.errorSound = { play: () => {}, currentTime: 0 };
            this.timeTick = { play: () => {}, currentTime: 0 };
        }
    }
    
    /**
     * Crea las tres torres del juego
     */
    createTowers() {
        const towerPositions = [
            new THREE.Vector3(-10, 0, 0), // Torre izquierda
            new THREE.Vector3(0, 0, 0),   // Torre central
            new THREE.Vector3(10, 0, 0)   // Torre derecha
        ];
        
        for (let i = 0; i < 3; i++) {
            const tower = new Tower(i, towerPositions[i], this.currentTheme.tower);
            this.towers.push(tower);
            
            // Añadir elementos de la torre a la escena
            this.scene.add(tower.mesh);
            this.scene.add(tower.baseMesh);
            
            // Añadir decoraciones a la escena
            tower.decorations.forEach(decoration => {
                this.scene.add(decoration);
            });
        }
    }
    
    /**
     * Configura los controles de la interfaz
     */
    setupControls() {
        // Botón de reinicio
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Selector de dificultad
        this.difficultySelect.addEventListener('change', () => {
            this.numDisks = parseInt(this.difficultySelect.value);
            this.resetGame();
        });
        
        // Selector de modo de juego
        if (this.gameModeSelect) {
            this.gameModeSelect.addEventListener('change', () => {
                this.gameMode = this.gameModeSelect.value;
                this.resetGame();
            });
        }
        
        // Botón de solución
        if (this.solutionButton) {
            this.solutionButton.addEventListener('click', () => this.showSolution());
        }
        
        // Botón de temas
        if (this.themeButton) {
            this.themeButton.addEventListener('click', () => this.openThemeSelector());
        }
    }
    
    /**
     * Resetea el juego al estado inicial
     */
    resetGame() {
        // Reiniciar contadores
        this.moves = 0;
        this.timer = 0;
        this.isGameOver = false;
        this.updateUI();
        
        // Limpiar temporizador si está activo
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Limpiar discos existentes
        this.clearDisks();
        
        // Configurar según el modo de juego
        this.setupGameMode();
        
        // Crear nuevos discos
        this.createDisks();
        
        // Actualizar estado del juego
        this.gameStatus.textContent = "¡Mueve los discos a la torre derecha!";
        this.gameStatus.classList.remove('victory-message');
    }
    
    /**
     * Configura el juego según el modo seleccionado
     */
    setupGameMode() {
        switch (this.gameMode) {
            case 'contrarreloj':
                // Establecer límite de tiempo según dificultad
                this.timeLimit = this.numDisks * 20; // 20 segundos por disco
                this.timer = this.timeLimit;
                this.startCountdown();
                break;
                
            case 'desafio':
                // En modo desafío, vamos a reorganizar las torres
                this.rearrangeTowers();
                break;
                
            case 'puzzle':
                // En modo puzzle, se configura la distribución inicial de discos
                // (se implementará en createDisks())
                break;
                
            default: // modo normal
                break;
        }
    }
    
    /**
     * Inicia la cuenta atrás para el modo contrarreloj
     */
    startCountdown() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateUI();
            
            // Reproducir sonido de tick en los últimos 10 segundos
            if (this.timer <= 10 && this.timer > 0) {
                this.timeTick.play();
            }
            
            // Verificar si se acabó el tiempo
            if (this.timer <= 0) {
                this.timer = 0;
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.gameOver(false); // Perdió por tiempo
            }
        }, 1000);
    }
    
    /**
     * Reorganiza las torres para el modo desafío
     */
    rearrangeTowers() {
        // Cambiar posiciones de las torres aleatoriamente
        const positions = [
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0)
        ];
        
        // Mezclar las posiciones
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Aplicar nuevas posiciones
        for (let i = 0; i < this.towers.length; i++) {
            const tower = this.towers[i];
            tower.position.copy(positions[i]);
            tower.mesh.position.copy(positions[i]);
            tower.mesh.position.y += 6; // Altura de la torre/2
            tower.baseMesh.position.copy(positions[i]);
        }
    }
    
    /**
     * Elimina todos los discos existentes
     */
    clearDisks() {
        // Eliminar discos de las torres
        this.towers.forEach(tower => {
            tower.disks = [];
        });
        
        // Eliminar meshes de la escena
        for (const disk of this.disks) {
            this.scene.remove(disk.mesh);
        }
        
        this.disks = [];
        this.selectedDisk = null;
        this.draggingDisk = null;
    }
    
    /**
     * Crea los discos según la dificultad seleccionada y el modo de juego
     */
    createDisks() {
        // Crear discos
        for (let i = 0; i < this.numDisks; i++) {
            const size = this.numDisks - i;
            const disk = new Disk(size, this.numDisks, i, this.currentTheme.disk);
            disk.shape = this.currentTheme.diskShape;
            this.disks.push(disk);
            this.scene.add(disk.mesh);
        }
        
        if (this.gameMode === 'puzzle') {
            // Distribuir discos aleatoriamente entre las torres para el modo puzzle
            // Asegurando que la configuración sea válida y resoluble
            this.createPuzzleConfiguration();
        } else {
            // Modo normal, contrarreloj o desafío: todos los discos en la primera torre
            for (let i = 0; i < this.disks.length; i++) {
                this.towers[0].addDisk(this.disks[i]);
            }
        }
    }
    
    /**
     * Crea una configuración inicial para el modo puzzle
     */
    createPuzzleConfiguration() {
        // Distribuir los discos entre las torres
        // Asegurar que cada torre cumple la regla: discos más grandes abajo
        let availableDisks = [...this.disks];
        
        // Ordenar discos por tamaño (mayor a menor)
        availableDisks.sort((a, b) => b.size - a.size);
        
        // Distribuir aleatoriamente entre las torres
        while (availableDisks.length > 0) {
            const towerIndex = Math.floor(Math.random() * 3);
            const tower = this.towers[towerIndex];
            
            // Obtener disco más grande disponible que pueda ir en esta torre
            let validDisks = availableDisks.filter(disk => 
                tower.disks.length === 0 || disk.size < tower.getTopDisk().size
            );
            
            if (validDisks.length > 0) {
                // Tomar un disco aleatorio de entre los válidos
                const diskIndex = Math.floor(Math.random() * validDisks.length);
                const selectedDisk = validDisks[diskIndex];
                
                // Quitar disco de disponibles
                availableDisks = availableDisks.filter(disk => disk !== selectedDisk);
                
                // Añadir a la torre
                tower.addDisk(selectedDisk);
            }
        }
    }
    
    /**
     * Maneja el evento mousedown
     * @param {MouseEvent} event - Evento mousedown
     */
    onMouseDown(event) {
        if (this.isGameOver) return;
        
        // Actualizar coordenadas del mouse
        this.updateMouseCoordinates(event);
        
        // Intentar seleccionar un disco
        this.trySelectDisk();
    }
    
    /**
     * Maneja el evento mousemove
     * @param {MouseEvent} event - Evento mousemove
     */
    onMouseMove(event) {
        if (this.isGameOver) return;
        
        // Actualizar coordenadas del mouse
        this.updateMouseCoordinates(event);
        
        // Si hay un disco seleccionado, seguir el mouse
        this.dragSelectedDisk();
    }
    
    /**
     * Maneja el evento mouseup
     * @param {MouseEvent} event - Evento mouseup
     */
    onMouseUp(event) {
        if (this.isGameOver) return;
        
        // Actualizar coordenadas del mouse
        this.updateMouseCoordinates(event);
        
        // Soltar el disco en una torre
        this.dropDisk();
    }
    
    /**
     * Maneja el evento touchstart
     * @param {TouchEvent} event - Evento touchstart
     */
    onTouchStart(event) {
        if (this.isGameOver) return;
        
        // Usar el primer toque
        if (event.touches.length > 0) {
            this.updateTouchCoordinates(event.touches[0]);
            this.trySelectDisk();
        }
    }
    
    /**
     * Maneja el evento touchmove
     * @param {TouchEvent} event - Evento touchmove
     */
    onTouchMove(event) {
        if (this.isGameOver) return;
        
        // Usar el primer toque
        if (event.touches.length > 0) {
            this.updateTouchCoordinates(event.touches[0]);
            this.dragSelectedDisk();
        }
    }
    
    /**
     * Maneja el evento touchend
     * @param {TouchEvent} event - Evento touchend
     */
    onTouchEnd(event) {
        if (this.isGameOver) return;
        
        // Soltar el disco
        this.dropDisk();
    }
    
    /**
     * Actualiza las coordenadas del mouse desde un evento MouseEvent
     * @param {MouseEvent} event - Evento de mouse
     */
    updateMouseCoordinates(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    /**
     * Actualiza las coordenadas del mouse desde un evento Touch
     * @param {Touch} touch - Punto de toque
     */
    updateTouchCoordinates(touch) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    /**
     * Intenta seleccionar un disco para arrastrar
     */
    trySelectDisk() {
        // Si ya hay un disco arrastrándose, ignorar
        if (this.draggingDisk) return;
        
        // Iniciar temporizador al interactuar por primera vez
        if (!this.timerInterval && this.gameMode !== 'contrarreloj') {
            this.startTimer();
        }
        
        // Detectar discos en el punto
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Recopilar discos disponibles (solo los superiores)
        const interactiveDisks = [];
        this.towers.forEach(tower => {
            const topDisk = tower.getTopDisk();
            if (topDisk) {
                interactiveDisks.push(topDisk.mesh);
            }
        });
        
        // Verificar intersecciones
        const intersects = this.raycaster.intersectObjects(interactiveDisks);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const disk = object.userData.diskObject || this.findDiskByMesh(object);
            
            if (disk) {
                this.draggingDisk = disk;
                disk.startDrag();
            }
        }
    }
    
    /**
     * Arrastra el disco seleccionado siguiendo el mouse
     */
    dragSelectedDisk() {
        if (!this.draggingDisk) return;
        
        // Calcular posición 3D para el disco
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Intersectar con el plano de arrastre
        const intersects = this.raycaster.intersectObject(this.dragPlane);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Actualizar posición del disco centrado en el cursor
            this.draggingDisk.updatePosition(
                point.x,
                this.draggingDisk.originalPosition.y + 2, // Elevarlo un poco para visibilidad
                point.z,
                false
            );
            
            // Asegurar que la rotación es correcta según la forma (mantener orientación original)
            if (this.draggingDisk.shape === 'ring') {
                this.draggingDisk.mesh.rotation.x = -Math.PI / 2; // Plano horizontal
            } else if (this.draggingDisk.shape !== 'cylinder') {
                this.draggingDisk.mesh.rotation.x = Math.PI / 2; // Para torus, star, custom
            }
            
            // Resaltar torres válidas mientras se arrastra
            this.highlightValidTowersForDragging();
        }
    }
    
    /**
     * Resalta las torres válidas durante el arrastre
     */
    highlightValidTowersForDragging() {
        if (!this.draggingDisk) return;
        
        this.towers.forEach(tower => {
            if (tower !== this.draggingDisk.currentTower && tower.canAddDisk(this.draggingDisk)) {
                tower.highlight(true);
            } else {
                tower.highlight(false);
            }
        });
    }
    
    /**
     * Suelta el disco arrastrado en una torre
     */
    dropDisk() {
        if (!this.draggingDisk) return;
        
        // Encontrar la torre más cercana
        const closestTower = this.findClosestTower(this.draggingDisk.mesh.position);
        
        if (closestTower) {
            // Verificar si el movimiento es válido
            if (closestTower !== this.draggingDisk.currentTower && 
                closestTower.canAddDisk(this.draggingDisk)) {
                
                // Quitar disco de su torre actual
                const sourceTower = this.draggingDisk.currentTower;
                sourceTower.removeDisk();
                
                // Añadir disco a la nueva torre
                closestTower.addDisk(this.draggingDisk);
                
                // Incrementar contador de movimientos
                this.moves++;
                this.updateUI();
                
                // Reproducir sonido
                this.playMoveSound();
                
                // Verificar victoria
                this.checkWinCondition();
            } else {
                // Movimiento inválido, regresar a posición original
                const sourceTower = this.draggingDisk.currentTower;
                this.draggingDisk.updatePosition(
                    sourceTower.position.x,
                    this.draggingDisk.originalPosition.y,
                    sourceTower.position.z,
                    true
                );
                
                // Reproducir sonido de error
                this.playErrorSound();
            }
        } else {
            // No hay torre cercana, volver a la posición original
            const sourceTower = this.draggingDisk.currentTower;
            this.draggingDisk.updatePosition(
                sourceTower.position.x,
                this.draggingDisk.originalPosition.y,
                sourceTower.position.z,
                true
            );
        }
        
        // Finalizar arrastre
        this.draggingDisk.endDrag();
        this.draggingDisk.deselect();
        this.draggingDisk = null;
    }
    
    /**
     * Encuentra la torre más cercana a una posición
     * @param {THREE.Vector3} position - Posición a comparar
     * @return {Tower|null} - Torre más cercana o null
     */
    findClosestTower(position) {
        let closestTower = null;
        let minDistance = Infinity;
        
        this.towers.forEach(tower => {
            const distance = position.distanceTo(tower.position);
            if (distance < minDistance) {
                minDistance = distance;
                closestTower = tower;
            }
        });
        
        // Solo considerar como cercana si está a menos de cierta distancia
        return minDistance < 8 ? closestTower : null;
    }
    
    /**
     * Encuentra un disco por su mesh
     * @param {THREE.Mesh} mesh - Mesh a buscar
     * @return {Disk|null} - Disco encontrado o null
     */
    findDiskByMesh(mesh) {
        return this.disks.find(disk => disk.mesh === mesh) || null;
    }
    
    /**
     * Encuentra una torre por su base mesh
     * @param {THREE.Mesh} baseMesh - Base mesh a buscar
     * @return {Tower|null} - Torre encontrada o null
     */
    findTowerByBaseMesh(baseMesh) {
        return this.towers.find(tower => tower.baseMesh === baseMesh) || null;
    }
    
    /**
     * Verifica si se ha completado el puzzle
     */
    checkWinCondition() {
        // La victoria se logra cuando todos los discos están en la tercera torre
        if (this.towers[2].isComplete(this.numDisks)) {
            this.gameOver(true); // Victoria
        }
    }
    
    /**
     * Finaliza el juego
     * @param {boolean} victory - true si ganó, false si perdió
     */
    gameOver(victory) {
        this.isGameOver = true;
        
        // Detener el temporizador
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (victory) {
            // Actualizar mensaje de estado para victoria
            this.gameStatus.textContent = `¡Victoria! Movimientos: ${this.moves}`;
            this.gameStatus.classList.add('victory-message');
            
            // Reproducir sonido de victoria
            this.playVictorySound();
            
            // Guardar mejor puntuación
            this.saveBestScore();
        } else {
            // Actualizar mensaje para derrota (tiempo agotado)
            this.gameStatus.textContent = "¡Tiempo agotado!";
            this.gameStatus.classList.add('defeat-message');
        }
    }
    
    /**
     * Muestra la solución al puzzle
     */
    showSolution() {
        if (this.isGameOver) return;
        
        // Detener cualquier solución en curso
        if (this.solutionInterval) {
            clearInterval(this.solutionInterval);
            this.solutionInterval = null;
        }
        
        // Reiniciar el juego para partir desde el estado inicial
        this.resetForSolution();
        
        // Generar los pasos de la solución
        const solutionSteps = [];
        this.generateHanoiSolution(this.numDisks, 0, 2, 1, solutionSteps);
        
        // Mostrar mensaje
        this.gameStatus.textContent = `Mostrando solución automática (${solutionSteps.length} pasos)`;
        
        let stepIndex = 0;
        const stepDelay = 1000; // 1 segundo entre movimientos
        
        // Ejecutar la solución paso a paso
        this.solutionInterval = setInterval(() => {
            if (stepIndex >= solutionSteps.length) {
                clearInterval(this.solutionInterval);
                this.solutionInterval = null;
                this.gameStatus.textContent = "¡Solución completada!";
                return;
            }
            
            const step = solutionSteps[stepIndex];
            this.executeAutoMove(step.fromTower, step.toTower);
            stepIndex++;
            
        }, stepDelay);
    }
    
    /**
     * Reinicia el juego para la solución automática
     */
    resetForSolution() {
        // Detener temporizador si está activo
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Limpiar discos existentes
        this.clearDisks();
        
        // Reiniciar contadores
        this.moves = 0;
        this.timer = 0;
        this.isGameOver = false;
        this.updateUI();
        
        // Crear nuevos discos en la torre inicial
        this.createDisks();
    }
    
    /**
     * Genera recursivamente los pasos para resolver la Torre de Hanoi
     * @param {number} n - Número de discos a mover
     * @param {number} fromTower - Índice de la torre origen
     * @param {number} toTower - Índice de la torre destino
     * @param {number} auxTower - Índice de la torre auxiliar
     * @param {Array} steps - Array donde se almacenarán los pasos
     */
    generateHanoiSolution(n, fromTower, toTower, auxTower, steps) {
        if (n === 1) {
            // Caso base: mover un disco directamente
            steps.push({ fromTower, toTower });
            return;
        }
        
        // Mover n-1 discos de la torre origen a la auxiliar
        this.generateHanoiSolution(n - 1, fromTower, auxTower, toTower, steps);
        
        // Mover el disco restante de la torre origen a la destino
        steps.push({ fromTower, toTower });
        
        // Mover n-1 discos de la torre auxiliar a la destino
        this.generateHanoiSolution(n - 1, auxTower, toTower, fromTower, steps);
    }
    
    /**
     * Ejecuta un movimiento automático entre torres
     * @param {number} fromTowerIndex - Índice de la torre origen
     * @param {number} toTowerIndex - Índice de la torre destino
     */
    executeAutoMove(fromTowerIndex, toTowerIndex) {
        const fromTower = this.towers[fromTowerIndex];
        const toTower = this.towers[toTowerIndex];
        
        // Obtener disco superior de la torre origen
        const disk = fromTower.getTopDisk();
        
        if (disk && toTower.canAddDisk(disk)) {
            // Quitar disco de la torre origen
            fromTower.removeDisk();
            
            // Añadir disco a la torre destino
            toTower.addDisk(disk);
            
            // Incrementar contador
            this.moves++;
            this.updateUI();
            
            // Reproducir sonido
            this.playMoveSound();
        }
    }
    
    /**
     * Inicia el temporizador
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateUI();
        }, 1000);
    }
    
    /**
     * Actualiza los elementos de la interfaz
     */
    updateUI() {
        // Actualizar contador de movimientos
        this.movesCounter.textContent = this.moves.toString();
        
        // Actualizar temporizador
        if (this.gameMode === 'contrarreloj') {
            // En contrarreloj mostramos tiempo restante
            this.timerDisplay.textContent = formatTime(this.timer);
            
            // Cambiar color cuando queda poco tiempo
            if (this.timer <= 10) {
                this.timerDisplay.classList.add('time-warning');
            } else {
                this.timerDisplay.classList.remove('time-warning');
            }
        } else {
            // En otros modos mostramos tiempo transcurrido
            this.timerDisplay.textContent = formatTime(this.timer);
        }
        
        // Actualizar mejor puntuación si existe el elemento
        const bestScoreElement = document.querySelector('#best-score span');
        if (bestScoreElement && this.bestScore) {
            bestScoreElement.textContent = `${this.bestScore.moves} movimientos en ${formatTime(this.bestScore.time)}`;
        }
    }
    
    /**
     * Carga la mejor puntuación del almacenamiento local
     * @return {Object|null} - Mejor puntuación o null
     */
    loadBestScore() {
        try {
            const scoreData = localStorage.getItem('hanoiBestScore');
            if (scoreData) {
                return JSON.parse(scoreData);
            }
        } catch (e) {
            console.error('Error al cargar la mejor puntuación:', e);
        }
        return null;
    }
    
    /**
     * Guarda la mejor puntuación en el almacenamiento local
     */
    saveBestScore() {
        if (this.gameMode !== 'normal') return; // Solo guardar en modo normal
        
        const currentScore = {
            disks: this.numDisks,
            moves: this.moves,
            time: this.timer
        };
        
        // Comprobar si es la mejor puntuación
        if (!this.bestScore || 
            this.bestScore.disks < this.numDisks || 
            (this.bestScore.disks === this.numDisks && 
             (this.bestScore.moves > this.moves || 
              (this.bestScore.moves === this.moves && this.bestScore.time > this.timer)))) {
            
            this.bestScore = currentScore;
            
            try {
                localStorage.setItem('hanoiBestScore', JSON.stringify(this.bestScore));
            } catch (e) {
                console.error('Error al guardar la mejor puntuación:', e);
            }
        }
    }
    
    /**
     * Reproduce el sonido de movimiento
     */
    playMoveSound() {
        try {
            if (this.moveSound) {
                this.moveSound.currentTime = 0;
                this.moveSound.play().catch(e => console.log('Error al reproducir sonido'));
            }
        } catch (e) {
            console.log('Error al reproducir sonido');
        }
    }
    
    /**
     * Reproduce el sonido de victoria
     */
    playVictorySound() {
        try {
            if (this.victorySound) {
                this.victorySound.currentTime = 0;
                this.victorySound.play().catch(e => console.log('Error al reproducir sonido'));
            }
        } catch (e) {
            console.log('Error al reproducir sonido');
        }
    }
    
    /**
     * Reproduce el sonido de error
     */
    playErrorSound() {
        try {
            if (this.errorSound) {
                this.errorSound.currentTime = 0;
                this.errorSound.play().catch(e => console.log('Error al reproducir sonido'));
            }
        } catch (e) {
            console.log('Error al reproducir sonido');
        }
    }
    
    /**
     * Maneja el redimensionamiento de la ventana
     */
    onWindowResize() {
        // Actualizar tamaño del renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        
        // Actualizar aspecto de la cámara
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Ciclo de animación
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Actualizar tiempo para animaciones
        const time = this.clock.getElapsedTime() * 1000;
        
        // Actualizar animaciones de las torres
        this.towers.forEach(tower => {
            tower.update(time);
        });
        
        this.render();
    }
    
    /**
     * Renderiza la escena
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Abre el selector de temas
     */
    openThemeSelector() {
        // Mostrar el modal de temas
        const themeOverlay = document.getElementById('theme-overlay');
        themeOverlay.classList.remove('hidden');
        
        // Seleccionar los temas actuales
        this.updateThemeSelections();
        
        // Configurar los manejadores de eventos
        this.setupThemeEventListeners();
    }
    
    /**
     * Actualiza las selecciones de temas en el modal
     */
    updateThemeSelections() {
        // Seleccionar los temas actuales en el modal
        const towerOptions = document.querySelectorAll('.tower-themes .theme-option');
        towerOptions.forEach(option => {
            if (option.dataset.theme === this.currentTheme.tower) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        const diskOptions = document.querySelectorAll('.disk-themes .theme-option');
        diskOptions.forEach(option => {
            if (option.dataset.theme === this.currentTheme.disk) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    /**
     * Configura los manejadores de eventos para el modal de temas
     */
    setupThemeEventListeners() {
        // Botón para cerrar el modal
        const cancelButton = document.getElementById('cancel-theme');
        cancelButton.addEventListener('click', () => {
            document.getElementById('theme-overlay').classList.add('hidden');
        });
        
        // Evento para opciones de torre
        const towerOptions = document.querySelectorAll('.tower-themes .theme-option');
        towerOptions.forEach(option => {
            option.addEventListener('click', () => {
                towerOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Evento para opciones de discos
        const diskOptions = document.querySelectorAll('.disk-themes .theme-option');
        diskOptions.forEach(option => {
            option.addEventListener('click', () => {
                diskOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Botón para guardar cambios
        const saveButton = document.getElementById('save-theme');
        saveButton.addEventListener('click', () => {
            this.saveSelectedThemes();
            document.getElementById('theme-overlay').classList.add('hidden');
        });
    }
    
    /**
     * Guarda y aplica los temas seleccionados
     */
    saveSelectedThemes() {
        // Obtener los temas seleccionados
        const selectedTowerTheme = document.querySelector('.tower-themes .theme-option.selected').dataset.theme;
        const selectedDiskTheme = document.querySelector('.disk-themes .theme-option.selected').dataset.theme;
        
        // Actualizar la configuración actual
        this.currentTheme = {
            tower: selectedTowerTheme,
            disk: selectedDiskTheme,
            diskShape: this.currentTheme.diskShape // Mantener la forma actual
        };
        
        // Guardar en localStorage
        this.saveThemeSettings();
        
        // Aplicar los temas
        this.applyThemes();
    }
    
    /**
     * Guarda la configuración de temas
     */
    saveThemeSettings() {
        try {
            localStorage.setItem('hanoiThemeSettings', JSON.stringify(this.currentTheme));
        } catch (e) {
            console.error('Error al guardar los ajustes de tema:', e);
        }
    }
    
    /**
     * Carga la configuración de temas
     * @return {Object|null} - Configuración de temas o null
     */
    loadThemeSettings() {
        try {
            const settings = localStorage.getItem('hanoiThemeSettings');
            if (settings) {
                return JSON.parse(settings);
            }
        } catch (e) {
            console.error('Error al cargar los ajustes de tema:', e);
        }
        return null;
    }
    
    /**
     * Aplica los temas a torres y discos
     */
    applyThemes() {
        console.log('Aplicando tema:', this.currentTheme);
        
        // Aplicar tema a torres
        this.towers.forEach((tower, index) => {
            console.log(`Torre ${index} - Tema actual: ${tower.theme}, Nuevo tema: ${this.currentTheme.tower}`);
            
            if (tower.theme !== this.currentTheme.tower) {
                console.log(`Cambiando tema de torre ${index} de '${tower.theme}' a '${this.currentTheme.tower}'`);
                
                const changes = tower.changeTheme(this.currentTheme.tower);
                
                // Actualizar referencias en la escena
                if (changes.oldTowerMesh.parent) {
                    changes.oldTowerMesh.parent.remove(changes.oldTowerMesh);
                    console.log(`Mesh anterior de torre ${index} eliminado de la escena`);
                }
                if (changes.oldBaseMesh.parent) {
                    changes.oldBaseMesh.parent.remove(changes.oldBaseMesh);
                    console.log(`Base anterior de torre ${index} eliminada de la escena`);
                }
                
                // Eliminar decoraciones antiguas de la escena
                if (changes.oldDecorations) {
                    changes.oldDecorations.forEach((decoration, i) => {
                        if (decoration.parent) {
                            decoration.parent.remove(decoration);
                            console.log(`Decoración antigua ${i} para torre ${index} eliminada de la escena`);
                        }
                    });
                }
                
                // Añadir nuevos elementos a la escena
                this.scene.add(changes.newTowerMesh);
                this.scene.add(changes.newBaseMesh);
                console.log(`Nuevos meshes para torre ${index} añadidos a la escena`);
                
                // Añadir nuevas decoraciones a la escena
                changes.decorations.forEach((decoration, i) => {
                    this.scene.add(decoration);
                    console.log(`Decoración ${i} para torre ${index} añadida a la escena`);
                });
            }
        });
        
        // Aplicar tema a discos
        this.disks.forEach((disk, index) => {
            if (disk.theme !== this.currentTheme.disk || disk.shape !== this.currentTheme.diskShape) {
                console.log(`Cambiando tema de disco ${index} de '${disk.theme}' a '${this.currentTheme.disk}'`);
                
                const changes = disk.changeTheme(this.currentTheme.disk, this.currentTheme.diskShape);
                
                // Reemplazar mesh en la escena
                if (changes.oldMesh.parent) {
                    changes.oldMesh.parent.remove(changes.oldMesh);
                    console.log(`Mesh anterior de disco ${index} eliminado de la escena`);
                }
                this.scene.add(changes.newMesh);
                console.log(`Nuevo mesh para disco ${index} añadido a la escena`);
            }
        });
        
        // Actualizar la interfaz de usuario para reflejar los cambios
        console.log("Tema actualizado:", this.currentTheme);
    }
} 