# Historial y Registro de Versiones Estables

## 🌟 Versión Estable v29.0 - HTML offline corregido, contraste y diseño final
**Fecha:** 28 de Septiembre de 2026  
**Estado:** ÚLTIMA VERSIÓN MÁS ESTABLE (PUNTO DE RETORNO SEGURO)  
**Tag / Checkpoint:** `v29.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen Completo de Características Incluidas en Esta Versión Estable (v29.0):

- **Auditoría completa 110/110 pruebas exitosas:** Verificación integral de extremo a extremo de todas las funciones de administración, catálogo interactivo, vistas detalladas, respaldos y exportación.
- **HTML exportado 100% autónomo (sin dependencias externas):** CSS de Tailwind embebido íntegramente (`src/standalone-css.ts`), tipografías con *fallback* del sistema e íconos SVG integrados en el archivo `index.html` sin depender de CDNs externos.
- **HTML funciona en modo avión:** Carga instantánea y funcionamiento completo 100% *offline* (productos, categorías, imágenes, vistas detalladas, zoom, favoritos, filtros y menús) con el dispositivo sin conexión a Internet.
- **Contraste mejorado (menú lateral, pie de página, textos secundarios):** Mayor legibilidad y contraste en modo claro y oscuro para el nombre de la empresa en la parte inferior del menú lateral (*drawer*), textos del pie de página, etiquetas y textos secundarios en toda la aplicación.
- **Pie de página completo sin recortes:** Espaciado inferior reforzado (`pb-28` / `pb-12`) para asegurar que el texto del pie de página (`© 2026 Todos los derechos...`) se visualice íntegro en todas las vistas, incluyendo la vista de *Productos Favoritos*.
- **Menú "Ordenar por" sin superposiciones:** Menús desplegables de *"Ordenar por"* y *"Cuadrícula"* con `z-index` elevado (`z-50` / `z-index: 60`) y fondos sólidos en modo claro y oscuro, mostrándose limpiamente por encima de las píldoras de categorías.
- **Colores exactos de categorías en modo oscuro (`#1C1A19`, `#827B76`, `#302D2B`):** Píldoras de categorías inactivas en modo oscuro con fondo `#1C1A19`, texto `#827B76` y borde `#302D2B` de 1px.
- **SKU visible en la vista detallada:** El código SKU se muestra debajo de las etiquetas en la vista detallada del producto (cuando el producto tiene SKU), manteniéndose oculto en la tarjeta principal del catálogo.
- **Error de comillas escapadas corregido:** Corregido el doble escape (`\\'`) en los atributos `onclick` de `setCatalogSort` y `setCatalogGrid` dentro del *template literal* de `src/exporter.ts`, garantizando la ejecución sin errores de sintaxis del motor JavaScript en el HTML exportado.
- **Consolidación de todas las funciones estables anteriores:** Administración con acordeón exclusivo, menú de opciones editable y reordenable, respaldo JSON e importación HTML de emergencia, contador global con API Abacus (`catalogo-madera-laser`), cuadrículas de 1, 2 y 3 columnas (2 por defecto), producto más popular con llama naranja sólida (🔥), zoom a pantalla completa, bloqueo de scroll en modales, botón físico *"Atrás"* y envío de imagen adjunta por WhatsApp.

---

