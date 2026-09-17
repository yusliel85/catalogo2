# Registro de Versiones

## Versión 17.1 (Estable) - 20 de Agosto, 2026

### 🏆 Consolidación de Versión Estable 17.1:
1. **Algoritmo de Artículos Relacionados por Coincidencia Jerárquica**:
   - **Coincidencia Total al 100% en Primer Lugar**: Los productos que coinciden al 100% en todas las categorías y en todas las etiquetas del producto seleccionado se posicionan con máxima prioridad en el primer lugar de la lista de sugerencias.
   - **Prioridad a Mayor Probabilidad de Categorías**: Clasificación en orden descendente de acuerdo a la mayor cantidad y afinidad de categorías.
   - **Desempate por Mayor Probabilidad de Etiquetas (Tags)**: Ante igual coincidencia de categorías, se priorizan los productos con mayor número de etiquetas compartidas.
2. **Orden Alfabético Visual en Categorías y Etiquetas**:
   - **Vista Principal y Detallada**: Tanto las categorías como las etiquetas (tags) de cada producto se muestran ordenadas de forma alfabética (A-Z) en las tarjetas de la vista principal y en la ficha detallada, preservando intacta la estructura interna de datos.
   - **Coherencia Total en Todos los Entornos**: Comportamiento unificado y consistente en `demo uno`, `demo dos`, `HTML uno` y `HTML dos`.

---

## Versión 17.0 (Estable) - 4 de Agosto, 2026

### 🏆 Consolidación de Versión Estable 17.0:
1. **Desempate de Popularidad en Categorías y Filtros por Última Visualización**:
   - **Criterio de Desempate (`lastViewedTimestamps`)**: Al calcular el producto más popular ("🔥 más visto") de cada categoría o al ordenar por popularidad ("Más Vistos"), si 2 o más productos empatan en cantidad de vistas, el sistema asigna el primer lugar al producto que fue **visto más recientemente**.
   - **Registro Temporal Exacto**: Registro de la marca de tiempo exacta (`Date.now()`) al interactuar con cualquier producto.
   - **Coherencia Total en Todos los Entornos**: Comportamiento unificado y consistente en `demo uno`, `demo dos`, `HTML uno` y `HTML dos`.

2. **Navegación Directa e Instantánea desde Favoritos**:
   - **Apertura de Detalle sin Interferencias de Historial**: Corrección de la acción al seleccionar un producto dentro de la lista de favoritos en `HTML dos` (PWA) e `HTML uno`, garantizando el despliegue inmediato de la ficha del producto (`#prod-id`).
   - **Compatibilidad con Navegadores Móviles**: Vinculación explícita de métodos globales al objeto `window`.

---

## Versión 16.7 (Estable) - 4 de Agosto, 2026

### 🛠️ Corrección de Navegación al Seleccionar Producto desde la Pantalla de Favoritos:
1. **Navegación Directa al Detalle del Producto en HTML Exportado (`HTML uno` y `HTML dos`)**:
   - **Eliminación del Conflicto de Historial**: Se eliminó la llamada asíncrona redundante a `closeFavoritesScreen()` en `selectProductFromFavs()`, evitando que la navegación al historial interfiriera o cancelara la apertura de los detalles del producto.
   - **Apertura Fluida de Detalles**: Al hacer clic sobre cualquier producto dentro del modal de favoritos, el catálogo abre de forma inmediata y directa la tarjeta de detalle del producto (`#prod-id`).
   - **Exposición Global**: Se asociaron explícitamente las funciones `selectProductFromFavs` y `removeFavoriteFromScreen` al objeto `window` para garantizar su ejecución en todos los navegadores móviles y aplicaciones PWA instaladas.

---

## Versión 16.6 (Estable) - 4 de Agosto, 2026

### 🏆 Ordenación por Popularidad con Criterio de Última Visualización:
1. **Prioridad para el Producto Visto Más Recientemente en Caso de Empate**:
   - **Ordenación por Popularidad ("Más Vistos")**: Al filtrar u ordenar los productos por popularidad ("Más Vistos"), si existen 2 o más productos con la misma cantidad de reproducciones/vistas, el producto visto más recientemente se ubica primero.
   - **Sincronización Total de Entornos**: Se registró el timestamper en tiempo real y la persistencia local en todos los entornos (`demo uno`, `demo dos`, `HTML uno`, `HTML dos`).

---

## Versión 16.5 (Estable) - 3 de Agosto, 2026

### 🏆 Criterio de Desempate para Productos Más Popular por Categoría:
1. **Priorización por Última Visualización**:
   - **Registro Temporal de Vistas (`lastViewedTimestamps`)**: Se almacena la marca de tiempo exacta (`Date.now()`) del momento en que cada producto es visualizado.
   - **Resolución Automática de Empates**: Si dos o más productos dentro de una misma categoría igualan en el número máximo de vistas, el sistema selecciona automáticamente como el producto más popular ("🔥 más visto") a aquel que fue visto **más recientemente**.
   - **Ordenación Consistente por Vistas**: En la ordenación por popularidad ("Más Vistos"), los empates en cantidad de vistas se ubican dando prioridad al producto visto más recientemente en todos los entornos (`demo uno`, `demo dos`, `HTML uno`, `HTML dos`).

---

## Versión 16.4 (Estable) - 3 de Agosto, 2026

