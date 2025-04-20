/**
 * Archivo principal que inicializa el juego Torre de Hanoi
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el contenedor del canvas del juego
    const gameCanvasContainer = document.getElementById('game-canvas-container');
    
    // Verificar compatibilidad con WebGL
    if (!isWebGLAvailable()) {
        showWebGLError();
        return;
    }
    
    // Verificar si es la primera vez que se juega
    const hasPlayedBefore = localStorage.getItem('hanoiHasPlayed');
    
    // Inicializar el juego
    const game = new Game(gameCanvasContainer);
    
    // Exponer el juego a nivel global para debugging (opcional)
    window.hanoiGame = game;
    
    // Configurar eventos para instrucciones
    setupInstructionsEvents(hasPlayedBefore);
    
    // Crear directorio para sonidos si no existe
    createSoundFiles();
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