## 🌟 Versión Estable v27.0 - Reorganización del menú de opciones, título y subtítulo en Diseño y Cabecera, flecha de favoritos a la izquierda
**Fecha:** 28 de Septiembre de 2026  
**Estado:** VERSIÓN ESTABLE ANTERIOR  
**Tag / Checkpoint:** `v27.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen Completo de Características Incluidas en Esta Versión Estable (v27.0):

- **Vista de administración reorganizada:** Acordeón exclusivo (solo una sección abierta a la vez), scroll automático al inicio de la sección abierta, adaptación completa a modo claro/oscuro, sin "Guía de Uso" innecesaria y con botones perfectamente contenidos en móvil, tablet y computadora.
- **Título y subtítulo dentro de "Diseño y Cabecera":** Ubicados al principio del apartado en el orden: 1. Título del Catálogo (nombre), 2. Subtítulo, 3. Logo, 4. Banner, 5. Colores, 6. Tipografía, 7. Diseño de cuadrícula y 8. Pie de página.
- **Flecha de favoritos a la izquierda (como la vista detallada):** En la lista de favoritos, botón circular con flecha hacia la izquierda situado al lado izquierdo del título con el mismo diseño, tamaño y estilo que la vista detallada, regresando directamente a la pantalla principal del catálogo.
- **Menú de opciones editable desde administración:** Permite editar textos, íconos, colores, visibilidad y orden (mediante flechas ↑↓). Contiene *Información de Empresa* (con número único reutilizado en todo el sistema), *Información del Catálogo* (solo descripción), *Contactar por WhatsApp*, *Compartir Catálogo* y *¿Cómo funciona?*, mientras que los mensajes de *Compartir Producto* y *Consultar Producto por WhatsApp* están en su sección independiente.
- **Navegación de sub-vistas y botón físico "Atrás" corregida:** Eliminados los botones de retorno intermedios en las sub-vistas; tanto el botón cerrar (`X`), la flecha de favoritos como el botón físico *"Atrás"* del celular regresan directamente a la pantalla principal del catálogo.
- **Botón "Importar HTML" (respaldo de emergencia):** Permite seleccionar un archivo `index.html` exportado previamente, extraer y validar los datos embebidos (`<script id="catalog-project-data" type="application/json">`) y restaurar todo el catálogo con confirmación previa.
- **Respaldo completo con todos los datos editables:** Exportación y restauración íntegra en JSON y HTML (productos, categorías, etiquetas, promociones, diseño, mensajes, información de empresa y menú de opciones).
- **Contador global con API Abacus:** Namespace permanente `catalogo-madera-laser` con sincronización paralela y soporte offline.
- **Productos visibles inmediatamente:** Carga instantánea sin bloqueos de red.
- **Cuadrículas funcionales (1, 2, 3 columnas):** 2 columnas por defecto y selector adaptable en móvil, tablet y escritorio.
- **Producto más popular con llama (🔥):** Ícono de llama naranja sólido en tarjeta principal, detalle y filtro de populares.
- **Menú hamburguesa funcional:** Panel desplegable completo en vista previa y HTML exportado.
- **Imágenes uniformes en las tarjetas:** Proporción constante con soporte de transparencia PNG en modo claro y oscuro.
- **Botón flotante para subir al inicio:** Desplazamiento suave adaptable al tema.
- **Mensajes de error contextuales:** Avisos claros según búsqueda, categoría, favoritos o catálogo vacío.
- **Modal "¿Cómo funciona?" del catálogo:** Pasos interactivos y editables desde el menú de opciones.
- **Archivo exportado con nombre "index.html":** Exportación 100% autónoma lista para publicar o compartir.
- **Vista detallada restaurada:** Con imagen principal, miniaturas ("Productos Similares"), nombre centrado, categoría, etiquetas, botones de vistas/favoritos/compartir, descripción, medidas, materiales, precio FOB, botón de WhatsApp y productos relacionados ponderados.
- **Zoom en las imágenes de la vista detallada:** Visor a pantalla completa (100% a 300%) adaptable al modo claro/oscuro.
- **Scroll bloqueado en modales:** Prevención total de desplazamiento de fondo y *pull-to-refresh* al abrir cualquier modal.
- **Imágenes visibles en la vista detallada del HTML exportado:** Dimensiones blindadas y transiciones suaves sin parpadeos.
- **Compartir producto con imagen como adjunto y URL del catálogo:** Envío de foto real adjunta mediante Web Share API y enlace limpio sin rutas locales `content://`.

---