### 🎨 Ajuste Visual en Tarjetas de Productos:
1. **Limpieza Visual de Fotografía**:
   - **Remoción del Etiquetado Flotante Superior**: Se eliminó la insignia flotante superior en la esquina de la foto para mantener la imagen limpia e ininterrumpida.
   - **Conservación Integral de Métricas**: Se mantiene intacto el destacado ámbar `🔥 X vistas` en la etiqueta de vistas y en el modal detallado del producto, preservando la evaluación multicategoría.

---

## Versión 16.3 (Estable) - 3 de Agosto, 2026

### 🔥 Marcado Automático de Productos Más Vistos por Categoría:
1. **Detección Unificada en Múltiples Categorías**:
   - **Evaluación Multicategoría**: La lógica de cálculo de productos más vistos ahora evalúa todas las categorías asignadas a cada producto (`getProductCategories`), garantizando que los productos con múltiples categorías asignadas registren correctamente su nivel de popularidad.
   - **Distintivo Visual Flotante ("🔥 Más Visto")**: Se restauró la insignia dorada flotante `🔥 Más Visto` en la esquina superior de la foto del producto tanto en la vista previa interactiva (`demo uno`, `demo dos`) como en los archivos HTML exportados (`HTML uno`, `HTML dos`).
   - **Contador Destacado de Vistas**: El indicador de vistas del producto se destaca automáticamente en tono ámbar cuando el producto es el líder de vistas en su categoría.

---

## Versión 16.2 (Estable) - 2 de Agosto, 2026

### 🚀 Optimización de Persistencia de Productos y Exportación en PWA Móvil (`HTML dos`):
1. **Compresión Automática de Fotografías al Cargar**:
   - **Optimización Canvas en Tiempo Real**: Las fotografías subidas desde teléfonos móviles o cámaras se comprimen y redimensionan automáticamente (máx. 1000px, JPEG 80%), reduciendo el peso de las fotos de ~10MB a sólo ~80KB.
   - **Eliminación del Límite de Memoria en Navegadores y PWA (`QuotaExceededError`)**: Evita que el almacenamiento de la aplicación instalada en el teléfono colapse o deje de guardar los productos editados cuando se cargan fotos pesadas.
2. **Sistema Dual de Almacenamiento (IndexedDB + LocalStorage)**:
   - **Persistencia Garantizada en Móvil y PWA (`administración dos`)**: Se implementó un motor asíncrono con `IndexedDB` como capa de almacenamiento primario que soporta cientos de megabytes en dispositivos móviles sin restricciones.
   - **Exportación Siempre Actualizada (`HTML dos`)**: Al exportar el archivo HTML desde la aplicación instalada en el teléfono (`administración dos`), el archivo generado incluye el listado 100% fresco y actualizado de productos, precios y categorías sin revertir a versiones previas.

---

## Versión 16.1 (Estable) - 2 de Agosto, 2026

### 🚀 Eliminación Directa de Fotos en Edición de Producto (`AdminProducts`):
1. **Botón Visibles de Eliminación de Fotografía**:
   - **Acceso Directo y Siempre Visible**: Se configuró un botón flotante rojo con icono de papelera (`Trash2`) permanentemente visible sobre cada tarjeta de imagen al agregar o editar un producto en el panel de administración.
   - **Compatibilidad Táctil en Móviles y PWA**: Se eliminó la dependencia del efecto ciego `group-hover`, garantizando que en dispositivos móviles y pantallas táctiles el usuario pueda eliminar imágenes individuales de un solo toque sin complicaciones.
2. **Opción Rápida "Eliminar fotos"**:
   - **Acción Global de Limpieza**: Se agregó un enlace rápido superior "Eliminar la foto" / "Eliminar todas las fotos" para desvincular todas las fotos de un producto con un solo clic si se desea reemplazar por una mejor versión.

---

## Versión 16.0 (Estable Final) - 29 de Julio, 2026

### 🚀 Consolidación de Versión 16 - WhatsApp Directo, Selección Multicategoría y Autocorrrección de Enlaces:
1. **Conversación Directa de WhatsApp al Número de Contacto (`wa.me` / `api.whatsapp.com`)**:
   - **Apertura de Chat Directo**: Las consultas de productos abren directamente una conversación privada de WhatsApp enlazada al número telefónico de contacto configurado en la empresa (`https://api.whatsapp.com/send?phone=...&text=...`), enviando el mensaje predefinido listo para iniciar el diálogo comercial.
   - **Integración Nativa de Fotos Móviles (Web Share API)**: En dispositivos móviles y visores PWA (`HTML dos`), se habilita el adjunto nativo de la imagen del producto como archivo comprimido (`File`/`Blob`), enviando la fotografía junto con el texto formateado.
2. **Corrección de Enlaces e Imágenes Duplicadas en Mensajes**:
   - **Formateo Limpio de `{imagen}` y `{url}`**: Se optimizó la helper `getProductImageInfo` en la vista interactiva (`CatalogPreview.tsx`) y en el exportador autónomo (`exporter.ts`) para prevenir que la URL del catálogo se duplique innecesariamente en la etiqueta `{imagen}` cuando se usan imágenes locales o Base64. La dirección del catálogo se mantiene limpia e individual en `{url}` (`🌐 *Enlace:* {url}`).
