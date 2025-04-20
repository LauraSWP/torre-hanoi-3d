# Torre de Hanoi 3D

Un juego de Torre de Hanoi en 3D implementado con Three.js.

## Descripción

La Torre de Hanoi es un rompecabezas clásico que consiste en mover una pila de discos desde una torre inicial a otra torre, utilizando una tercera torre como ayuda. Las reglas son simples:

1. Solo se puede mover un disco a la vez.
2. Un disco solo puede colocarse sobre otro disco más grande o en una torre vacía.
3. El objetivo es mover toda la pila de discos desde la torre izquierda a la torre derecha.

## Características

- Experiencia 3D completa con Three.js
- Interacción por arrastre (drag & drop)
- Discos con diseño redondeado y colores vibrantes
- Diferentes niveles de dificultad (3-7 discos)
- Múltiples modos de juego:
  - **Normal**: Juego clásico sin límite de tiempo
  - **Contrarreloj**: Completa el puzzle antes de que se acabe el tiempo
  - **Desafío**: Torres en posiciones aleatorias
  - **Puzzle**: Comienza con discos distribuidos entre las torres
- Efectos de sonido
- Contador de movimientos y temporizador
- Guardado de mejores puntuaciones
- Instrucciones interactivas
- Retroalimentación visual para movimientos válidos e inválidos
- Diseño responsive para dispositivos móviles
- Animaciones fluidas

## Requisitos

- Navegador web moderno con soporte para WebGL
- No se requiere instalación adicional

## Cómo jugar

1. Abre el archivo `index.html` en tu navegador web.
2. Lee las instrucciones que aparecerán automáticamente la primera vez.
3. Selecciona el modo de juego y la dificultad deseada.
4. **Para mover un disco**: Haz clic y arrastra el disco superior de una torre y suéltalo sobre otra torre.
5. El juego no permitirá movimientos inválidos (colocar un disco sobre uno más pequeño).
6. Ganas cuando todos los discos están en la torre derecha en el orden correcto.

## Controles

- **Arrastrar y soltar discos**: Selecciona y mueve discos entre torres.
- **Botón Reiniciar**: Comienza un nuevo juego.
- **Selector de dificultad**: Cambia el número de discos (3-7).
- **Selector de modo**: Cambia entre los diferentes modos de juego.
- **Botón Solución**: Muestra una solución para el puzzle actual (próximamente).
- **Botón Ayuda (?)**: Muestra las instrucciones en cualquier momento.

## Modos de juego

- **Normal**: El modo clásico donde debes resolver el puzzle sin límite de tiempo.
- **Contrarreloj**: Tienes un tiempo limitado para resolver el puzzle. El tiempo varía según la dificultad.
- **Desafío**: Las torres están en posiciones aleatorias, lo que añade un nivel adicional de complejidad.
- **Puzzle**: Comienzas con los discos distribuidos aleatoriamente entre las torres (en posiciones válidas) y debes ordenarlos.

## Estructura del proyecto

```
torre-hanoi/
├── index.html             # Archivo principal HTML
├── css/
│   └── style.css          # Estilos CSS
├── js/
│   ├── main.js            # Archivo principal JavaScript
│   ├── Game.js            # Clase principal del juego
│   ├── Disk.js            # Clase para los discos
│   ├── Tower.js           # Clase para las torres
│   └── utils.js           # Funciones auxiliares
├── lib/
│   └── three.min.js       # Biblioteca Three.js
└── assets/                
    └── sounds/            # Efectos de sonido
```

## Implementación técnica

El juego está construido con las siguientes tecnologías:

- **HTML5 y CSS3** para la estructura y diseño
- **JavaScript (ES6)** para la lógica del juego
- **Three.js** para gráficos 3D
- **LocalStorage API** para guardar puntuaciones
- Programación orientada a objetos con clases ES6

## Posibles mejoras futuras

- Implementar un solucionador automático visual
- Añadir más efectos visuales y partículas
- Modo multijugador para competir con amigos
- Integración con redes sociales para compartir puntuaciones
- Más variantes del juego
- Editor de temas para personalizar colores y texturas

## Licencia

Este proyecto es de código abierto y está disponible para su uso y modificación. 