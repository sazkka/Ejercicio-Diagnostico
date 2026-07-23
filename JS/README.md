# Sistema de Gestión de Pedidos

Aplicación web para registrar, buscar, filtrar y reportar pedidos, hecha con HTML, CSS y JavaScript puro (sin frameworks ni librerías externas).

## Estructura del proyecto

```
JS/
├── index.html          # Estructura de la app (Inicio, Búsqueda, Registros, Reportes)
├── css/
│   └── style.css       # Estilos de toda la aplicación
├── js/
│   └── app.js          # Lógica: pedidos, validaciones, filtros, estadísticas
└── imagenes/
    └── iconos/          # Iconos SVG usados en la interfaz
```

## Qué se usó

- **HTML5** semántico para la estructura de las páginas.
- **CSS3** con variables (`:root`) y Flexbox/Grid, sin frameworks (no Bootstrap/Tailwind).
- **JavaScript vanilla** (ES6+), sin librerías ni dependencias externas.
- **localStorage** para que los pedidos persistan al recargar la página.
- **Iconos SVG locales** (usados como máscara CSS con `currentColor`), en vez de una fuente de iconos externa.