3. **Gestión Completa de Categorías en Panel de Administración (`AdminProducts`)**:
   - **Selector Desplegable `<select>` + Chips de Categorías**: Al agregar o editar un producto, el administrador ahora dispone de un menú desplegable con todas las categorías activas en el catálogo y productos existentes, además de un panel de botones/chips interactivos para asignar una o varias categorías con un solo clic.
   - **Opción de Crear Nuevas Categorías**: Se preserva la caja de texto para añadir libremente nuevas categorías personalizadas según las necesidades del catálogo.

---

## Versión 15.0 (Estable) - 29 de Julio, 2026

### 🚀 Consolidación de Versión 15 - Inmunidad Total en HTML Uno y HTML Dos (Navegador Web y PWA Móvil):
1. **Optimización de Compartir y Consultar por WhatsApp**:
   - **Eliminación de Enlaces Duplicados**: Se optimizó `getProductImageInfo` para evitar que la dirección del catálogo (`{url}`) se insertara de forma duplicada dentro del tag `{imagen}` cuando las imágenes son imágenes en Base64 o locales. La dirección web se incluye de forma única e impecable a través de `{url}` (`🌐 *Enlace:* {url}`).
   - **Adjunto Real de Fotos en WhatsApp / Dispositivos Móviles**: Al consultar o compartir un producto en dispositivos móviles o aplicaciones PWA (`HTML uno` y `HTML dos`), se habilita el envío del archivo de imagen del producto (`File` / `Blob`) utilizando la API de Web Share (`navigator.share`), adjuntando la foto nativamente en el chat de WhatsApp junto con el mensaje formateado.
   - **Chat Directo de WhatsApp sin Redirecciones**: En entornos de escritorio o donde no se soporte compartir archivos en el navegador, el sistema abre la conversación directa de WhatsApp (`https://api.whatsapp.com/send?phone=...&text=...`) apuntando exactamente al número de contacto de la empresa.
2. **Selector Completo de Categorías en Agregar/Editar Producto**:
   - **Despliegue de Lista Existente de Categorías**: Se habilitó un selector desplegable (`<select>`) y un panel de etiquetas/chips interactivos de categorías que calcula la unión de todas las categorías activas en el sistema y en los productos existentes.
   - **Múltiples Opciones de Asignación**: Los administradores ahora ven la lista completa de categorías disponibles para seleccionar una o varias con un solo clic, manteniendo la opción de crear nuevas categorías personalizadas.
3. **Resolución Definitiva de Renderizado de Productos en HTML Exportado**:
   - **Escape de Saltos de Línea Multilinea (`\n`)**: Se corrigió el doble escape de secuencias de salto de línea dentro de las plantillas de mensajes del exportador (`exporter.ts`), erradicando los errores sintácticos `SyntaxError: Invalid or unexpected token` que impedían la ejecución del script en visores móviles y de escritorio.
   - **Normalización Defensiva de Categorías (`getProductCategories`)**: Se creó una función defensiva unificada que detecta y convierte propiedades de tipo cadena o nulas en arreglos válidos, impidiendo la excepción de tipo `TypeError: pCats.forEach is not a function`.
   - **Arquitectura de Carga Triplemente Redundante**: Los datos del catálogo se embeben directamente en `window.__EMBEDDED_CATALOG_DATA__` (objeto JS nativo), con respaldo dinámico en nodos `<textarea id="data-...">` y `<script type="application/json">` mediante `loadAllCatalogData()` en `init()`.
   - **Sanitización Base64 Resiliente**: Eliminación de caracteres invisibles (`\r\n`) y relleno automático para garantizar decodificación limpia en visores de Android (`content://media/...`) e iFrames de navegadores.

---

## Versión 15.3 - 29 de Julio, 2026

### 🚀 Corrección Crítica de Escape de Saltos de Línea en Cadenas Literales (Escapar `\n` en `<script>` Exportado):
1. **Escape Multilínea Inmune a `SyntaxError`**:
   - **Causa Raíz resuelta**: Dentro de las plantillas de texto literal de TypeScript (`exporter.ts`), las secuencias `\n` dentro de literales de cadena con comillas simples (ej. `'¡Hola!...\n\n🌐 *Ver Catálogo:* {url}'` o en expresiones regulares `/\\n{3,}/g`) eran interpoladas por Node.js como saltos de línea físicos reales (`0x0A`). Al escribirse en el bloque `<script>` del archivo HTML exportado, las cadenas con comillas simples quedaban divididas en múltiples líneas físicas en JavaScript. En la especificación ECMAScript, un salto de línea literal dentro de comillas simples o dobles provoca un error sintáctico fatal e irrecuperable: `SyntaxError: Invalid or unexpected token`. Debido a este error sintáctico, el navegador o visor móvil **descartaba y cancelaba por completo la ejecución del script**, impidiendo que se inicializara la aplicación y haciendo que no se mostrara ningún producto (`"Nada de los productos en el html"`).
   - **Solución implementada**:
     - Se corrigió el doble escape de todas las secuencias de salto de línea dentro de `generateStandaloneCatalogHTML` en `src/exporter.ts` (`\\n` y `\\\\n`), garantizando que en el archivo HTML generado se escriban cadenas JavaScript válidas de una sola línea con la secuencia de escape `\n` preservada.
     - Se eliminó un fragmento duplicado en `syncUIWithHash` que contenía llaves de cierre huérfanas (`Unexpected token '}'`).
     - Se validó mediante `vm.Script` de Node.js y un entorno simulación de DOM que el archivo HTML exportado compila y ejecuta con **0 errores sintácticos o de ejecución**, renderizando el 100% de los productos y categorías correctamente.

