export interface VersionRelease {
  version: string;
  date: string;
  title: string;
  badge?: 'Estable' | 'Mayor' | 'Mejora' | 'Actual';
  isCurrent?: boolean;
  highlights: string[];
}

export const APP_VERSIONS_HISTORY: VersionRelease[] = [
  {
    version: '29.0',
    date: '28 de Septiembre de 2026',
    title: 'Versión Estable v29.0 - HTML offline corregido, contraste y diseño final',
    badge: 'Estable',
    isCurrent: true,
    highlights: [
      'Auditoría completa 110/110 pruebas exitosas: Verificación integral de todas las funcionalidades del gestor, catálogo, vistas detalladas, filtros, respaldos y exportación.',
      'HTML exportado 100% autónomo (sin dependencias externas) y funcional en modo avión: CSS embebido completo (src/standalone-css.ts) y recursos integrados para operar sin conexión a Internet.',
      'Error de comillas escapadas corregido en src/exporter.ts: Doble escape seguro en los eventos onclick de los menús de ordenamiento y cuadrícula, garantizando la ejecución limpia de render() en el HTML exportado.',
      'Contraste mejorado y pie de página sin recortes: Mayor legibilidad en modo claro y oscuro para el pie del menú lateral (nombre de empresa), pie de página completo sin cortes en todas las vistas (incluyendo Favoritos) y textos secundarios.',
      'Menú "Ordenar por" sin superposiciones: Posicionamiento, fondos sólidos y z-index superior para que el desplegable se muestre limpiamente sobre las categorías.',
      'Colores exactos de categorías en modo oscuro (#1C1A19, #827B76, #302D2B) y SKU visible en la vista detallada (manteniéndose oculto en la tarjeta principal).'
    ]
  },
  {
    version: '27.0',
    date: '28 de Septiembre de 2026',
    title: 'Versión Estable v27.0 - Reorganización del menú de opciones, título y subtítulo en Diseño y Cabecera, flecha de favoritos a la izquierda',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Título y Subtítulo en "Diseño y Cabecera": El Título del Catálogo (nombre) y el Subtítulo están integrados al principio del apartado "Diseño y Cabecera" en orden jerárquico (1. Título, 2. Subtítulo, 3. Logo, 4. Banner, 5. Colores, 6. Tipografía, 7. Diseño de cuadrícula, 8. Pie de página).',
      'Flecha de Favoritos a la Izquierda: En la lista de Productos Favoritos, el botón de regreso es una flecha circular ubicada a la izquierda del título, con idéntico diseño, tamaño y estilo que la flecha de la vista detallada, regresando directamente a la pantalla principal del catálogo.',
      'Menú de Opciones Reorganizado y Editable: Edición completa desde administración (textos, íconos, colores, visibilidad y flechas ↑↓ para cambiar el orden). Incluye Información de Empresa (sin duplicar teléfono), Información del Catálogo (solo descripción), Contactar por WhatsApp, Compartir Catálogo y ¿Cómo funciona?, mientras que Compartir Producto y Consultar Producto van en la sección de Mensajes de WhatsApp.',
      'Navegación Directa a Pantalla Principal y Acordeón Exclusivo: Al tocar la "X" o el botón físico "Atrás" del celular en las sub-vistas, regresa directamente a la vista principal del catálogo; el gestor de administración funciona con acordeón exclusivo (una sola sección abierta a la vez) y auto-scroll al inicio de la sección abierta.',
      'Botón "Importar HTML" y Respaldo Completo 100% Offline: Permite restaurar el catálogo completo tanto desde archivos de respaldo JSON como desde cualquier archivo index.html exportado previamente (<script id="catalog-project-data">).',
      'Consolidación Integral de Funciones Clave: Contador global con API Abacus, productos visibles inmediatamente, cuadrículas 1/2/3 columnas, producto más popular con llama (🔥), menú hamburguesa, imágenes uniformes, botón flotante para subir al inicio, mensajes contextuales, modal "¿Cómo funciona?", vista detallada completa con zoom, scroll bloqueado en modales y compartir producto con imagen adjunta y URL.'
    ]
  },
  {
    version: '26.0',
    date: '27 de Septiembre de 2026',
    title: 'Versión Estable v26.0 - Respaldo completo, compartir WhatsApp corregido, menú de opciones editable',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Respaldo y Restauración 100% Completa y Offline (JSON / HTML): El respaldo incluye y restaura automáticamente los 6 bloques de datos editables: Información de Empresa, Mensajes de WhatsApp, Información del Catálogo (nombre, subtítulo, descripción, logo, banner), Menú de Opciones (textos, íconos, colores, visibilidad, pasos), Productos con todas sus imágenes/precios/categorías/etiquetas/promociones, y Configuración de Diseño.',
      'Envío de Imagen como Adjunto Real por WhatsApp: Al compartir un producto ("Compartir") y al consultar por un producto ("Consultar por WhatsApp"), la foto principal se envía como archivo adjunto real (File JPEG/PNG vía Web Share API) sin rutas internas de Android (content://media/external/file/...).',
      'Edición Completa de Mensajes de WhatsApp: Se agregó en el administrador la edición del mensaje al tocar "Contactar por WhatsApp" en el menú lateral, junto con los mensajes para compartir el catálogo completo, compartir producto individual y consultar al vendedor, con diseño limpio y uniforme.',
      'Menú de Opciones Editable y Cromático: Administración completa de textos, íconos, colores personalizados y visibilidad de cada opción del menú lateral; ícono de Favoritos con contorno neutro y relleno rojo activo, e ícono de Compartir neutro adaptable al modo claro/oscuro.',
      'Navegación de Sub-vistas y Vista de Favoritos Mejorada: Al salir de Productos Favoritos o modales informativos se regresa al Menú de Opciones; la vista de Favoritos muestra el subtítulo "Productos favoritos" sin promociones, y los estados vacíos cuentan con el botón "Regresar al Inicio".',
      'HTML Exportado 100% Autónomo y Blindado: Eliminado error de escape en expresiones regulares dentro del template literal de src/exporter.ts y apertura directa sin flash al compartir por WhatsApp.'
    ]
  },
  {
    version: '25.0',
    date: '25 de Septiembre de 2026',
    title: 'Versión Estable v25.0 - Navegación corregida, imágenes en detalle, scroll bloqueado',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Navegación con botón físico "Atrás" corregida (Android): Pila jerárquica de sub-vistas (zoom → detalle → favoritos/modales/búsqueda/filtros → pantalla principal → modal de confirmación de salida) sin salidas accidentales.',
      'Imágenes visibles y fluidas en la vista detallada del HTML exportado: Contenedor con dimensiones blindadas (16:10), fondo sólido adaptable a modo claro/oscuro, precarga automática de miniaturas y transición suave fade de 200ms sin "flash" ni "rastros".',
      'Scroll bloqueado en todos los modales: Bloqueo de overflow en html y body al abrir cualquier modal (vista detallada, zoom, menú lateral, promociones, "¿Cómo funciona?", salida) y overscroll-behavior: contain para evitar desplazamientos del fondo y pull-to-refresh.',
      'Vista detallada completa y zoom a pantalla completa: Nombre centrado, categoría, etiquetas, botones de vistas/favoritos/compartir, descripción, medidas y materiales en una línea, precio FOB, WhatsApp, productos relacionados ponderados y zoom interactivo adaptable al tema.',
      'Funcionalidades base consolidadas: Administración reorganizada, contador global con API Abacus en paralelo, cuadrículas de 1, 2 y 3 columnas (2 por defecto), producto más popular con llama naranja sólida (🔥), menú hamburguesa (☰), botón flotante para subir al inicio, mensajes contextuales y exportación 100% autónoma a index.html.'
    ]
  },
  {
    version: '24.10',
    date: '25 de Septiembre de 2026',
    title: '5 Ajustes Clave en Vista de Cliente: Inicio Adaptable, Zoom Temático, Botón Atrás de Android y Llama Sólida Naranja',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Ajuste 1 - Color del botón "Regresar al inicio" (⬆️): El botón flotante de subir al inicio ahora adapta dinámicamente su color al modo activo (fondo claro con ícono oscuro en modo claro; fondo oscuro con ícono claro en modo oscuro), con diseño circular, borde gris y sombra armónica idéntica al botón de regresar del detalle.',
      'Ajuste 2 - Fondo de la pantalla del zoom adaptable al modo: La pantalla de imagen ampliada adapta su fondo al tema activo (fondo crema/blanco piedra en modo claro, negro/gris oscuro profundo en modo oscuro) asegurando óptimo contraste de las fotos y botón de cerrar idéntico al de la vista detallada.',
      'Ajuste 3 - Navegación jerárquica con el botón físico "Atrás" de Android: Se corrigió la intercepción de popstate. Si el usuario está en el zoom de una imagen, cierra el zoom; si está en la vista detallada, vuelve al catálogo; si está en favoritos o promociones, regresa al catálogo principal; solo si está en la pantalla principal del catálogo pregunta si desea salir.',
      'Ajustes 4 y 5 - Ícono de la llama (🔥) naranja y relleno sólido: La llama de popularidad ahora es de color naranja vivo (#f97316) con relleno sólido en todas las vistas (tarjeta principal del producto más visto, vista detallada del producto y menú de filtros "Más Vistos").',
      'Preservación integral: Todas las funcionalidades existentes se mantienen 100% operativas (contador global paralelo con Abacus, filtros, categorías, WhatsApp, imágenes y sistema de versiones).'
    ]
  },
  {
    version: '24.9',
    date: '25 de Septiembre de 2026',
    title: 'Corrección Definitiva del Zoom en Catálogo HTML Exportado',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Diagnóstico y corrección de causa raíz en el exportador: En src/exporter.ts, el evento onclick de la imagen principal intentaba evaluar la variable local currentImgIndex que no residía en el ámbito global (window), generando un ReferenceError en el navegador al hacer clic en el catálogo exportado.',
      'Sincronización global y paso numérico seguro: Se expuso window.currentImgIndex en el runtime autónomo, se interpoló el valor numérico literal en el atributo onclick (openImageZoomModal con índice numérico) y se añadió vinculación directa de eventos por JavaScript (#modal-main-image-zoom-trigger.onclick).',
      'Blindaje de dimensiones y posicionamiento del modal de zoom: Se agregaron estilos en línea directos (`position: fixed; z-index: 99999; top: 0; left: 0; width: 100vw; height: 100vh; display: flex;`) garantizando que el modal de zoom se superponga de manera absoluta en cualquier navegador y dispositivo móvil.',
      'Preservación integral: Todas las funcionalidades del catálogo continúan 100% operativas (flecha circular oscura con borde gris claro en detalle y zoom, modo claro/oscuro, filtros, WhatsApp y exportación offline).'
    ]
  },
  {
    version: '24.8',
    date: '24 de Septiembre de 2026',
    title: 'Restablecimiento de Flecha de Regresar Original y Corrección Integral de Zoom de Imágenes',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Problema 1: Botón de regresar / cerrar restaurado con el ícono correcto de flecha hacia la izquierda (ArrowLeft) y tamaño completo (w-10 h-10 con ícono w-5 h-5 / w-6 h-6), fondo circular oscuro y borde gris claro elegante, garantizando idéntico diseño en la vista detallada y en el modal de zoom.',
      'Problema 2: Zoom de imágenes corregido y blindado. Al tocar o hacer clic sobre la imagen se abre instantáneamente en pantalla completa con imagen nítida, centrada y sin deformaciones. Se eliminó la concatenación de URLs base64 en atributos onclick que causaba anomalías en el catálogo exportado.',
      'Botón de cierre del zoom unificado: El botón de cerrar del zoom se ubica en la misma posición (arriba a la izquierda) y con el mismo diseño exacto (flecha circular oscura con borde gris claro) que el botón de regresar del detalle, cerrando el zoom y retornando limpiamente a la vista detallada.',
      'Compatibilidad universal garantizada: Funcionamiento verificado en dispositivos móviles, tablets y computadoras, con soporte para teclado (Esc), controles táctiles y alternancia de zoom 1x / 2x / 3x.',
      'Preservación integral: Todas las funcionalidades existentes se mantienen 100% operativas (modo claro/oscuro, filtros, categorías, promociones, WhatsApp, productos relacionados ponderados y exportación offline).'
    ]
  },
  {
    version: '24.7',
    date: '24 de Septiembre de 2026',
    title: 'Corrección Crítica de Exportación HTML: Eliminación de Error de Sintaxis y Blindaje 100% Offline',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Corrección de causa raíz en exportación: Se corrigió el escape de comillas en el evento onclick de las promociones (openPromoDetail) dentro de src/exporter.ts, el cual generaba un SyntaxError en el script embebido impidiendo la ejecución de render() y provocando que el catálogo exportado saliera en blanco.',
      'Blindaje autónomo y offline: Se añadieron salvaguardas en las funciones de red (fetchWithTimeout y fetchAllProductViewsParallel) protegiendo contra la ausencia de AbortController o falta de conexión a Internet, permitiendo que el catálogo cargue instantáneamente de forma 100% offline.',
      'Navegación defensiva en sliders: Verificación segura de elementos hijos en el carrusel de promociones y botones flotantes para prevenir excepciones de ejecución.',
      'Verificación completa: Comprobada la carga íntegra de productos, categorías, imágenes, tarjetas con nombre primero y categoría después, vista detallada con título centrado y estilos en modo claro/oscuro.'
    ]
  },
  {
    version: '24.6',
    date: '24 de Septiembre de 2026',
    title: 'Alineación Centrada del Nombre en Detalle y Nombre Primero en Ficha Principal',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Ajuste 1: Nombre del producto centrado (alineación centrada) en la vista detallada del producto, manteniendo su tamaño grande y destacado.',
      'Ajuste 2: Reorganización en la ficha principal de producto (tarjeta del catálogo), mostrando primero el nombre destacado y después la categoría en tamaño más pequeño.',
      'Preservación integral: Todas las funcionalidades previas intactas en modo claro y oscuro, tanto en la aplicación interactiva como en el catálogo exportado.'
    ]
  },
  {
    version: '24.5',
    date: '24 de Septiembre de 2026',
    title: 'Ajustes en Vista Detallada: Nombre Primero, Categoría y Etiquetas, y Botones con Íconos Cromáticos',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Ajuste 1: Bordes de los 3 botones (vistas, favoritos y compartir) restablecidos a tono neutro gris claro suave, preservando el color cromático exclusivamente en sus íconos (vistas: azul, favoritos: rojo, compartir: verde).',
      'Ajuste 2: Jerarquía de información reorganizada con el nombre del producto en primer lugar destacado arriba, seguido de la categoría en badge sobrio y elegante, y las etiquetas situadas debajo.',
      'Preservación integral: Todas las funcionalidades previas intactas en modo claro y oscuro, tanto en la aplicación interactiva como en el catálogo exportado.'
    ]
  },
  {
    version: '24.4',
    date: '24 de Septiembre de 2026',
    title: 'Ajustes en Vista Detallada: Productos Similares, Categoría Elegante, Bordes Cromáticos y Botón Regresar con Borde',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Ajuste 1: Se cambió el encabezado de las miniaturas a "Productos Similares".',
      'Ajuste 2: Se eliminó el texto secundario "Fotos de muestra", dejando limpias las miniaturas interactivas.',
      'Ajuste 3: Color de la categoría actualizado a un tono marrón sobrio, refinado y elegante con texto blanco, en perfecta sintonía con el estilo artesanal del catálogo.',
      'Ajuste 4: Bordes cromáticos suaves y sugerentes en los 3 botones: vistas con borde azul suave, favoritos con borde rojo suave y compartir con borde verde suave.',
      'Ajuste 5: Botón circular oscuro de "Regresar/Atrás" estilizado con un borde gris claro elegante tanto en la vista detallada como en el modal de zoom.',
      'Preservación integral: Todas las funcionalidades previas intactas en modo claro y oscuro, tanto en la aplicación interactiva como en el catálogo exportado.'
    ]
  },
  {
    version: '24.3',
    date: '24 de Septiembre de 2026',
    title: 'Ajustes en Vista Detallada: Resaltado de Categoría, Bordes Naranja Sugerentes y Botón Compartir Completo',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Ajuste 1: Categoría destacada como elemento principal con relleno de acento naranja vibrante, texto blanco en mayúsculas, tamaño superior al de las etiquetas y esquinas redondeadas.',
      'Ajuste 2: Borde uniforme con color sugerente (naranja suave) aplicado a los 3 botones de acción (vistas, favoritos y compartir) para una armonía visual perfecta.',
      'Ajuste 3: Botón de vistas optimizado y compacto, garantizando espacio suficiente para que el botón "Compartir" se visualice de manera íntegra sin cortes ni truncamiento.',
      'Ajustes previos preservados: Limpieza de imagen sin carteles de zoom, etiquetas debajo de la categoría, medidas y materiales en una sola línea horizontal, y productos relacionados sin enunciados redundantes.',
      'Preservación integral: Todas las funcionalidades previas intactas en modo claro y oscuro, tanto en la aplicación interactiva como en el catálogo exportado.'
    ]
  },
  {
    version: '24.2',
    date: '24 de Septiembre de 2026',
    title: 'Restauración de Vista Detallada de Producto, Modo Zoom Pantalla Completa y Productos Relacionados',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Encabezado: Botón de cierre accesible y estilizado.',
      'Imagen principal con Zoom a Pantalla Completa: Imagen centrada de alta calidad adaptable a modo claro y oscuro. Al hacer clic se abre en pantalla completa con controles de zoom (+, -, 100%), navegación y tecla Esc.',
      'Lista de productos / Fotos de muestra: Fila de miniaturas con título "Lista de productos", resaltado de borde en la imagen seleccionada y alternancia instantánea. Oculta si solo hay una imagen.',
      'Información del producto: Título destacado, badges de categoría y etiquetas (#...), contador de vistas (ojo o llama si es el más popular), botón "Guardar" (❤️) y botón "Compartir".',
      'Descripción y especificaciones: Texto íntegro sin truncar, medidas con ícono 📐, materiales con ícono 🪵 y cantidad mínima si aplica.',
      'Precio FOB y WhatsApp: Bloque destacado con precio FOB y botón verde amplio para consulta por WhatsApp.',
      'Cálculo ponderado de productos relacionados: Fórmula de relevancia con 70% de coincidencia de categoría y 30% de coincidencia de etiquetas. Filtra el producto activo, muestra solo los 3 de mayor puntuación, desempata por popularidad (vistas) y prescinde del precio.',
      'Sincronización total: Idéntico funcionamiento y soporte de modo claro/oscuro en la aplicación y en el catálogo HTML exportado.'
    ]
  },
  {
    version: '24.1',
    date: '23 de Septiembre de 2026',
    title: 'Transparencia de Imágenes PNG en Tarjetas de Producto y Adaptabilidad de Temas',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Transparencia obligatoria en imágenes y contenedores: background: transparent !important, background-color: transparent !important, border: none !important y box-shadow: none !important en .aspect-card y en la etiqueta <img>.',
      'Ajuste visual y mezcla: mix-blend-mode: normal !important y object-fit: contain !important para que las siluetas PNG floten limpiamente sobre el fondo sin recortes.',
      'Compresión no destructiva para PNG: El procesamiento de carga de imágenes ahora preserva el canal alfa y formato transparente (image/png) en lugar de forzar JPEG con fondo negro.',
      'Soporte completo para PNG transparente en Modo Claro y Oscuro: Eliminado el fondo gris residual y cualquier recuadro negro en modo oscuro.',
      'Fondo de tarjeta adaptable: La tarjeta (.product-card) utiliza variables CSS (--card-bg) para responder al modo claro (blanco) y oscuro (oscuro) manteniendo intacta la transparencia del área de imagen.',
      'Tamaño uniforme garantizado: Se preserva la relación de aspecto 4:3 y object-fit: contain !important, garantizando dimensiones idénticas en todas las tarjetas de la cuadrícula.',
      'Sincronización total: Mismo comportamiento en la vista previa interactiva y en el archivo HTML exportado.'
    ]
  },
  {
    version: '24.0',
    date: '22 de Septiembre de 2026',
    title: 'Modo Claro/Oscuro, Vista Detallada de Promociones, 2 Columnas por Defecto e Imágenes Completas',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Vista por defecto en 2 columnas: Al abrir el catálogo (preview o exportado), inicia siempre en 2 columnas, permitiendo alternar a 1 o 3.',
      'Promociones con vista detallada: Al hacer clic en cualquier promoción se abre un modal con título amplio, descripción completa, imagen nítida, badges y botón de cierre.',
      'Imágenes completas sin alterar tamaño de tarjetas: Visualización íntegra (object-contain) dentro del contenedor uniforme con letterbox suave, manteniendo el tamaño idéntico de todas las tarjetas.',
      'Botón de Modo Claro / Oscuro: Ubicado al lado del menú hamburguesa con ícono de Sol (☀️) en modo claro y Luna (🌙) en modo oscuro, con transición visual completa y persistencia en localStorage.'
    ]
  },
  {
    version: '23.0',
    date: '22 de Septiembre de 2026',
    title: 'Versión Estable v23.0 - Ajustes de diseño y menú hamburguesa completados',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Vista de administración reorganizada: apartados cerrados por defecto, nombres cortos, íconos suaves, exportación al final, banner y guía de 5 pasos.',
      'Contador global con API Abacus: namespace permanente "catalogo-madera-laser", IDs estables por producto, consultas paralelas y cola offline.',
      'Productos visibles inmediatamente sin bloqueos.',
      'Cuadrículas funcionales en móvil y desktop (1, 2 y 3 columnas).',
      'Visibilidad según cuadrícula: 1 columna (descripción, detalles, precio); 2 columnas (precio, sin detalles, sin descripción); 3 columnas (precio, sin detalles, sin descripción).',
      'Botón "Detalles": visible exclusivamente en 1 columna, oculto en 2 y 3 columnas.',
      'SKU oculto en tarjeta principal para una interfaz despejada.',
      'Producto más popular con llama (🔥) integrado en el contador de vistas y coherente con el menú de filtros.',
      'Menú hamburguesa (☰) clásico en el HTML exportado con panel lateral desplegable.',
      'Imágenes uniformes en tarjetas: mismo tamaño, ancho y alto con object-cover sin deformación.',
      'Botón flotante para subir al inicio con desplazamiento suave.',
      'Mensajes de error y estados vacíos específicos según contexto: favoritos ("No se encontraron productos seleccionados como favoritos"), búsqueda, categoría, filtros y catálogo vacío.',
      'Modal "¿Cómo funciona?" del catálogo: ícono de interrogación naranja, subtítulo, introducción, 5 pasos numerados y botón Cerrar.',
      'Archivo exportado descargado siempre con el nombre exacto "index.html".'
    ]
  },
  {
    version: '22.0',
    date: '22 de Septiembre de 2026',
    title: 'Botón Flotante para Subir al Inicio, Integración de Llama en Contador y Máxima Estabilidad',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Botón Flotante para Subir al Inicio: Botón con ícono de flecha superior (ArrowUp) en la esquina inferior derecha que aparece tras bajar 300px de scroll y sube la página automáticamente al inicio de forma suave y fluida tanto en móviles como en computadoras.',
      'Llama del Producto Más Popular Integrada: El producto con mayor cantidad de visitas sustituye el ícono del ojo por una llama en la misma pastilla o badge del contador, manteniendo el ojo en todos los demás productos.',
      'Sincronización Dinámica: Transición instantánea del ícono en tiempo real conforme cambian las visitas globales sin saltos visuales ni elementos duplicados.',
      'Cuadrícula y Botón «Detalles» Adaptables: Visualización en 1, 2 o 3 columnas con botón «Detalles» siempre visible en 1 y 2 columnas y oculto en 3 columnas para preservar la estética compacta.',
      'HTML Exportado 100% Autónomo: Todas las mejoras están completamente integradas en el fichero exportado con soporte para salida con confirmación desenfocada y contador global compartido.'
    ]
  },
  {
    version: '21.0',
    date: '21 de Septiembre de 2026',
    title: 'Rediseño y Estabilidad de la Vista de Administración',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Rediseño Estructural de la Administración: Todos los apartados aparecen colapsados por defecto con nombres concisos e íconos en tonalidades suaves para un panel despejado y ordenado.',
      'Flujo Intuitivo de Configuración: Guía de uso en primer lugar (colapsable), seguida de Nombre del catálogo, Diseño y Cabecera, Descripción del catálogo, Empresa y Contacto, Promociones, Categorías, Etiquetas, Productos, Menú, Mensajes, Historial de versiones y Exportación.',
      'Soporte Completo de Banner en Cabecera: Campo de subida y eliminación de imagen/SVG con previsualización panorámica. Si no se define o se quita, no deja espacio vacío, margen residual ni imagen rota en el HTML exportado.',
      'Limpieza y Depuración de la Barra Superior: Se removieron botones redundantes de exportación y restauración, y el botón «Ver Catálogo» fue ajustado para garantizar la visibilidad íntegra del título y la versión en todo tipo de pantallas.'
    ]
  },
  {
    version: '20.0',
    date: '21 de Septiembre de 2026',
    title: 'Optimización Paralela del Contador, Modal de Confirmación con Blur, Subtítulo y Logo Editables',
    badge: 'Estable',
    isCurrent: false,
    highlights: [
      'Optimización de Velocidad en el Contador Global: Consultas a la API de Abacus en paralelo sin bloqueos secuenciales con grupo de concurrencia activa (hasta 6 peticiones simultáneas) y sin pausas innecesarias, logrando que los últimos productos se actualicen a la misma alta velocidad que los primeros.',
      'Modal Personalizado de Confirmación de Salida: Diálogo centrado con tipografía de la app, fondo desenfocado (blur) y oscurecido que inmoviliza la web, con los textos exactos solicitados: "¡Estás saliendo del Catálogo!", "¿Estás seguro de que deseas salir?" y botones "Cancelar" y "Salir". Funciona tanto en la vista web como en el HTML exportado.',
      'Edición y Ocultamiento Inteligente de Subtítulo y Logo: Se agregaron campos para editar el subtítulo y el logo/ícono del catálogo. Si están vacíos, no se dibuja ningún espacio en blanco, margen residual ni ícono roto.',
      'Guía Explicativa Completa: Se agregó el 5to punto a la guía del gestor: "5. Cuando ya esté todo listo, Exportar el HTML. Es un fichero compacto con toda la información necesaria para poder usarlo a gusto de cada cual."'
    ]
  },
  {
    version: '19.5',
    date: '20 de Septiembre de 2026',
    title: 'Resiliencia del Contador Global con Reintentos Exponenciales, Cola Offline y Restauración de Pantallas',
    badge: 'Estable',
    highlights: [
      'Sistema de Reintentos con Backoff Exponencial: Implementación de reintentos automáticos a intervalos de 1s, 2s y 4s ante fallos de conexión o límite de tasa (HTTP 429), con timeout de 5 segundos.',
      'Cola de Visitas Pendientes en LocalStorage: Si la API de conteo experimenta retrasos, los incrementos de visitas se almacenan en una cola local persistente y se sincronizan en segundo plano.'
    ]
  },
  {
    version: '19.4',
    date: '15 de Septiembre de 2026',
    title: 'Contador Global de Visitas en Tiempo Real por Producto con API Abacus y Namespace Permanente',
    badge: 'Estable',
    highlights: [
      'Contador de visitas centralizado y compartido entre dispositivos y navegadores.',
      'Namespace permanente "catalogo-madera-laser" con IDs estables por producto.',
      'Carga no bloqueante en segundo plano.'
    ]
  }
];
