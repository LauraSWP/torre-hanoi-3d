/**
 * Archivo principal que inicializa el juego Torre de Hanoi
 */

import { Game } from './Game.js';

// Configuración global (si es necesaria)
const SOUND_DIR = 'assets/sounds';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    // Configurar directorio de sonidos (si es necesario)
    // (Esto podría estar dentro de la clase Game si se prefiere)
    if (typeof Howler !== 'undefined') {
        Howler.volume(0.5);
        console.log('Directorio de sonidos configurado:', SOUND_DIR); 
        // Howler.soundPath = SOUND_DIR;
    } else {
        console.warn('Howler no está cargado, los sonidos no funcionarán.');
    }

    const gameContainer = document.getElementById('game-canvas-container');
    
    if (gameContainer) {
        console.log("Initializing game...");
        try {
            const game = new Game(gameContainer);
            // Opcional: hacer la instancia de Game accesible globalmente para depuración
            window.hanoiGame = game;
            console.log("Game instance created.");
        } catch (error) {
            console.error("Failed to initialize game:", error);
            // Mostrar un mensaje al usuario
            const statusElement = document.getElementById('game-status');
            if (statusElement) {
                statusElement.textContent = 'Error al cargar el juego. Inténtalo de nuevo.';
                statusElement.style.color = 'red';
            }
        }
    } else {
        console.error("Game container #game-canvas-container not found!");
    }
    
    // Añadir listeners para botones que no estén dentro de Game (si los hay)
    const instructionsButton = document.getElementById('instructions-btn'); // Asumiendo que existe un botón
    const instructionsOverlay = document.getElementById('instructions-overlay');
    const closeInstructionsButton = document.getElementById('close-instructions');

    if (instructionsButton && instructionsOverlay && closeInstructionsButton) {
        instructionsButton.addEventListener('click', () => {
            instructionsOverlay.classList.remove('hidden');
        });
        closeInstructionsButton.addEventListener('click', () => {
            instructionsOverlay.classList.add('hidden');
        });
    } else {
        console.warn('Elementos de instrucciones no encontrados');
    }
    
});

/**
 * Verifica si WebGL está disponible en el navegador
 * @return {boolean} - true si WebGL está disponible
 */
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch (e) {
        return false;
    }
}

/**
 * Muestra un mensaje de error si WebGL no está disponible
 */
function showWebGLError() {
    const gameCanvasContainer = document.getElementById('game-canvas-container');
    gameCanvasContainer.innerHTML = `
        <div style="text-align: center; color: white; padding: 20px;">
            <h2>Error: WebGL no disponible</h2>
            <p>Tu navegador no soporta WebGL, que es necesario para ejecutar este juego.</p>
            <p>Prueba con un navegador más moderno como Chrome, Firefox, Edge o Safari.</p>
        </div>
    `;
}

/**
 * Configura los eventos para mostrar/ocultar las instrucciones
 * @param {string|null} hasPlayedBefore - Valor de almacenamiento local
 */
function setupInstructionsEvents(hasPlayedBefore) {
    const instructionsOverlay = document.getElementById('instructions-overlay');
    const closeInstructionsBtn = document.getElementById('close-instructions');
    
    // Mostrar instrucciones si es la primera vez
    if (!hasPlayedBefore) {
        instructionsOverlay.classList.remove('hidden');
        localStorage.setItem('hanoiHasPlayed', 'true');
    }
    
    // Botón para cerrar instrucciones
    closeInstructionsBtn.addEventListener('click', () => {
        instructionsOverlay.classList.add('hidden');
    });
    
    // Añadir botón al UI para mostrar instrucciones de nuevo
    const gameUI = document.querySelector('#game-ui');
    if (gameUI) {
        const helpButton = document.createElement('button');
        helpButton.id = 'help-btn';
        helpButton.textContent = '?';
        helpButton.style.borderRadius = '50%';
        helpButton.style.width = '36px';
        helpButton.style.height = '36px';
        helpButton.style.padding = '0';
        helpButton.style.marginLeft = 'auto';
        helpButton.style.backgroundColor = '#607D8B';
        
        helpButton.addEventListener('click', () => {
            instructionsOverlay.classList.remove('hidden');
        });
        
        gameUI.appendChild(helpButton);
    }
}

/**
 * Crea archivos de sonido temporales para el juego
 */
function createSoundFiles() {
    // Crear directorio para sonidos si es necesario
    const soundsDir = 'assets/sounds';
    
    // En un entorno real, aquí se crearían o verificarían los archivos de sonido
    // Este código no tiene efecto real en una aplicación web estándar,
    // pero se deja aquí como referencia para una implementación futura
    console.log('Directorio de sonidos configurado:', soundsDir);
} 