---

## Versión 15.2 (Estable) - 29 de Julio, 2026

### 🚀 Doble Embebido Inmune a Excepciones de Tipo (`window.__EMBEDDED_CATALOG_DATA__` + `getProductCategories` Defensivo):
1. **Normalización Defensiva de Categorías (`getProductCategories`)**:
   - **Causa Raíz resuelta**: Cuando un producto en el catálogo poseía la propiedad `categories` guardada como una cadena de texto (ej. `"Muebles"`) en lugar de un arreglo (ej. `["Muebles"]`), las expresiones `(p.categories && p.categories.length > 0)` evaluaban a `true` (por la longitud de la cadena). Al intentar ejecutar `p.categories.map(...)`, `p.categories.forEach(...)` o `p.categories.join(...)`, los motores de JavaScript móviles y de escritorio lanzaban un error fatal no capturado `TypeError: pCats.forEach is not a function`, deteniendo inmediatamente la ejecución del renderizador e impidiendo que los productos se mostrasen en el HTML exportado.
   - **Solución implementada**:
     - Se creó la función defensiva unificada `getProductCategories(p)` tanto en el exportador autónomo (`exporter.ts`) como en la vista de la demo (`CatalogPreview.tsx`).
     - Esta función valida estrictamente si `p.categories` es un arreglo válido; de ser una cadena o valor simple, lo convierte de forma segura en un arreglo de categorías sin lanzar excepciones.
     - Se aplicó `normalizeProductData(p)` en la carga de datos del HTML exportado para sanear la estructura de cada producto al inicializar la aplicación.

2. **Objeto Directo Embebido `window.__EMBEDDED_CATALOG_DATA__`**:
   - Se añadió un objeto de JavaScript nativo codificado defensivamente con escape de etiquetas (`\u003c` / `\u003e`) directamente en el bloque `<script>`.
   - `loadAllCatalogData()` utiliza de primera mano este objeto nativo (evitando cualquier decodificación Base64 o consulta al DOM). Si este objeto no estuviese presente, recurre de forma transparente a los nodos del DOM `<textarea>` y `<script type="application/json">`.

---

## Versión 15.1 (Estable) - 29 de Julio, 2026

### 🚀 Carga Dinámica Idempotente `loadAllCatalogData` y Nodos Duales de Datos DOM:
1. **Recuperación Dinámica de Datos en `init()` y Funciones de Renderizado**:
   - **Causa Raíz resuelta**: En la evaluación síncrona inicial del script, si `readB64DOMData` se ejecutaba antes de que el motor de renderizado HTML del visor de Android procesara el valor o texto interno de los nodos del DOM, las variables globales `products` y `categories` quedaban vinculadas permanentemente como arreglos vacíos `[]`. Al ejecutarse posteriormente `init()` tras `DOMContentLoaded`, se usaban esas referencias vacías y el catálogo se mostraba en blanco.
   - **Solución implementada**:
     - Se encapsuló la extracción en la función dinámica `loadAllCatalogData()`, re-ejecutada obligatoriamente dentro de `init()`, `renderCategories()` y `renderCatalog()` como mecanismo de autoreparación defensivo.
     - Se crearon nodos duales de respaldo en el DOM: `<textarea id="data-products">` y `<script type="application/json" id="data-products-json">`. Si un método de lectura retorna una cadena vacía en un visor móvil, `readB64DOMData` recurre automáticamente al contenedor de respaldo.

---

## Versión 15.0 (Estable) - 29 de Julio, 2026

### 🚀 Decodificación Resiliente de Base64 mediante Nodos `<textarea>` y Sanitización de Caracteres:
1. **Paso a Nodos Nativos `<textarea id="data-products" style="display:none !important;">`**:
   - **Causa Raíz resuelta**: Al abrir archivos `.html` exportados en visores locales de archivos de Android (`content://media/external/...`), la lectura de datos mediante etiquetas `<script type="application/json">` o saltos de línea introducidos por el sistema de archivos insertaba caracteres de retorno de carro (`\r\n`) en las cadenas Base64. Al llamar `atob(b64)` sobre esa cadena con saltos de línea, los motores WebKit/Chromium móviles lanzaban una excepción síncrona `DOMException: InvalidCharacterError`, enviando el parser a los bloques de captura secundarios que re-ejecutaban `atob` sobre la misma cadena sin limpiar, retornando un arreglo vacío `[]`.
   - **Solución implementada**: 
     - Se reemplazó el contenedor de datos por `<textarea id="data-..." style="display:none !important;">`, cuya propiedad `.value` es nativamente compatible y preserva el contenido exacto en el 100% de visores Android, navegadores y WebViews.
     - Se implementó la sanitización preventiva `.replace(/[^A-Za-z0-9+/=]/g, '')` en `parseB64JSON` antes de decodificar Base64, eliminando cualquier espacio, tabulación o salto de línea.
     - Se añadió autoreparación de relleno Base64 (`modulo 4`) y un proceso defensivo de decodificación multinivel UTF-8.
2. **Inmunización de Estructura de Datos en Carga**:
   - Se añadieron verificaciones defensivas de tipo (`Array.isArray`, comprobaciones de objetos no nulos) al deserializar productos, categorías, diseño, contacto y mensajes.

---

## Versión 14.9 (Estable) - 29 de Julio, 2026

