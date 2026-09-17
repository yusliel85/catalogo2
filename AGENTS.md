# Terminología del Proyecto y Entornos

A partir de ahora se utiliza la siguiente nomenclatura para referirse a las distintas pantallas, modos y archivos exportados:

- **chat código** o **chat**: La interfaz de desarrollo, editor y chat en Google AI Studio.
- **administración uno**: Panel de administración al acceder desde el navegador web.
- **demo uno**: Vista previa o catálogo interactivo al acceder desde el navegador web.
- **administración dos**: Panel de administración en la aplicación móvil instalada en el teléfono (PWA).
- **demo dos**: Vista previa o catálogo interactivo en la aplicación móvil instalada en el teléfono (PWA).
- **HTML uno**: Archivo HTML autónomo exportado desde el navegador web.
- **HTML dos**: Archivo HTML autónomo exportado desde la aplicación móvil instalada.

*Regla nemotécnica:*
- **Entorno 1 (uno):** Versión / exportación desde el **Navegador Web**.
- **Entorno 2 (dos):** Versión / exportación desde la **Aplicación Móvil** instalada en el teléfono.

---

# Reglas de Diseño e Integridad Visual

- **Protección Visual de Administración (Administración Uno y Administración Dos)**:
  Queda **ESTRICTAMENTE PROHIBIDO** alterar o modificar la estructura visual, colores de iconos de apartado, maquetación o diseño estético de los paneles de **administración uno** y **administración dos** mientras se implementen otras funcionalidades, correcciones o cambios en el código, **A MENOS QUE EL USUARIO LO SOLICITE PUNTUALMENTE DE FORMA EXPRESA**. La apariencia visual actual ha sido aprobada y congelada como la versión definitiva preferida por el usuario.

---

# Reglas de Funcionalidad Integral (CRUD Completo Autónomo)

- **Ciclo Completo de Gestión para Toda Funcionalidad**: Para cada funcionalidad o entidad gestionable agregada o existente en la aplicación (productos, categorías, etiquetas, promociones, bloques informativos, opciones de menú, etc.), se deben implementar de forma automática y completa todas las operaciones de ciclo de vida: **Crear**, **Visualizar**, **Editar** y **Eliminar** (con confirmación segura), sin necesidad de que el usuario lo solicite expresamente.
- **Accesibilidad Móvil y Táctil (Sin Dependencia de Hover)**: Todos los controles de acción (botones de editar, eliminar, guardar, cancelar) deben ser visibles y directamente interactuables en dispositivos móviles y pantallas táctiles (administración dos y demo dos), estando estrictamente prohibido ocultar controles críticos detrás de pseudo-clases como `group-hover:opacity-100` con `opacity-0` que impidan su uso en pantallas táctiles.

---

# Reglas de Versionado e Historial de Versiones

- **Numeración Consecutiva:** Cada versión nueva incrementará consecutivamente (p. ej., 17.7, 17.8, 17.9 -> 18.0).
- **Consolidación de Versiones Mayores:** Al alcanzar un número entero o versión mayor (por ejemplo la versión 18.0), todas las subversiones de la serie anterior (17.x) se consolidarán en un único registro resumen de la versión mayor previa (v17.0) con sus puntos más destacados agrupados para ahorrar espacio y mantener el historial compacto y ordenado.