## 🌟 Versión Estable v26.0 - Respaldo completo, compartir WhatsApp corregido, menú de opciones editable
**Fecha:** 27 de Septiembre de 2026  
**Estado:** VERSIÓN ESTABLE ANTERIOR  
**Tag / Checkpoint:** `v26.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen Completo de Características Incluidas en Esta Versión Estable (v26.0):

1. **Sistema de Respaldo y Restauración 100% Completo y Offline (`src/lib/backupService.ts`, `src/App.tsx`):**
   - Incluye y recupera automáticamente TODOS los datos editables del proyecto sin depender de Internet:
     1. **Información de Empresa:** Nombre del contacto, empresa/marca, teléfono/WhatsApp, correo electrónico, dirección y sitio web/redes sociales.
     2. **Mensajes de WhatsApp:** Mensaje al tocar *"Contactar por WhatsApp"*, mensaje al compartir el catálogo completo, mensaje al compartir un producto individual y mensaje de consulta por producto al vendedor.
     3. **Información del Catálogo:** Nombre del catálogo, subtítulo, descripción general, logo/ícono de cabecera, banner panorámico y texto de pie de página.
     4. **Menú de Opciones:** Textos/etiquetas, íconos, colores personalizados, visibilidad de cada opción y pasos de *"¿Cómo funciona?"*.
     5. **Productos, Categorías, Etiquetas y Promociones:** Todos los productos con sus precios, monedas, SKU, medidas, materiales, MOQ, colores, etiquetas, categorías, bloques de promociones (`customBlocks`) y todas las imágenes embebidas en Base64/DataURL 100% offline.
     6. **Configuración de Diseño:** Color primario, color secundario, tipografía (`serif`, `sans`, `mono`) y disposición de cuadrícula (`1x1`, `2x2`, `3x3`).
2. **Envío de Imagen del Producto como Adjunto Real por WhatsApp (`src/exporter.ts`, `src/components/CatalogPreview.tsx`):**
   - Tanto al **compartir un producto** (botón *"Compartir"*) como al **consultar por un producto** (botón *"Consultar por WhatsApp"* en la vista detallada), la imagen principal del producto (`images[0]`) se convierte síncronamente en un archivo de foto real (`File` JPEG/PNG) y se adjunta mediante `navigator.share({ files: [imageFile], text })`.
   - Eliminada por completo la aparición de rutas internas de Android (`content://media/external/file/...`) al abrir el HTML exportado localmente desde el teléfono.
3. **Edición de Mensajes de WhatsApp en el Gestor de Administración (`src/components/AdminMessages.tsx`):**
   - Apartado con el mismo fondo blanco limpio que los demás módulos del gestor, iniciando directamente con *"Mensaje al tocar 'Contactar por WhatsApp' (Menú de Opciones)"*, seguido de *"Mensaje al Compartir el Catálogo Completo"*, *"Mensaje al Compartir un Producto Individual"* y *"Mensaje de Consulta por WhatsApp al Vendedor"*.
4. **Menú de Opciones Editable y Cromático (`src/components/AdminOptionsMenu.tsx`, `src/exporter.ts`):**
   - Edición completa desde el administrador de textos, íconos, colores y visibilidad de las opciones del menú lateral.
   - Ícono de **Productos Favoritos** con contorno neutro (blanco/negro según modo) y relleno rojo cuando está activo; ícono de **Compartir catálogo** en tono neutro adaptable al tema.
5. **Navegación del Menú de Opciones, Vista de Favoritos y Estados Vacíos:**
   - Al salir de una sub-vista abierta desde el menú lateral (como *Productos Favoritos* o modales informativos), regresa al **Menú de Opciones**.
   - En la vista de **Productos Favoritos** se muestra el subtítulo *"Productos favoritos"* y se ocultan las promociones.
   - Los mensajes de estado vacío muestran el botón **"Regresar al Inicio"**.
   - Apertura de WhatsApp directa y suave sin *flash* intermedio.
6. **Consolidación Integral de v25.0 y Anteriores:**
   - Contador global de vistas en paralelo con API Abacus (`catalogo-madera-laser`), cuadrículas de 1, 2 y 3 columnas (2 por defecto), producto más popular con llama naranja sólida (🔥), modo claro/oscuro persistente, vista detallada con productos similares y zoom a pantalla completa, bloqueo de scroll en modales y navegación jerárquica con botón físico *"Atrás"* de Android.

---