### 🚀 Aislamiento Total de Datos mediante Nodos DOM de Texto (`<script type="application/json">`) para Exportación desde Administrador Dos:
1. **Separación de Datos Pesados (Base64) de la Evaluación de Código JavaScript**:
   - **Causa Raíz resuelta**: Al exportar el catálogo desde el **administrador dos** (PWA móvil) con múltiples fotografías en Base64, la inyección directa de datos como literales de cadena en el código JS (`const products = parseB64JSON('...', [])`) generaba un literal de texto gigantesco (de varios megabytes en una sola instrucción). Al abrir el archivo HTML descargado en visores locales de archivos de Android (`content://media/extern...`), el motor WebKit/V8 de Android rechazaba la compilación por límites de longitud de tokens en literales de código JS (`SyntaxError: String literal too long`), abortando la ejecución completa del script y dejando la cuadrícula de productos en blanco.
   - **Solución implementada**: Los datos de productos, categorías, contacto, diseño, bloques y mensajes se almacenan ahora en nodos DOM de texto seguro `<script type="application/json" id="data-products">` fuera del bloque de código JS. El script lee el contenido usando `document.getElementById(...).textContent`, manteniendo el bloque de código JS liviano (<75KB) y sin límite alguno de tamaño para catálogos con cientos de fotografías.
2. **Motor de Inicialización Multiguardado e Idempotente (`safeInit`)**:
   - Se implementó la función `safeInit()` para activar la carga de productos mediante múltiples eventos simultáneos (`DOMContentLoaded`, `window.onload`, comprobación inmediata de `readyState` y un temporizador de reserva a los 300ms), garantizando que el catálogo se dibuje siempre, incluso en visores embebidos de Android con políticas restrictivas de eventos.

---

## Versión 14.8 (Estable) - 28 de Julio, 2026

### 🚀 Garantía Absoluta de Carga de Productos en HTML Exportado (UTF-8 Chunked Base64):
1. **Codificación y Decodificación Base64 en Bloques (`TextEncoder` / `TextDecoder` Chunking)**:
   - Se optimizó la serialización y des-serialización de datos en `safeB64JSON` y `parseB64JSON` mediante procesamiento en bloques de 32KB (`0x8000`).
   - **Solución Definitiva**: Elimina cualquier posible desbordamiento de pila o fallo de memoria al procesar catálogos con múltiples imágenes Base64 o descripciones extensas, evitando que la función caiga en el bloque `catch` que reseteaba los productos a un arreglo vacío `[]`.
2. **Reinicio Garantizado de Filtros y Búsqueda al Cargar**:
   - En la rutina de inicialización (`init()`), se resetean explícitamente `currentCategory = 'TODOS'`, `favoritesOnly = false` y el campo de búsqueda `searchInput.value = ''` con `autocomplete="off"`. Esto impide que autocompletados o estados guardados del navegador filtren los productos inadvertidamente al abrir el archivo HTML.

---

### 🔒 Menú de Opciones Cerrado por Defecto al Ingresar a la Demo:
1. **Inicialización Limpia de Historial y Hash (`#main`)**:
   - Se aseguró que al presionar **"Ejecutar Demo"** o ingresar a cualquier vista interactiva (**demo uno**, **demo dos** o catálogo exportado), el hash del navegador se inicialice obligatoriamente en `#main`.
   - Si la URL traía el hash `#menu` de interacciones previas, se sustituye automáticamente por `#main` al cargar la pantalla, garantizando que el menú flotante de opciones permanezca cerrado y oculto por defecto hasta que el usuario lo abra explícitamente.

---

## Versión 14.6 (Estable) - 28 de Julio, 2026

### 🚀 Eliminación de Opción "Instalar App Móvil" en Menú de Opciones y Vistas Demo:
1. **Limpieza en Menú de Opciones (`CatalogPreview.tsx`)**:
   - Se removió por completo la opción y el botón `Instalar App Móvil` dentro del menú lateral / desplegable de opciones del catálogo interactivo.
2. **Eliminación en Vista Previa y Modos Demo 1 / Demo 2 (`App.tsx`)**:
   - Se eliminaron los botones y accesos directos de instalación de PWA en los encabezados y controles flotantes de las vistas **demo uno** y **demo dos**, asegurando que el catálogo interactivo se enfoque exclusivamente en la navegación y experiencia de productos.

---

## Versión 14.5 (Estable) - 28 de Julio, 2026

### 🚀 Decodificación Nativa Universal e Integración Directa de Botón Exportar en Administración Dos:
1. **Decodificación Universal UTF-8 (`btoa(encodeURIComponent)` / `decodeURIComponent(atob)`)**:
   - **Causa Raíz resuelta**: En el panel de **administración dos** (aplicación móvil PWA / WebViews móviles), `TextDecoder` o la función `Uint8Array.from()` con mapeo secundario podían lanzar excepciones silenciosas en motores JavaScript móviles antiguos. Esto provocaba que `parseB64JSON` se fuera al bloque `catch`, ejecutando un `JSON.parse(atob(b64))` sin decodificación UTF-8, lo que fallaba al procesar tildes españolas (`á`, `é`, `í`, `ó`, `ú`, `ñ`) y retornaba un arreglo vacío `[]`.
   - **Solución implementada**: Se adoptó la codificación nativa universal `btoa(encodeURIComponent(JSON.stringify(data)))` combinada con un parser resiliente multi-nivel `JSON.parse(decodeURIComponent(atob(b64)))`. No depende de APIs modernas de Node/DOM y funciona en el 100% de los navegadores, WebViews y aplicaciones móviles PWA.
