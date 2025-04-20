/**
 * Funciones de utilidad para el juego Torre de Hanoi
 */

// Colores para los discos
const DISK_COLORS = [
    0xff4136, // Rojo
    0xff851b, // Naranja
    0xffdc00, // Amarillo
    0x2ecc40, // Verde
    0x0074d9, // Azul
    0xb10dc9, // Morado
    0xf012be, // Magenta
    0x85144b  // Granate
];

/**
 * Formatea el tiempo en formato mm:ss
 * @param {number} seconds - Tiempo en segundos
 * @return {string} - Tiempo formateado
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calcula la posición Y para un disco en una torre
 * @param {number} index - Índice del disco en la torre (0 es el fondo)
 * @param {number} diskHeight - Altura de cada disco
 * @param {number} baseHeight - Altura de la base de la torre
 * @return {number} - Posición Y del disco
 */
function calculateDiskY(index, diskHeight, baseHeight) {
    return baseHeight / 2 + diskHeight / 2 + index * diskHeight;
}

/**
 * Genera un número aleatorio entre min y max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @return {number} - Número aleatorio
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Calcula el número mínimo de movimientos para resolver el puzzle
 * @param {number} numDisks - Número de discos
 * @return {number} - Número mínimo de movimientos
 */
function calculateMinMoves(numDisks) {
    return Math.pow(2, numDisks) - 1;
}

/**
 * Detecta si el dispositivo es móvil o tablet
 * @return {boolean} - true si es móvil o tablet
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
} 