## 🌟 Versión Estable v25.0 - Navegación corregida, imágenes en detalle, scroll bloqueado
**Fecha:** 25 de Septiembre de 2026  
**Estado:** VERSIÓN ESTABLE ANTERIOR  
**Tag / Checkpoint:** `v25.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen Completo de Características Incluidas en Esta Versión Estable (v25.0):

1. **Vista de administración reorganizada:**
   - Todos los apartados cerrados/colapsados por defecto, con nombres cortos, íconos suaves, guía de 5 pasos al inicio, soporte de banner en cabecera y exportación al final.
2. **Contador global con API Abacus:**
   - Namespace permanente `catalogo-madera-laser`, IDs estables por producto, consultas paralelas de alta velocidad y cola de reintentos offline en `localStorage`.
3. **Productos visibles inmediatamente:**
   - Renderizado instantáneo de productos sin bloqueos de red.
4. **Cuadrículas funcionales en móvil, tablet y desktop (1, 2, 3 columnas):**
   - Vista por defecto siempre en 2 columnas al abrir, con selector de 1, 2 y 3 columnas.
5. **Visibilidad según cuadrícula:**
   - **1 columna:** descripción, detalles y precio.
   - **2 columnas:** detalles, precio, sin descripción.
   - **3 columnas:** precio, sin detalles y sin descripción.
6. **SKU oculto en tarjeta principal:**
   - Interfaz limpia en las tarjetas del catálogo principal.
7. **Producto más popular con llama (🔥) coherente con el menú de filtros:**
   - El producto con más vistas muestra el ícono de llama naranja sólido (`#f97316`) tanto en la tarjeta principal como en la vista detallada y en el filtro "Más Vistos".
8. **Menú hamburguesa (☰) funcional en el HTML exportado:**
   - Panel lateral desplegable con opciones de navegación, favoritos, información de empresa, acerca del catálogo, "¿Cómo funciona?" y salida confirmada.
9. **Imágenes uniformes en las tarjetas:**
   - Todas las tarjetas mantienen dimensiones uniformes (`aspect-card` 4:3 con `object-contain` y soporte de transparencia PNG en modo claro y oscuro).
10. **Botón flotante para subir al inicio:**
    - Botón circular adaptable al modo claro/oscuro que aparece al hacer scroll y regresa suavemente al inicio.
11. **Mensajes de error contextuales:**
    - Mensajes específicos con íconos para favoritos vacíos, búsqueda sin resultados, categoría vacía, filtros combinados y catálogo vacío, con botón "Restablecer Filtros".
12. **Modal "¿Cómo funciona?" del catálogo:**
    - Guía interactiva de 5 pasos numerados con diseño limpio y adaptable.
13. **Archivo exportado con nombre "index.html":**
    - Exportación 100% autónoma y offline lista para abrir o alojar en cualquier servidor.
14. **Vista detallada restaurada y optimizada:**
    - Incluye imagen principal con fondo sólido adaptable al modo claro/oscuro, precarga de imágenes y transición suave *fade* (200ms) sin flash, miniaturas ("Productos Similares"), nombre centrado, categoría, etiquetas, botones con íconos cromáticos (vistas azul/llama, favoritos rojo, compartir verde), descripción, medidas y materiales en una sola línea horizontal, precio FOB, botón de WhatsApp y hasta 3 productos relacionados ponderados (70% categoría + 30% etiquetas).
15. **Zoom en las imágenes de la vista detallada:**
    - Visor a pantalla completa adaptable al tema activo (claro/oscuro) con controles de zoom (100% a 300%), miniaturas, flechas de navegación y botón de regreso circular.
16. **Navegación con botón físico "Atrás" corregida (Android):**
    - Pila jerárquica de navegación (`navStack`) con reservas de historial activadas por gestos de usuario: cierra secuencialmente zoom → vista detallada → favoritos / modales / menús / filtros / búsqueda → catálogo principal, y solo en la pantalla principal muestra el modal de confirmación *"¿Estás seguro de que deseas salir?"*.
17. **Scroll bloqueado en modales (sin "rastros" de fondo ni pull-to-refresh):**
    - Aplicación automática de `overflow: hidden` y `overscroll-behavior: none` en `<html>` y `<body>` mientras cualquier modal está abierto (`syncBodyScrollLock`), junto con `overscroll-behavior: contain` en todos los modales (detalle, zoom, menú lateral, promociones, "¿Cómo funciona?" y confirmación de salida).