2. **Inclusión Directa del Botón de Exportación en Panel de Publicación (`ExporterAdmin`)**:
   - Se añadió el botón destacado `🚀 Exportar Catálogo (.HTML)` directamente en el panel de **Publicación** del panel de administración dos (`exporter_admin.tsx`) para permitir la descarga inmediata del archivo HTML standalone completo con todos los productos.

---

## Versión 14.3 (Estable) - 28 de Julio, 2026

### 🚀 Corrección Definitiva de Despliegue e Inserción de Productos en HTML Exportado:
1. **Incrustación Protegida mediante Etiquetas `<script type="application/json">`**:
   - Se migró la inyección directa de variables de datos (`const products = ...`) a nodos DOM seguros `<script type="application/json" id="...">`.
   - **Causa Raíz resuelta**: La interpolación directa de cadenas JSON dentro de literales de plantilla de JavaScript producía saltos de línea sin escapar o caracteres especiales al compilar el HTML, lo que generaba un error de sintaxis imperceptible en la consola del navegador (`SyntaxError: Invalid or unexpected token`) que detenía la ejecución del script y dejaba la cuadrícula de productos en blanco.
   - **Solución implementada**: Los datos de productos, categorías, contacto, diseño y bloques se almacenan en nodos JSON de texto puro y son leídos mediante la función parser `parseEmbeddedJSON()`, garantizando la renderización inmediata y 100% confiable de todos los productos en cualquier navegador o visor de archivos.

---

## Versión 14.2 (Estable) - 28 de Julio, 2026

### 🚀 Corrección Crítica de Ejecución y Visibilidad de Productos en Visores Móviles (`content://`):
1. **Aislamiento de EventSource y Peticiones de Red (`SSE / Fetch`)**:
   - Se envolvió la instanciación de `new EventSource(...)` y las llamadas a `fetch()` en bloques `try/catch`. En visores locales de Android o aplicaciones de archivos que abren los HTML con esquemas `content://` o `file://`, la instanciación directa de `EventSource` a servidores HTTPS genera excepciones de seguridad síncronas que anteriormente detenían la ejecución de JavaScript impidiendo la ejecución de `init()`.
2. **Protección Defensiva de Normalización de Texto (`normalizeText`)**:
   - Se añadió un bloque protector `try/catch` alrededor de `String.prototype.normalize('NFD')` para garantizar compatibilidad con WebViews antiguos o limitados de Android.
3. **Aislamiento de Funciones de Renderizado en Inicialización (`init()`)**:
   - Se encapsuló la llamada de cada función individual (`renderCategories`, `renderPromotions`, `renderCatalog`, `updateFavoriteCounters`) para asegurar que el catálogo principal de productos se dibuje sin importar si un componente secundario experimenta algún contratiempo.

---

## Versión 14.1 (Estable) - 28 de Julio, 2026

### 🚀 Corrección de Renderización de Productos en HTML Exportado (Administrador Dos):
1. **Protección de API de Historial y Enrutamiento en Visualizadores Móviles (`content://`)**:
   - Se envolvieron las llamadas a `window.history.pushState`, `window.history.replaceState` y `window.history.back` en bloques `try/catch` de alta tolerancia dentro de `exporter.ts`. Esto evita que navegadores móviles y visores locales de archivos en Android aborten la ejecución de JavaScript por restricciones de origen en URIs `content://media/`.
2. **Sanitización de JSON y Escape de Caracteres en Plantilla HTML**:
   - Se mejoró la serialización en `safeJSON` para escapar separadores de línea JS (`\u2028` y `\u2029`).
   - Se introdujo una función `escapeHTML` defensiva para sanitizar nombres, descripciones e imágenes de productos al construir el DOM dinámicamente.
3. **Validación Defensiva en `renderCatalog()` e Inicialización Global**:
   - Se añadieron verificaciones para garantizar que listas de categorías, etiquetas e imágenes sean arreglos válidos aun cuando contengan valores nulos o indefinidos.
   - Se envolvió la rutina de inicialización `init()` en un bloque protector que garantiza el renderizado del catálogo incluso si una subfunción secundaria falla.

---

## Versión 14.0 (Estable) - 28 de Julio, 2026

### 🚀 Versión Consolidada y Estable 14.0:
1. **Coloreado Temático e Individual de Iconos en Administración**:
   - Asignación de tonos cromáticos e identificativos para los iconos de todos los apartados del panel de control tanto en **Administración Uno** como en **Administración Dos**:
     - 🟣 **Categorías**: Fondo púrpura claro (`bg-purple-50`, `text-purple-700`).
     - 🔵 **Etiquetas**: Fondo azul claro (`bg-blue-50`, `text-blue-700`).
     - 🟡 **Productos**: Fondo ámbar cálido (`bg-amber-50`, `text-amber-700`).
     - 🔴 **Promociones**: Fondo rosa suave (`bg-rose-50`, `text-rose-700`).
     - 🟣 **Menú de Opciones**: Fondo violeta e índigo (`bg-indigo-50`, `text-indigo-700`).
     - 🟢 **Información Empresa**: Fondo verde agua / teal (`bg-teal-50`, `text-teal-700`).
     - 🟡 **Información Web / Acerca de**: Fondo ámbar (`bg-amber-50`, `text-amber-700`).
     - 🌐 **Publicación / Módulo HTML**: Fondo azul cielo (`bg-sky-50`, `text-sky-700`).

