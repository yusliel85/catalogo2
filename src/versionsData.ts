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
    version: '19.1',
    date: '15 de Septiembre de 2026',
    title: 'Migración y Arquitectura Nativa Android (.APK) Autónoma e Independiente de Red',
    badge: 'Actual',
    isCurrent: true,
    highlights: [
      'Estructura Nativa AndroidX Completa: Creación del proyecto Android independiente en /android/ con MainActivity.kt, AndroidManifest.xml, build.gradle (SDK 34) y binario ejecutable gradlew.',
      'Autonomía 100% Offline Certificada: Empaquetado completo de todos los recursos del sistema en /assets/www/ con carga mediante WebViewAssetLoader, garantizando funcionamiento pleno en modo avión sin peticiones a servidores externos.',
      'Puente Bidireccional de Archivos y Descargas: Implementación de AndroidInterface (@JavascriptInterface) con método nativo saveFile para descargar los archivos HTML autónomos y respaldos JSON directamente en la carpeta Descargas de Android.',
      'Selector Nativo de Imágenes y Cámara: Integración de onShowFileChooser para seleccionar fotografías desde la galería o tomar fotos con la cámara en dispositivos Android sin restricciones.',
      'Descargador y Compilador del Proyecto: Módulo AdminAndroidExport con descarga directa del proyecto Android comprimido (CatalogExporter-Android-Project.zip), script automatizado npm run build:android y flujo de compilación para GitHub Actions.'
    ]
  },
  {
    version: '19.0',
    date: '25 de Agosto de 2026',
    title: 'Apartados Inicialmente Plegados en Administración (Web y Móvil) y Consolidación de Versión Mayor',
    badge: 'Estable',
    highlights: [
      'Versión Marcada como Última Más Estable: Fijación y consolidación formal de la versión 19.0 como la última versión más estable, activa y definitiva del catálogo en todos los entornos.',
      'Apartados Inicialmente Recogidos en Administración: En administración uno (panel web) y administración dos (PWA móvil instalada), todos los apartados (Productos, Publicación, Categorías, Etiquetas, Promociones, Menú de Opciones, Mensajes, Empresa, Web e Historial de Versiones) inician recogidos/plegados de forma ordenada.',
      'Apertura Selectiva a Demanda: Cada sección muestra de forma compacta su ícono, título y resumen informativo clave, desplegándose únicamente cuando el usuario decide pulsar sobre ella para gestionarla.',
      'Navegación Móvil Despejada y Ergonómica: Eliminación de desplazamientos excesivos y pantallas abarrotadas en dispositivos móviles y táctiles, ofreciendo una experiencia ejecutiva, fluida y enfocada.',
      'Sincronización Total Multi-Entorno: Comportamiento uniforme en administración uno y administración dos, manteniendo intacta la estructura estética aprobada, el ciclo CRUD completo y el ordenamiento determinístico.'
    ]
  },
  {
    version: '18.0',
    date: '25 de Agosto de 2026',
    title: 'Serie v18.x — Orden Determinístico, CRUD Autónomo Táctil, Precios Visibles y Exportación HTML Instantánea',
    badge: 'Estable',
    highlights: [
      'Orden determinístico por defecto (últimos agregados primero) sincronizado en productos y promociones para todos los entornos.',
      'Ciclo completo de edición y eliminación segura para promociones, categorías y etiquetas con optimización táctil sin dependencia de hover.',
      'Visualización de precios en tarjetas principales, filtros depurados y carga instantánea en archivos HTML autónomos sin capas bloqueantes.',
      'Persistencia blindada con IndexedDB/LocalStorage y respaldo JSON de alta fidelidad con tolerancia a cuotas de almacenamiento.',
      'Subsanación de guardado de productos y sincronización multi-entorno entre administración web/móvil y demos interactivas.'
    ]
  },
  {
    version: '17.0',
    date: '24-25 de Agosto de 2026',
    title: 'Serie v17.x — Motor PWA, Auto-enfoque, Métricas Globales y Filtros Avanzados',
    badge: 'Estable',
    highlights: [
      'Garantía y normalización de orden descendente por defecto (más recientes primero) en todos los módulos.',
      'Auto-desplazamiento y enfoque directo inteligente al abrir la edición de cualquier producto de la lista.',
      'Módulo integrado de Historial de Versiones con sincronización persistente y reglas de consolidación.',
      'Sincronización multi-dispositivo de contador de visitas y popularidad en tiempo real.',
      'Filtros avanzados por precio, orden alfabético reversible (A-Z / Z-A) y métricas de popularidad.',
      'Instalador PWA interactivo para Android/iOS con persistencia offline IndexedDB y respaldo JSON de alta fidelidad.'
    ]
  },
  {
    version: '16.0',
    date: '20 de Agosto de 2026',
    title: 'Gestor de Exhibición y Bloques Promocionales',
    badge: 'Mejora',
    highlights: [
      'Creación y configuración de bloques dinámicos de banners, ofertas y novedades.',
      'Personalización completa de colores, tipografías y datos de contacto de la marca.',
      'Integración directa con WhatsApp para pedidos y consultas con plantillas personalizables.'
    ]
  }
];