18. **Imágenes visibles en la vista detallada del HTML exportado:**
    - Selectores CSS correctamente escapados en el template literal (`src/standalone-css.ts`), selectores directos (`#modal-main-image-zoom-trigger`, `.aspect-modal-img`) y estilos en línea (`aspect-ratio: 16 / 10; width: 100%; min-height: 220px;`) que garantizan la visualización perfecta de las imágenes en todos los dispositivos y navegadores.

---

## 🌟 Versión Estable v24.0 - Modo Claro/Oscuro, Vista Detallada de Promociones, 2 Columnas e Imágenes Completas
**Fecha:** 22 de Septiembre de 2026  
**Estado:** ÚLTIMA VERSIÓN MÁS ESTABLE (PUNTO DE RETORNO SEGURO)  
**Tag / Checkpoint:** `v24.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen de los 4 Nuevos Ajustes Implementados:

1. **Ajuste 1 - Vista por Defecto en 2 Columnas:**
   - Tanto la vista previa del gestor como el catálogo exportado (`index.html`) inician siempre en cuadrícula de 2 columnas al cargar.
   - El usuario conserva la total libertad de cambiar manualmente a 1 o 3 columnas mediante el menú de cuadrícula.

2. **Ajuste 2 - Promociones con Vista Detallada en Modal:**
   - Al hacer clic sobre cualquier tarjeta de promoción (tanto en el catálogo en vivo como en el archivo exportado), se abre un modal detallado con:
     * Título destacado de la promoción.
     * Insignia/Badge personalizada o distintivo especial.
     * Imagen completa de la promoción sin recorte.
     * Descripción y contenido completo.
     * Botón de cierre en cabecera (X) y botón principal "Cerrar" en el pie.
     * Cierre al presionar fuera del modal con fondo difuminado (backdrop blur).

3. **Ajuste 3 - Imágenes Completas sin Afectar el Tamaño de las Tarjetas:**
   - La propiedad de renderizado de imágenes en tarjeta se configuró como `object-contain` sobre el marco aspect-ratio uniforme.
   - Las imágenes de productos se visualizan de forma 100% íntegra sin cortes ni distorsiones.
   - Todas las tarjetas del catálogo mantienen exactamente el mismo tamaño, ancho y alto en la cuadrícula sin desalinearse.

4. **Ajuste 4 - Botón de Modo Claro / Oscuro (Sol / Luna):**
   - Incorporado en la cabecera directamente al lado del menú hamburguesa (☰).
   - Muestra el ícono de **Sol (☀️)** cuando la app está en modo claro y el ícono de **Luna (🌙)** cuando está en modo oscuro.
   - Al tocarlo, invierte los esquemas de color de fondos, tarjetas, tipografías, inputs, modales y bordes con transiciones fluidas.
   - Guarda y recuerda la preferencia del usuario en `localStorage` permanentemente.

---

## 🌟 Versión Estable v23.0 - Ajustes de diseño y menú hamburguesa completados
**Fecha:** 22 de Septiembre de 2026  
**Estado:** ÚLTIMA VERSIÓN MÁS ESTABLE (PUNTO DE RETORNO SEGURO)  
**Tag / Checkpoint:** `v23.0-estable`  
**Archivo exportado estándar:** `index.html`  

---

### Resumen de Características Incluidas en Esta Versión Estable:

1. **Vista de Administración Reorganizada:**
   - Todos los apartados cerrados/colapsados por defecto para máxima claridad y orden.
   - Nombres cortos e íconos en tonalidades suaves.
   - Guía de uso de 5 pasos al inicio.
   - Módulo de exportación al final del panel.
   - Soporte completo para banner panorámico en cabecera (sin espacios vacíos si no se usa).

2. **Contador Global con API Abacus:**
   - Namespace permanente: `catalogo-madera-laser`.
   - IDs estables y persistentes por producto.
   - Peticiones concurrentes en paralelo (hasta 6 simultaneous) para máxima velocidad de sincronización.
   - Cola de reintentos offline con almacenamiento en `localStorage`.

3. **Carga y Visibilidad Inmediata de Productos:**
   - Renderizado instantáneo de la lista de productos sin bloqueos.

4. **Cuadrículas Funcionales (1, 2 y 3 Columnas):**
   - Selector visual de columnas adaptado tanto a pantallas móviles como tablets y computadoras.

5. **Reglas de Visibilidad según Cuadrícula:**
   - **1 Columna:** Descripción visible, botón "Detalles" visible, precio visible.
   - **2 Columnas:** Sin descripción, botón "Detalles" oculto, precio visible.
   - **3 Columnas:** Sin descripción, botón "Detalles" oculto, precio visible.

6. **Botón "Detalles" Exclusivo en 1 Columna:**
   - Eliminado de 2 y 3 columnas; presente únicamente en vista de 1 columna para mantener tarjetas compactas.

7. **SKU Oculto en Tarjeta Principal:**
   - Visualización limpia en el feed de productos; el SKU se reserva para vistas detalladas.

8. **Producto Más Popular con Llama (🔥):**
   - El producto con mayor cantidad de vistas sustituye dinámicamente el ícono del ojo por una llama en la pastilla del contador, en perfecta concordancia con el filtro "Más Populares".

9. **Menú Hamburguesa (☰) en el HTML Exportado:**
   - Ícono SVG clásico y nítido de tres líneas horizontales paralelas (☰).
   - Panel lateral desplegable con acceso a filtros, información de empresa, acerca del catálogo y "¿Cómo funciona?".

10. **Imágenes Uniformes en las Tarjetas:**
    - Todas las tarjetas tienen exactamente el mismo tamaño, ancho y alto (`aspect-ratio` unificado con `object-fit: cover`).
    - Cuadrícula completamente alineada y sin deformación visual de fotos.

11. **Botón Flotante para Subir al Inicio:**
    - Botón circular con flecha superior (`ArrowUp`) que emerge suavemente tras 300px de scroll y realiza un desplazamiento suave hacia arriba.

12. **Mensajes de Error y Estados Vacíos Contextuales:**
    - **Favoritos:** *"No se encontraron productos seleccionados como favoritos"* (con ícono de corazón).
    - **Búsqueda:** *"No se encontraron productos para tu búsqueda"* (con ícono de lupa).
    - **Categoría:** *"No hay productos en esta categoría"* (con ícono de carpeta).
    - **Filtros combinados:** *"No hay productos que coincidan con los filtros aplicados"* (con ícono de filtros).
    - **Catálogo vacío:** *"El catálogo está vacío"* (con ícono de paquete).
    - Botón de acción *"Restablecer Filtros"* para volver inmediatamente a la lista completa.

13. **Modal "¿Cómo funciona?" del Catálogo:**
    - Encabezado con ícono de interrogación ámbar/naranja.
    - Subtítulo: *"¿Cómo usar este catálogo?"*.
    - Introducción: *"Sigue estos sencillos pasos para sacarle el máximo provecho a nuestra plataforma de exhibición digital:"*.
    - 5 Pasos exactos numerados con insignias circulares:
      1. Explora sin compromiso (Catálogo 100% de exhibición).
      2. Contacta si te gusta (Pregunta por WhatsApp).
      3. Encuentra lo que buscas (Buscador rápido).
      4. Guarda tus favoritos (Corazón ❤️).
      5. Comparte con quien quieras (Un toque a WhatsApp).
    - Botón "Cerrar" inferior y botón "✕" superior.

14. **Archivo Exportado con Nombre "index.html":**
    - Descarga directa con el nombre exacto `index.html` para despliegue inmediato en cualquier servidor, GitHub Pages o hosting.

---

### Procedimiento de Restauración
En caso de que cambios futuros introduzcan fallos o regresiones:
1. Este archivo `VERSIONS.md` y el tag git `v29.0-estable` contienen el snapshot verificado.
2. Los componentes clave para restaurar son:
   - `src/lib/backupService.ts`: Sistema de respaldo y restauración completa 100% offline (JSON y HTML).
   - `src/exporter.ts`: Generador autónomo del cliente `index.html`.
   - `src/standalone-css.ts`: Hoja de estilos CSS embebida para funcionamiento 100% offline en modo avión.
   - `src/components/CatalogPreview.tsx`: Vista interactiva del cliente.
   - `src/versionsData.ts`: Historial y control de versiones.
<!-- Build trigger v29.0 -->