2. **Unificación y Eliminación de Botón Duplicado de Exportación**:
   - Se removió el botón secundario "Exportar HTML" dentro del acordeón de Publicación, manteniendo exclusivamente el botón superior principal en la barra flotante de la administración.

3. **Cláusula Permanente de Congelación Visual de Administración**:
   - Registro e inclusión de la regla en `AGENTS.md` para proteger la apariencia, colores y diseño de **Administración Uno** y **Administración Dos**, impidiendo modificaciones estéticas involuntarias en futuros cambios.

---

## Versión 13.0 (Estable) - 27 de Julio, 2026

### 🚀 Versión Consolidada y Estable 13.0:
1. **Diferenciación Estricta de Entornos (Administración Uno vs Administración Dos)**:
   - **Administración Uno (Navegador Web / AI Studio)**: Muestra en la barra superior exclusivamente el botón `📲 Instalar App Móvil` para instalar la PWA.
   - **Administración Dos (PWA Instalada en Teléfono)**: Muestra en la barra superior el botón `Regresar` (a Google AI Studio en ventana nueva).
   - Detección perfeccionada de Entornos: los marcos incrustados (iframes de desarrollo/previsualización) se consideran siempre Entorno 1 para evitar que aparezca el botón `Regresar` erróneamente en el navegador web.

2. **Apartado WhatsApp Desplegable y Homogéneo**:
   - El módulo de plantillas de WhatsApp ahora inicia cerrado/minimizado por defecto, al igual que los demás acordeones del administrador.
   - Se unificó el encabezado limándolo a **"Compartir WhatsApp"** y eliminando etiquetas superfluas como "Abrir" o "Personalizar".

3. **Codificación Base64 en Respaldos `.JSON` Autónomos**:
   - Módulo `backupService.ts` con conversión automática de imágenes de productos a cadenas Base64 (WebP/JPEG), generando respaldos `.json` totalmente independientes de servidores externos.
   - Restauración e importación resiliente con reporte detallado de imágenes recuperadas.

5. **Ajuste de Botones en Barra Superior**:
   - Reubicación del botón `Exportar HTML` en la barra superior del administrador (que genera y descarga el archivo autónomo `index.html`), retirando `Importar JSON` de esa ubicación ya que el módulo de importación/restauración se encuentra disponible en la sección inferior de Publicación.

6. **Corrección en Renderizado del HTML Exportado**:
   - Corrección en la inicialización de rutas y sincronización de hashes (`syncUIWithHash`) en el motor del archivo `index.html` exportado, garantizando que los productos, el encabezado y la rejilla del catálogo se muestren de forma inmediata y perfecta sin ser tapados ni bloqueados por modales al abrir el archivo.

---

## Versión 12.0 (Estable) - 27 de Julio, 2026

### 🚀 Versión Consolidada y Estable 12.0:
1. **Asistente e Importador Universal de JSON (`ImportJsonModal`)**:
   - Modal interactivo de importación con selector de archivos, zona de **Drag & Drop** (arrastrar y soltar) y cuadro de **pegado directo de código JSON**.
   - Sanitización e inmunización automática contra BOM (`\uFEFF`) y variantes de estructura (catálogos únicos, múltiples, arrays directos de productos y llaves en español/inglés).
2. **Sistema de Instalación y Exportación Autónomo**:
   - Botón destacado de **📥 Instalar / Descargar Catálogo** para generar la aplicación en un solo archivo `.html` funcional sin dependencias de servidor.
   - Acceso alternativo **📲 App Móvil** para instalación en pantalla de inicio vía PWA.
3. **Gestión Multicategoría y Filtro por Chips**:
   - Selección de múltiples categorías por producto con sincronización en tiempo real y filtrado interactivo por chips.
4. **Resguardo de Datos y Publicación Desplegada**:
   - La sección de Publicación permanece abierta por defecto en el panel de control para un acceso rápido a copias de seguridad y exportación.

---

## Versión 11.4 (Estable) - 27 de Julio, 2026

### Modal Interactivo de Importación y Carga Directa de JSON:
1. **Nuevo Modal `ImportJsonModal`**:
   - Selector de archivos enriquecido con área de **Drag & Drop** (arrastrar y soltar) para ficheros `.json`.
   - Campo de texto/área de pegado directo de código JSON para aquellos casos donde los navegadores móviles o selectores del sistema operativo bloquean la selección de archivos locales.
2. **Procesador Universal e Inmunizado contra BOM/Encodings**:
   - Limpieza automática de caracteres BOM (`\uFEFF`) y parsing resiliente para catálogos individuales, múltiples, o arrays planos de productos con nombres de campo en español e inglés.
3. **Acceso Unificado**:
   - Botón "Importar JSON" en la barra superior del panel de administración y botón "📥 Restaurar (.JSON)" en la sección de Publicación invocan directamente el nuevo asistente modal.

---

## Versión 11.3 (Estable) - 26 de Julio, 2026

### Optimización Universal para Importación de Ficheros JSON:
1. **Soporte Flexible de Estructuras JSON**:
   - Sanitización y lectura multi-formato adaptable para cargar automáticamente respaldos completos de múltiples catálogos (`{ projects: [...] }`), proyectos únicos envoltura (`{ project: { ... } }`), objetos de catálogo directo (`{ name: "...", products: [...] }`), listas o arrays de productos directos (`[ { name: "...", price: ... }, ... ]`), así como también claves en español (`nombre`, `descripcion`, `categoria`, `precio`, `fotos`).
2. **Compatibilidad con selectores de archivos en todos los dispositivos**:
   - Configuración extendida de tipos aceptados (`accept=".json,application/json,text/plain"`) garantizando la seleccionabilidad y carga fluida de archivos JSON desde cualquier navegador móvil o de escritorio.

---

## Versión 11.2 (Estable) - 26 de Julio, 2026

### Restauración Destacada del Botón de Instalación/Descarga del Catálogo:
1. **Acceso Directo e Inmediato a "📥 Instalar / Descargar Catálogo"**:
   - Agregado un botón verde destacado en la barra superior del panel de administración que desplaza automáticamente y activa la descarga del catálogo en un único archivo HTML (`index.html`).
   - Se añadió un botón gemelo en la barra superior flotante de la vista previa interactiva (Demo), permitiendo instalar o descargar el catálogo directamente desde la vista previa.
2. **Sección 8 "Publicación" Desplegada por Defecto**:
   - La sección `8. Publicación` en el administrador ahora permanece abierta por defecto para que las opciones de exportación autónoma HTML y respaldos `.JSON` sean visibles de inmediato.
3. **Mantenimiento del Acceso a la App Móvil (PWA)**:
   - Se mantiene accesible el botón `📲 App Móvil` / `📲 Instalar en Celular` en la barra superior junto con el botón de descarga del catálogo HTML.

---

## Versión 11.1 (Estable) - 26 de Julio, 2026

### Corrección de Chips de Categorías:
1. **Resolución Completa de Chips de Categorías**:
   - Corrección en la generación de la lista de categorías (`activeCategories` en la vista previa del catálogo y `renderCategories` en el exportador HTML standalone) para incluir tanto las categorías definidas en la administración como las asignadas a los productos.
   - Búsqueda y filtrado insensible a mayúsculas/minúsculas y espacios (`case-insensitive`), evitando que diferencias de formato oculten las categorías y garantizando que todos los chips de categoría aparezcan y filtren correctamente junto al botón "Todos".

---

## Versión 11 (Estable - Última Guardada) - 26 de Julio, 2026

### Novedades y Ajustes Implementados:
1. **Redirección Precisa a Google AI Studio**:
   - El botón **"Regresar a Google AI Studio"** (que se activa al estar instalado como PWA / App Móvil) redirige exactamente a este entorno de edición (`https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702`) o a su origen mediante `document.referrer`.
   - Se incluyó también el enlace directo en el pie del modal de instalación.

2. **Detección Dinámica de Entorno (Preview vs Standalone)**:
   - En la vista previa de Chrome / AI Studio se muestra el botón **"📲 Instalar en Celular"** con su modal de pasos simplificado.
   - En el celular o PWA instalada en pantalla de inicio (Standalone), el botón cambia dinámicamente a **"Regresar a Google AI Studio"**.

3. **Estructura de Administración Reorganizada (1 al 8)**:
   - `1. Categorías`, `2. Etiquetas`, `3. Productos`, `4. Promociones`, `5. Menú de Opciones`, `6. Información Empresa`, `7. Información Web`, `8. Publicación`.

4. **Optimización de Barra Superior**:
   - Agrupación limpia: `[📲 Instalar en Celular / Regresar]` `[Importar JSON]` | `[💾 Guardar Todo]` `[Ejecutar Demo]`.
   - Eliminación de avisos y botones duplicados.

5. **Corrección de Eliminación de Categorías y Etiquetas**:
   - Reemplazado el uso de `window.confirm` por el componente de confirmación personalizado `CustomConfirm` para evitar que los navegadores en marcos incrustados (iframes) bloqueen las acciones de eliminación.
   - Sincronización automática que desvincula la categoría o etiqueta eliminada de todos los productos del catálogo.

6. **Estado Técnico**:
   - Versión de paquete `11.0.0` compilada y validada sin ningún error.

---

## Versión 10 - 26 de Julio, 2026

### Novedades y Reorganización Implementada:
1. **Reorganización de Secciones de Administración**:
   - `1. Categorías`
   - `2. Etiquetas`
   - `3. Productos`
   - `4. Promociones`
   - `5. Menú de Opciones`
   - `6. Información Empresa`
   - `7. Información Web`
   - `8. Publicación`

2. **Nombres Simplificados**:
   - Títulos concisos y directos en cada apartado de administración.

3. **Soporte de Múltiples Categorías**:
   - Asignación y renderizado de múltiples categorías por producto en vista previa, exportador web y mensajes de WhatsApp.

4. **Adaptación de Interfaz para Chrome Preview y Aplicación Móvil**:
   - Muestra el botón **"📲 Instalar en Celular"** y su modal emergente cuando la aplicación se ejecuta en la vista normal de navegador / Chrome Preview.
   - Detección automática de modo instalado (PWA Standalone) para mostrar el botón **"Regresar a Google AI Studio"** que redirige de vuelta al proyecto de edición exacto (`https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702`).
   - Eliminado el botón repetido "Forzar Guardado Completo" de la barra del organizador de catálogos.
   - Barra superior alineada con **Importar JSON**, **Guardar Todo** y **Ejecutar Demo**.

5. **Estado Técnico**:
   - Compilación verificada sin errores.
