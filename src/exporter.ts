import { CatalogProject } from './types';
import { CustomBlock } from './components/AdminBlocks';
import { DEFAULT_CUSTOM_MESSAGES } from './defaultData';
import { sortProductsNewestFirst } from './lib/productUtils';
import { sortPromosNewestFirst } from './lib/promoUtils';
import { optimizeImageUrl } from './lib/imageUtils';
import { STANDALONE_CSS } from './standalone-css';

/**
 * Generates a fully autonomous single-file HTML interactive catalog.
 * It packages full responsive markup, Tailwind CSS overlay, Lucide-like icons,
 * search filters, sorting, a personal catalog favorites list, quick modal drawer details,
 * and pre-formatted Whatsapp order links!
 */
export function generateStandaloneCatalogHTML(project: CatalogProject, customBlocks: CustomBlock[] = [], apiBaseUrl: string = ''): string {
  const escapeForJSString = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  // Convert images and data to safe inline JSON string escaping script tags
  const safeInlineJSON = (data: any): string => {
    try {
      return JSON.stringify(data || [])
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    } catch (e) {
      return '[]';
    }
  };

  // Convert images and data to safe inline Base64 JSON without breaking script tags or JS syntax
  const safeB64JSON = (data: any): string => {
    try {
      const jsonStr = JSON.stringify(data || []);
      if (typeof TextEncoder !== 'undefined') {
        const bytes = new TextEncoder().encode(jsonStr);
        let bin = '';
        const len = bytes.length;
        const CHUNK_SIZE = 0x8000;
        for (let i = 0; i < len; i += CHUNK_SIZE) {
          bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK_SIZE)));
        }
        return btoa(bin);
      }
      return btoa(encodeURIComponent(jsonStr));
    } catch (e) {
      try {
        return btoa(encodeURIComponent(JSON.stringify(data || [])));
      } catch (err) {
        return btoa('[]');
      }
    }
  };

  const normalizedProducts = sortProductsNewestFirst(project.products || []).map(p => {
    let rawImgs = Array.isArray(p.images) ? p.images.filter(img => img && typeof img === 'string' && img.trim() !== '') : [];
    if (rawImgs.length === 0 && p.image && typeof p.image === 'string' && p.image.trim() !== '') {
      rawImgs = [p.image.trim()];
    }
    return {
      ...p,
      images: rawImgs.map(img => optimizeImageUrl(img, 800))
    };
  });

  const inlineProductsJS = safeInlineJSON(normalizedProducts);
  const inlineCategoriesJS = safeInlineJSON(project.categories || []);
  const inlineContactJS = safeInlineJSON(project.contact || {});
  const inlineDesignJS = safeInlineJSON(project.design || {});
  const sortedCustomBlocks = sortPromosNewestFirst(customBlocks || []);
  const inlineBlocksJS = safeInlineJSON(sortedCustomBlocks);
  const inlineMessagesJS = safeInlineJSON(project.messages || DEFAULT_CUSTOM_MESSAGES);

  const serializedProducts = safeB64JSON(normalizedProducts);
  const serializedCategories = safeB64JSON(project.categories || []);
  const serializedContact = safeB64JSON(project.contact || {});
  const serializedDesign = safeB64JSON(project.design || {});
  const serializedBlocks = safeB64JSON(sortedCustomBlocks);
  const serializedMessages = safeB64JSON(project.messages || DEFAULT_CUSTOM_MESSAGES);

  const hasContactInfo = !!(
    project.contact && (
      (project.contact.company && typeof project.contact.company === 'string' && project.contact.company.trim() !== '') ||
      (project.contact.name && typeof project.contact.name === 'string' && project.contact.name.trim() !== '') ||
      (project.contact.phone && typeof project.contact.phone === 'string' && project.contact.phone.trim() !== '') ||
      (project.contact.email && typeof project.contact.email === 'string' && project.contact.email.trim() !== '') ||
      (project.contact.address && typeof project.contact.address === 'string' && project.contact.address.trim() !== '') ||
      (project.contact.website && typeof project.contact.website === 'string' && project.contact.website.trim() !== '')
    )
  );

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>${project.name} | Catálogo Interactivo</title>
  <!-- Autonomous Offline CSS (Tailwind utilities + system fallbacks) -->
  <style>
${STANDALONE_CSS}

    /* Dynamic Typography Class bindings */
    .font-serif { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
    .font-sans { font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace; }
    
    /* Scrollbar decoration */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f5f5f4; }
    ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
  </style>
</head>
<body class="bg-[#fafaf9] text-stone-800 antialiased min-h-screen flex flex-col justify-between selection:bg-stone-200 selection:text-stone-900 ${
    project.design.fontFamily === 'serif' ? 'font-serif' : project.design.fontFamily === 'mono' ? 'font-mono' : 'font-sans'
  }">
  <div id="app">    <!-- Header Banner -->
    ${
      project.design.bannerImage 
        ? `<header id="appHeader" class="relative bg-stone-900 overflow-hidden border-b border-stone-100 w-full h-44">
            <img src="${project.design.bannerImage}" alt="Banner" referrerpolicy="no-referrer" class="w-full h-full object-cover opacity-65">
            <div class="absolute inset-0 bg-gradient-to-t from-[#fafaf9] to-stone-900/45"></div>
            <div class="absolute bottom-4 left-6 md:left-12 flex items-center gap-4">
              ${
                project.design.logoImage 
                  ? `<div class="w-14 h-14 rounded-xl bg-white p-1 border shadow-md flex-shrink-0 flex items-center justify-center aspect-square overflow-hidden">
                      <img src="${project.design.logoImage}" alt="Logo" referrerpolicy="no-referrer" class="max-w-full max-h-full object-contain">
                    </div>`
                  : `<div class="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm flex-shrink-0 aspect-square" style="color: ${project.design.primaryColor}; background-color: ${project.design.primaryColor}15; border-color: ${project.design.primaryColor}30;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>`
              }
              <div>
                <h1 class="text-2xl md:text-4xl font-black font-serif text-stone-950 mt-1.5 drop-shadow-md tracking-tight">${project.name}</h1>
                <p class="text-xs md:text-sm text-stone-500 font-medium tracking-wide mt-0.5">${project.design.bannerSubtitle || 'Catálogo de exhibición'}</p>
              </div>
            </div>
          </header>`
        : `<header id="appHeader" class="py-4 px-6 md:px-12 bg-white border-b border-stone-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              ${
                project.design.logoImage 
                  ? `<div class="w-12 h-12 bg-white border p-1 rounded-xl flex items-center justify-center flex-shrink-0 aspect-square overflow-hidden">
                      <img src="${project.design.logoImage}" alt="Logo" referrerpolicy="no-referrer" class="max-w-full max-h-full object-contain">
                    </div>`
                  : `<div class="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm flex-shrink-0 aspect-square" style="color: ${project.design.primaryColor}; background-color: ${project.design.primaryColor}15; border-color: ${project.design.primaryColor}30;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>`
              }
              <div>
                <h1 class="text-2xl md:text-3.5xl font-black text-stone-900 font-serif leading-tight tracking-tight">${project.name}</h1>
                <p class="text-xs md:text-sm text-stone-500 font-medium tracking-wide mt-0.5">${project.design.bannerSubtitle || 'Catálogo de exhibición'}</p>
              </div>
            </div>
          </header>`
    }

    <!-- Top Filter & Search controls (Guarantees mobile friendliness: no products pushed down) -->
    <div id="appFilters" class="max-w-7xl mx-auto px-4 md:px-8 pt-1.5 pb-1">
      <div id="promosSection" class="hidden mb-3"></div>
      
      <!-- Modern simplified search block with Sort selector -->
      <div class="flex items-center gap-3 w-full mb-3">
        <div class="relative flex-grow bg-white p-3 rounded-xl border border-stone-200/85 shadow-sm flex items-center h-12">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 text-stone-400">
            <svg class="w-4 h-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            id="searchInput"
            placeholder="Buscar"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            class="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-stone-500 focus:outline-none transition-colors font-sans h-8"
            oninput="renderCatalog()"
          >
        </div>
        <div class="relative w-12 h-12 bg-white rounded-xl border border-stone-200/85 shadow-sm flex items-center justify-center shrink-0 hover:border-stone-400 hover:bg-stone-50 transition-colors cursor-pointer group">
          <svg class="w-4.5 h-4.5 text-stone-600 group-hover:text-stone-800 transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/></svg>
          <select
            id="sortSelect"
            onchange="renderCatalog()"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Ordenar por"
          >
            <option value="default">Orden por defecto (Más recientes)</option>
            <option value="alpha">De la A a la Z</option>
            <option value="alpha_desc">De la Z a la A</option>
            <option value="price_asc">Precio: de Menor a Mayor</option>
            <option value="price_desc">Precio: de Mayor a Menor</option>
            <option value="views">Más Vistos (Popularidad)</option>
          </select>
        </div>
      </div>

      <!-- Horizontal scrollable chips bar -->
      <div class="w-full overflow-hidden">
        <div id="categoryContainer" class="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mb-1"></div>
      </div>
    </div>

    <!-- Main Live Products Section -->
    <main id="appMain" class="max-w-7xl mx-auto px-4 md:px-8 py-4">

      <div class="flex items-center justify-between mb-4 text-xs text-stone-500 font-medium hidden">
        <span>Mostrando <span class="text-stone-850 font-bold" id="itemCount">0</span> productos disponibles</span>
      </div>

      <div id="productsGrid" class="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div id="productsLoadingPlaceholder" class="col-span-full bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-sm my-4 flex flex-col items-center justify-center min-h-[320px]">
          <div class="w-10 h-10 rounded-full border-3 border-stone-200 border-t-amber-600 animate-spin mb-4"></div>
          <h3 class="font-serif font-bold text-stone-900 text-base md:text-lg">
            Espere un momento se esta cargando la información...
          </h3>
          <p class="text-xs text-stone-500 mt-1.5 font-sans">
            Organizando la galería de productos y fotografías...
          </p>
        </div>
      </div>
    </main>

    <!-- INTEGRATED INLINE DETAIL VIEW (FRAME) -->
    <div id="appProductDetails" class="max-w-4xl mx-auto px-4 md:px-8 py-6 font-sans hidden">
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="bg-stone-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-150" id="modalImgContainer"></div>
          <div class="p-6 md:p-8 flex flex-col justify-between" id="modalTextContainer"></div>
        </div>
        <div id="modalRelatedContainer" class="px-6 md:px-8 pb-6 border-t border-stone-100 bg-stone-50/50"></div>
      </div>
    </div>
  </div>

  <!-- Footer layout -->
  <footer id="appFooter" class="bg-[#fafaf9] text-stone-500 py-8 px-6 text-center text-xs border-t border-stone-200/60 mt-auto">
    ${project.contact.company && project.contact.company.trim() !== '' ? `<p class="font-serif italic font-bold text-sm mb-1.5" style="color: ${project.design.primaryColor}">${project.contact.company}</p>` : ''}
    ${project.design.footerText && project.design.footerText.trim() !== '' ? `<p class="max-w-md mx-auto mt-1.5 leading-relaxed text-stone-400 font-medium">${project.design.footerText}</p>` : ''}
  </footer>

  <!-- FLOATING BACK BUTTON (Visible only when a product is selected) -->
  <button
    id="detailBackButton"
    onclick="handleBackClick()"
    class="fixed top-6 left-4 sm:left-6 z-[90] p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center w-12 h-12 border border-stone-800 hidden"
    title="Regresar al Catálogo"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  </button>

  <!-- Hidden offscreen container for capturing high-resolution product card screenshots -->
  <div id="exportCaptureCard" class="fixed left-[-9999px] top-0 bg-white p-8 rounded-2xl shadow-xl border border-stone-200" style="width: 560px; font-family: system-ui, sans-serif;"></div>

  <!-- PROMOTION DETAIL MODAL -->
  <div id="promoModal" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
      <button onclick="closePromoModal()" class="absolute top-4 right-4 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer z-10 transition-colors">
        ✕
      </button>
      <div class="flex flex-col">
        <div id="promoModalImgContainer" class="bg-stone-50 w-full flex items-center justify-center border-b border-stone-100 p-4"></div>
        <div class="p-6 flex flex-col justify-between" id="promoModalTextContainer"></div>
      </div>
    </div>
  </div>

  <!-- COMPACT OPTIONS MENU OVERLAY (Android style popover) -->
  <div id="configMenuBackdrop" class="fixed inset-0 z-[95] hidden" onclick="closeConfigMenu()"></div>
  <div id="configMenu" class="fixed bottom-20 right-6 z-[100] w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden py-1 hidden divide-y divide-stone-100 font-sans">
    <div class="px-4 py-2.5 bg-stone-50/80 flex items-center justify-between">
      <span class="text-xs font-bold text-stone-900 tracking-wide">Menú de Opciones</span>
      <button 
        onclick="closeConfigMenu()" 
        class="text-stone-400 hover:text-stone-600 transition-colors p-0.5 rounded-full hover:bg-stone-200/50 cursor-pointer border-none bg-transparent flex items-center justify-center"
        title="Cerrar menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    
    <div class="py-1">
      <!-- Option 1: Favoritos -->
      <button onclick="openFavoritesScreen()" class="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group">
        <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <div class="flex-grow flex items-center justify-between min-w-0">
          <span class="text-xs font-semibold text-stone-800 truncate">Productos Favoritos</span>
          <span id="menuFavCountBadge" class="px-2 py-0.5 rounded-full text-[9px] bg-red-100 text-red-700 font-bold border border-red-200">0</span>
        </div>
      </button>

      <!-- Option 2: Compartir catálogo -->
      <button onclick="shareCatalogLinkFromMenu()" class="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group">
        <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        </div>
        <span class="text-xs font-semibold text-stone-800 truncate">Compartir catálogo</span>
      </button>

      <!-- Option 3: Contactar por WhatsApp -->
      ${
        project.contact.phone
          ? `<a href="https://wa.me/${project.contact.phone.replace(/[+\s-]/g, '')}" target="_blank" onclick="closeConfigMenu()" class="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group no-underline">
              <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.805-9.795.001-2.618-1.019-5.078-2.873-6.932C16.35 2.023 13.895.998 11.28.997 5.875.997 1.474 5.394 1.472 10.796c0 1.512.411 2.99 1.192 4.282l-.426 1.558 1.606-.421 1.62.949-.001-.001zM18.106 14.7c-.33-.165-1.951-.963-2.251-1.072-.3-.109-.518-.165-.736.165-.218.33-.844 1.072-1.035 1.291-.19.218-.382.245-.712.08-1.18-.59-1.977-1.08-2.761-2.422-.206-.352-.02-.54.152-.712.155-.155.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.736-1.774-1.008-2.43-.266-.643-.538-.553-.736-.563-.19-.01-.408-.012-.626-.012-.218 0-.573.082-.873.413-.3.33-1.145 1.118-1.145 2.724 0 1.605 1.169 3.159 1.329 3.378.16.218 2.3 3.511 5.572 4.92.778.335 1.386.535 1.86.686.782.249 1.493.214 2.055.13.628-.094 1.951-.798 2.224-1.57.273-.772.273-1.43.191-1.57-.082-.14-.3-.218-.63-.383z"/></svg>
              </div>
              <span class="text-xs font-semibold text-stone-800 truncate">Contactar por WhatsApp</span>
            </a>`
          : ''
      }

      <!-- Option 5: Acerca de la aplicación -->
      <button onclick="openAboutScreen()" class="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group">
        <div class="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <span class="text-xs font-semibold text-stone-800 truncate">Información del Catálogo</span>
      </button>

      <!-- Option 6: ¿Cómo funciona? -->
      <button onclick="openHowItWorksScreen()" class="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group">
        <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <span class="text-xs font-semibold text-stone-800 truncate">¿Cómo funciona?</span>
      </button>
    </div>
  </div>

  <!-- INDEPENDENT SCREEN: ❤️ FAVORITOS -->
  <div id="favoritesScreen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden relative max-h-[85vh] flex flex-col font-sans">
      <div class="p-5 border-b border-stone-150 flex items-center justify-between">
        <h3 class="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-red-500 fill-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          Productos Favoritos
        </h3>
        <button onclick="closeFavoritesScreen()" class="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors">
          ✕
        </button>
      </div>

      <div class="p-5 overflow-y-auto flex-grow" id="favoritesScreenListContainer">
        <!-- Will be populated dynamically by JavaScript -->
      </div>

      <div class="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
        <button onclick="closeFavoritesScreen()" class="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- INDEPENDENT SCREEN: 🏢 INFORMACIÓN DE LA EMPRESA -->
  <div id="companyScreen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative max-h-[85vh] flex flex-col font-sans">
      <div class="p-5 border-b border-stone-150 flex items-center justify-between">
        <h3 class="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-stone-700 shrink-0"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2v2H8V6z"/><path d="M14 6h2v2h-2V6z"/><path d="M8 11h2v2H8v-2z"/><path d="M14 11h2v2h-2v-2z"/></svg>
          Información de la Empresa
        </h3>
        <button onclick="closeCompanyScreen()" class="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors">
          ✕
        </button>
      </div>

      <div class="p-5 overflow-y-auto flex-grow space-y-4">
        ${
          hasContactInfo
            ? `<div class="space-y-4 font-sans">
                ${project.contact.company ? `<div class="text-center py-4 border-b border-stone-100"><span class="text-3xl block mb-2">🏢</span><h4 class="text-lg font-bold text-stone-900 font-serif">${project.contact.company}</h4></div>` : ''}
                
                <div class="space-y-3 text-xs">
                  ${project.contact.name ? `<div class="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50"><span class="text-base">👨‍💼</span><div><span class="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Atención / Contacto</span><span class="font-semibold text-stone-850 mt-0.5 block">${project.contact.name}</span></div></div>` : ''}
                  ${project.contact.phone ? `<div class="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50"><span class="text-base">📞</span><div><span class="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Teléfono / WhatsApp</span><a href="https://wa.me/${project.contact.phone.replace(/[+\s-]/g, '')}" target="_blank" class="font-semibold text-[#059669] hover:underline mt-0.5 block">${project.contact.phone}</a></div></div>` : ''}
                  ${project.contact.email ? `<div class="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50"><span class="text-base">✉️</span><div><span class="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Correo Electrónico</span><a href="mailto:${project.contact.email}" class="font-semibold text-stone-750 hover:underline mt-0.5 block">${project.contact.email}</a></div></div>` : ''}
                  ${project.contact.website ? `<div class="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50"><span class="text-base">🌐</span><div><span class="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sitio Web</span><a href="${project.contact.website.startsWith('http') ? project.contact.website : `https://${project.contact.website}`}" target="_blank" class="font-semibold text-stone-750 hover:underline mt-0.5 block">${project.contact.website}</a></div></div>` : ''}
                  ${project.contact.address ? `<div class="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50"><span class="text-base">📍</span><div><span class="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Dirección Física</span><span class="font-semibold text-stone-850 mt-0.5 block leading-relaxed">${project.contact.address}</span></div></div>` : ''}
                </div>
              </div>`
            : `<div class="text-center py-10 px-4 space-y-2">
                <span class="text-3xl">🏢</span>
                <p class="text-sm font-semibold text-stone-750">No hay información de la empresa configurada</p>
              </div>`
        }
      </div>

      <div class="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
        <button onclick="closeCompanyScreen()" class="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- INDEPENDENT SCREEN: ℹ️ INFORMACIÓN DEL CATÁLOGO -->
  <div id="aboutScreen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative max-h-[85vh] flex flex-col font-sans">
      <div class="p-5 border-b border-stone-150 flex items-center justify-between">
        <h3 class="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-stone-700 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          Información del Catálogo
        </h3>
        <button onclick="closeAboutScreen()" class="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors">
          ✕
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-grow space-y-6">
        <div class="text-center py-2">
          <div class="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm border border-amber-100">
            🪵
          </div>
          <h4 class="text-lg font-extrabold text-stone-900 tracking-tight font-serif">
            ${project.contact.company || 'Nuestro Catálogo'}
          </h4>
          <p class="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">Exhibición de Artículos</p>
        </div>

        <div class="space-y-4 text-sm text-stone-700 leading-relaxed font-sans text-center px-2 max-w-sm mx-auto">
          ${(project.description || 'Catálogo de exhibición de artículos variados en madera y corte láser. Fotos reales. Pregunta sin compromiso. El detalle perfecto, natural y moderno.\n\nHay regalos que marcan para siempre. Deja tu Huella.')
            .split('\n')
            .filter(para => para.trim() !== '')
            .map(para => `
              <p class="text-stone-700 font-medium leading-relaxed">${para.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</p>
            `).join('')}
        </div>
      </div>

      <div class="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
        <button onclick="closeAboutScreen()" class="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- INDEPENDENT SCREEN: ❓ CÓMO FUNCIONA -->
  <div id="howItWorksScreen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden relative max-h-[85vh] flex flex-col font-sans">
      <div class="p-5 border-b border-stone-150 flex items-center justify-between">
        <h3 class="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-amber-700 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ¿Cómo funciona?
        </h3>
        <button onclick="closeHowItWorksScreen()" class="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors">
          ✕
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-grow space-y-5">
        <div class="bg-amber-50/50 rounded-xl p-4 border border-amber-100/70">
          <h4 class="text-sm font-bold text-stone-900 font-serif mb-1">¿Cómo usar este catálogo?</h4>
          <p class="text-xs text-stone-600 leading-relaxed">
            Sigue estos sencillos pasos para sacarle el máximo provecho a nuestra plataforma de exhibición digital:
          </p>
        </div>

        <div class="space-y-4">
          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">1</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Explora sin compromiso</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">Este es un catálogo 100% de exhibición.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">2</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Contacta si te gusta</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">¿Viste algo que te encantó? Puedes contactarnos y pedir más detalles.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">3</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Encuentra lo que buscas</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">Usa el buscador por nombre, categoría o material para ir directo al grano.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">4</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Guarda tus favoritos</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">Haz clic en el corazón ❤️ para marcar tus piezas preferidas y encontrarlas fácilmente después.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">5</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Comparte con quien quieras</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">¿Tienes un amigo al que le encantaría esto? Compártelo directamente por WhatsApp con un solo toque.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start">
            <span class="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">6</span>
            <div>
              <h5 class="text-xs font-bold text-stone-900">Descubre más</h5>
              <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">Al ver un producto, te mostraremos recomendaciones similares que quizás también te interesen.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
        <button onclick="closeHowItWorksScreen()" class="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- INDEPENDENT SCREEN: ❓ EXIT CONFIRMATION MODAL -->
  <div id="exitConfirmModal" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[110] hidden items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-stone-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150 font-sans">
      <div class="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-amber-700"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h3 class="font-serif font-bold text-stone-900 text-base mb-2">¿Desea salir del catálogo?</h3>
      <p class="text-xs text-stone-500 leading-relaxed mb-6">
        Seleccione ACEPTAR si realmente desea salir del catálogo o CANCELAR para regresar
      </p>
      <div class="flex gap-3">
        <button onclick="closeExitConfirmModal()" class="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200">
          Cancelar
        </button>
        <button onclick="confirmExit()" class="flex-1 py-2.5 px-4 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:opacity-90" style="background-color: ${project.design.primaryColor || '#1c1917'}">
          Aceptar
        </button>
      </div>
    </div>
  </div>

  <!-- UNIFIED VERTICAL FLOATING BUTTONS COLUMN (Bottom-to-top) -->
  <div class="fixed bottom-6 right-6 z-[90] flex flex-col-reverse gap-3 items-center">
    <!-- 1. 📋 Opciones (Siempre visible - abre el menú compacto) -->
    <button onclick="toggleConfigMenu()" class="p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center w-12 h-12 border border-stone-800" title="Opciones">
      <svg id="settingsGearIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 transition-transform duration-300"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
    </button>

    <!-- 3. ⬆️ Regresar arriba (Visible solo al desplazar) -->
    <button id="scrollTopBtn" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="p-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-full shadow-lg transition-all duration-300 w-12 h-12 hidden focus:outline-none hover:scale-110 cursor-pointer" title="Volver arriba">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  </div>

  <!-- DATA MODEL EMBEDDED NODES (Dual DOM Text/Value Nodes avoid JS String Token limits and timing issues on Mobile WebViews & Content Viewers) -->
  <textarea id="data-products" style="display:none !important;">${serializedProducts}</textarea>
  <textarea id="data-categories" style="display:none !important;">${serializedCategories}</textarea>
  <textarea id="data-contact" style="display:none !important;">${serializedContact}</textarea>
  <textarea id="data-design" style="display:none !important;">${serializedDesign}</textarea>
  <textarea id="data-blocks" style="display:none !important;">${serializedBlocks}</textarea>
  <textarea id="data-messages" style="display:none !important;">${serializedMessages}</textarea>

  <script type="application/json" id="data-products-json">${serializedProducts}</script>
  <script type="application/json" id="data-categories-json">${serializedCategories}</script>
  <script type="application/json" id="data-contact-json">${serializedContact}</script>
  <script type="application/json" id="data-design-json">${serializedDesign}</script>
  <script type="application/json" id="data-blocks-json">${serializedBlocks}</script>
  <script type="application/json" id="data-messages-json">${serializedMessages}</script>

  <!-- SCRIPT LOGIC ENGINE -->
  <script>
    window.__EMBEDDED_CATALOG_DATA__ = {
      products: ${inlineProductsJS},
      categories: ${inlineCategoriesJS},
      contact: ${inlineContactJS},
      design: ${inlineDesignJS},
      blocks: ${inlineBlocksJS},
      messages: ${inlineMessagesJS}
    };

    function getProductCategories(p) {
      if (!p) return ['General'];
      var list = [];
      if (Array.isArray(p.categories) && p.categories.length > 0) {
        list = p.categories.filter(function(c) { return c && typeof c === 'string' && c.trim() !== ''; }).map(function(c) { return c.trim(); });
      } else if (typeof p.categories === 'string' && p.categories.trim() !== '') {
        list = [p.categories.trim()];
      } else if (p.category && typeof p.category === 'string' && p.category.trim() !== '') {
        list = [p.category.trim()];
      }
      if (list.length === 0) return ['General'];
      var unique = Array.from(new Set(list));
      return unique.sort(function(a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base' }); });
    }

    function getProductTags(p) {
      if (!p || !Array.isArray(p.tags)) return [];
      var valid = p.tags
        .filter(function(t) { return t && typeof t === 'string' && t.trim() !== ''; })
        .map(function(t) { return t.trim(); });
      if (valid.length === 0) return [];
      var unique = Array.from(new Set(valid));
      return unique.sort(function(a, b) { return a.localeCompare(b, undefined, { sensitivity: 'base' }); });
    }

    function normalizeProductData(prod) {
      if (!prod || typeof prod !== 'object') return null;
      var cats = getProductCategories(prod);
      return Object.assign({}, prod, {
        category: cats[0] || prod.category || 'General',
        categories: cats
      });
    }

    var HISTORICAL_PRODUCT_ORDER = [
      'prod-1',
      'prod-2',
      'prod-3',
      'prod-4',
      'prod-5',
      'prod-1785815071398',
      'prod-1785816961280',
      'prod-1786334061118',
      'prod-1786334469584',
      'prod-1786334712033',
      'prod-1786334896287',
      'prod-1786335220716',
      'prod-1786335525853',
      'prod-1786335600799',
      'prod-1786336038010',
      'prod-1786336681682',
      'prod-1786508437646',
      'prod-1786654500119',
      'prod-1786655205374',
      'prod-1786656194815',
      'prod-1786656567057',
      'prod-1787250790361',
      'prod-1787093566184',
      'prod-1787248810166',
      'prod-1786336181559'
    ];
    var HISTORICAL_ORDER_MAP = {};
    HISTORICAL_PRODUCT_ORDER.forEach(function(id, idx) {
      HISTORICAL_ORDER_MAP[id] = 1785000000000 + idx * 3600000;
    });

    function getProductSortTimestamp(p) {
      if (!p) return 0;
      if (p.id && typeof HISTORICAL_ORDER_MAP[p.id] === 'number') {
        return HISTORICAL_ORDER_MAP[p.id];
      }
      if (typeof p.createdAt === 'number' && !isNaN(p.createdAt) && p.createdAt > 0) {
        return p.createdAt;
      }
      if (typeof p.createdAt === 'string' && p.createdAt.trim() !== '') {
        var num = Number(p.createdAt);
        if (!isNaN(num) && num > 0) return num;
        var dt = Date.parse(p.createdAt);
        if (!isNaN(dt) && dt > 0) return dt;
      }
      return 0;
    }

    function sortProductsNewestFirst(prods) {
      if (!Array.isArray(prods) || prods.length <= 1) return Array.isArray(prods) ? prods : [];
      var indexed = prods.map(function(p, idx) {
        var ts = getProductSortTimestamp(p);
        return {
          product: (ts > 0 && (!p.createdAt || typeof HISTORICAL_ORDER_MAP[p.id] === 'number')) ? Object.assign({}, p, { createdAt: ts }) : p,
          index: idx,
          ts: ts
        };
      });

      indexed.sort(function(a, b) {
        if (b.ts > 0 && a.ts > 0 && b.ts !== a.ts) {
          return b.ts - a.ts;
        }
        if (b.ts > 0 && a.ts <= 0) return -1;
        if (a.ts > 0 && b.ts <= 0) return 1;
        return a.index - b.index;
      });

      return indexed.map(function(item) { return item.product; });
    }

    // Embedded Data Models Base64 Parser (100% universal across desktop browsers, mobile WebViews, and PWAs)
    function parseB64JSON(rawInput, fallback) {
      if (!rawInput) return fallback;
      if (typeof rawInput !== 'string') return (typeof rawInput === 'object' && rawInput !== null) ? rawInput : fallback;
      
      let str = rawInput.trim();
      if (!str) return fallback;

      // If string is already unencoded JSON
      if (str.startsWith('[') || str.startsWith('{')) {
        try {
          return JSON.parse(str);
        } catch(e) {}
      }

      // Strip all whitespace, newlines, carriage returns and non-Base64 characters
      str = str.replace(/[^A-Za-z0-9+/=]/g, '');
      if (!str) return fallback;

      // Ensure valid Base64 length modulo 4
      while (str.length % 4 !== 0) {
        str += '=';
      }

      let bin = '';
      try {
        bin = atob(str);
      } catch(e) {
        console.error('atob failed:', e);
        return fallback;
      }

      if (!bin) return fallback;

      // Try TextDecoder UTF-8 decoding
      try {
        const len = bin.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = bin.charCodeAt(i);
        }
        if (typeof TextDecoder !== 'undefined') {
          const jsonStr = new TextDecoder('utf-8').decode(bytes);
          return JSON.parse(jsonStr);
        }
      } catch(e) {}

      // Fallback 1: decodeURIComponent escape sequence
      try {
        return JSON.parse(decodeURIComponent(escape(bin)));
      } catch(e) {}

      // Fallback 2: decodeURIComponent direct
      try {
        return JSON.parse(decodeURIComponent(bin));
      } catch(e) {}

      // Fallback 3: raw binary JSON parse
      try {
        return JSON.parse(bin);
      } catch(e) {}

      return fallback;
    }

    function readB64DOMData(id, fallback) {
      try {
        let el = document.getElementById(id);
        if (!el) el = document.getElementById(id + '-json');
        if (!el) return fallback;

        let str = '';
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          str = el.value || el.textContent || el.innerText || el.innerHTML || '';
        } else {
          str = el.textContent || el.innerText || el.innerHTML || el.value || '';
        }

        str = (str || '').trim();
        if (!str) {
          let elAlt = document.getElementById(id + '-json');
          if (elAlt && elAlt !== el) {
            str = (elAlt.textContent || elAlt.innerText || elAlt.innerHTML || '').trim();
          }
        }

        if (!str) return fallback;
        return parseB64JSON(str, fallback);
      } catch(e) {
        console.error('Error reading embedded DOM B64 data for ' + id, e);
        return fallback;
      }
    }

    let products = [];
    let categories = [];
    let contact = {};
    let design = {};
    let customBlocks = [];
    let messages = {};

    function loadAllCatalogData() {
      try {
        if (window.__EMBEDDED_CATALOG_DATA__ && Array.isArray(window.__EMBEDDED_CATALOG_DATA__.products) && window.__EMBEDDED_CATALOG_DATA__.products.length > 0) {
          products = sortProductsNewestFirst(window.__EMBEDDED_CATALOG_DATA__.products.map(normalizeProductData).filter(Boolean));
          categories = Array.isArray(window.__EMBEDDED_CATALOG_DATA__.categories) ? window.__EMBEDDED_CATALOG_DATA__.categories : [];
          contact = (window.__EMBEDDED_CATALOG_DATA__.contact && typeof window.__EMBEDDED_CATALOG_DATA__.contact === 'object') ? window.__EMBEDDED_CATALOG_DATA__.contact : {};
          design = (window.__EMBEDDED_CATALOG_DATA__.design && typeof window.__EMBEDDED_CATALOG_DATA__.design === 'object') ? window.__EMBEDDED_CATALOG_DATA__.design : {};
          customBlocks = Array.isArray(window.__EMBEDDED_CATALOG_DATA__.blocks) ? window.__EMBEDDED_CATALOG_DATA__.blocks : [];
          messages = (window.__EMBEDDED_CATALOG_DATA__.messages && typeof window.__EMBEDDED_CATALOG_DATA__.messages === 'object') ? window.__EMBEDDED_CATALOG_DATA__.messages : {};
          return;
        }
      } catch(e) {
        console.warn('Error accessing window.__EMBEDDED_CATALOG_DATA__, using DOM node fallback:', e);
      }

      try {
        const rawProducts = readB64DOMData('data-products', []);
        const rawCategories = readB64DOMData('data-categories', []);
        const rawContact = readB64DOMData('data-contact', {});
        const rawDesign = readB64DOMData('data-design', {});
        const rawBlocks = readB64DOMData('data-blocks', []);
        const rawMessages = readB64DOMData('data-messages', {});

        products = sortProductsNewestFirst((Array.isArray(rawProducts) ? rawProducts : []).map(normalizeProductData).filter(Boolean));
        categories = Array.isArray(rawCategories) ? rawCategories : [];
        contact = (rawContact && typeof rawContact === 'object' && rawContact !== null) ? rawContact : {};
        design = (rawDesign && typeof rawDesign === 'object' && rawDesign !== null) ? rawDesign : {};
        customBlocks = Array.isArray(rawBlocks) ? rawBlocks : [];
        messages = (rawMessages && typeof rawMessages === 'object' && rawMessages !== null) ? rawMessages : {};
      } catch(err) {
        console.error('Error loading catalog data:', err);
      }
    }

    // Initial load attempt
    loadAllCatalogData();

    function getCatalogUrl() {
      return '${escapeForJSString(project.design.shareUrl || '')}' || window.location.href;
    }

    function getProductUrl(prod) {
      const baseUrl = getCatalogUrl();
      const cleanBase = baseUrl.split('#')[0];
      return cleanBase + '#prod-' + prod.id;
    }

    function getProductImageInfo(prod) {
      const validImages = (prod.images || []).filter(img => img && String(img).trim() !== '');
      const rawImg = prod.image || validImages[prod.primaryImageIndex || 0] || validImages[0] || '';
      
      let absoluteUrl = '';
      let imgPart = '';

      if (rawImg) {
        if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
          absoluteUrl = rawImg;
          imgPart = '🖼️ *Imagen:* ' + absoluteUrl;
        }
      }

      return { rawImg: rawImg, absoluteUrl: absoluteUrl, imgPart: imgPart };
    }

    function formatCatalogShareText(overrideUrl) {
      const template = (messages && messages.shareCatalog) || '¡Hola! Te invito a explorar nuestro catálogo digital interactivo *{nombre_catalogo}*:\\n\\n🌐 *Ver Catálogo:* {url}';
      const catalogUrl = overrideUrl || getCatalogUrl();
      const text = template
        .replace(/\{nombre_catalogo\}/gi, '${escapeForJSString(project.name || 'Catálogo Digital')}')
        .replace(/\{nombre\}/gi, '${escapeForJSString(project.name || 'Catálogo Digital')}')
        .replace(/\{empresa\}/gi, contact.company || contact.name || '')
        .replace(/\{direccion\}/gi, contact.address || '')
        .replace(/\{url\}/gi, catalogUrl);
      return text.replace(/\\n{3,}/g, '\\n\\n').trim();
    }

    function formatProductShareText(prod) {
      const template = (messages && messages.shareProduct) || '¡Hola! Te comparto este producto de nuestro catálogo:\\n\\n*{nombre}* ({categoria})\\n{descripcion}\\n{precio}\\n{imagen}\\n\\n🌐 *Ver en Catálogo:* {url}';
      const catalogUrl = getCatalogUrl();
      const prodUrl = getProductUrl(prod);
      const imgInfo = getProductImageInfo(prod);
      const priceText = prod.price ? '*Precio:* $' + prod.price + ' ' + (prod.currency || '') : '';

      const text = template
        .replace(/\{nombre\}/gi, prod.name || '')
        .replace(/\{categoria\}/gi, prod.category || '')
        .replace(/\{descripcion\}/gi, prod.description || '')
        .replace(/\{precio\}/gi, priceText)
        .replace(/\{sku\}/gi, prod.sku ? 'SKU: ' + prod.sku : '')
        .replace(/\{imagen\}/gi, imgInfo.imgPart || '')
        .replace(/\{empresa\}/gi, contact.company || contact.name || '')
        .replace(/\{direccion\}/gi, contact.address || '')
        .replace(/\{url\}/gi, prodUrl || catalogUrl);

      return text.replace(/\\n{3,}/g, '\\n\\n').trim();
    }

    function formatConsultProductText(prod) {
      const template = (messages && messages.consultProduct) || 'Hola, estoy interesado en consultar sobre el siguiente producto de su catálogo:\\n\\n*Producto:* {nombre}\\n*Categoría:* {categoria}\\n{precio}\\n{imagen}\\n\\n🌐 *Enlace:* {url}\\n\\n¿Podría brindarme más detalles?';
      const prodUrl = getProductUrl(prod);
      const imgInfo = getProductImageInfo(prod);
      const priceText = prod.price ? '*Precio:* $' + prod.price + ' ' + (prod.currency || '') : '';

      const text = template
        .replace(/\{nombre\}/gi, prod.name || '')
        .replace(/\{categoria\}/gi, prod.category || '')
        .replace(/\{descripcion\}/gi, prod.description || '')
        .replace(/\{precio\}/gi, priceText)
        .replace(/\{sku\}/gi, prod.sku ? 'SKU: ' + prod.sku : '')
        .replace(/\{imagen\}/gi, imgInfo.imgPart || '')
        .replace(/\{empresa\}/gi, contact.company || contact.name || '')
        .replace(/\{direccion\}/gi, contact.address || '')
        .replace(/\{url\}/gi, prodUrl);

      return text.replace(/\\n{3,}/g, '\\n\\n').trim();
    }

    // Client Storage state with multi-key redundancy and IndexedDB protection
    const pId = '${project.id}';
    const favKeys = [
      'catalog-fav-' + pId,
      'interactive-catalog-fav-' + pId,
      'catalog-user-favorites-' + pId
    ];
    let favorites = [];
    for (let k of favKeys) {
      try {
        const raw = JSON.parse(localStorage.getItem(k));
        if (Array.isArray(raw) && raw.length > 0) {
          favorites = Array.from(new Set([...favorites, ...raw.filter(id => id && String(id).trim() !== '')]));
        }
      } catch(e) {}
    }
    if (favorites.length === 0 && window.__EMBEDDED_CATALOG_DATA__ && Array.isArray(window.__EMBEDDED_CATALOG_DATA__.favorites)) {
      favorites = [...window.__EMBEDDED_CATALOG_DATA__.favorites];
    }

    function persistFavorites(favList) {
      favorites = Array.from(new Set(favList)).filter(id => id && String(id).trim() !== '');
      const str = JSON.stringify(favorites);
      favKeys.forEach(k => {
        try { localStorage.setItem(k, str); } catch(e) {}
      });
      // Also persist to IndexedDB
      try {
        if (window.indexedDB) {
          const req = indexedDB.open('CatalogExporterDB', 2);
          req.onupgradeneeded = function() {
            const db = req.result;
            if (!db.objectStoreNames.contains('favorites_store')) db.createObjectStore('favorites_store');
          };
          req.onsuccess = function() {
            try {
              const db = req.result;
              const tx = db.transaction('favorites_store', 'readwrite');
              tx.objectStore('favorites_store').put(favorites, 'favorites-' + pId);
            } catch(e) {}
          };
        }
      } catch(e) {}
    }

    function getValidFavorites() {
      if (!Array.isArray(favorites)) return [];
      const prodIds = new Set((products || []).map(function(p) { return p ? p.id : ''; }));
      return favorites.filter(function(id) { return id && prodIds.has(id); });
    }

    const viewsKey = 'interactive-catalog-views-' + pId;
    const viewsKeyAlt = 'catalog-views-' + pId;
    const lastViewedKey = 'interactive-catalog-last-viewed-' + pId;

    function getApiEndpoints() {
      const urls = [];
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        const origin = window.location.origin;
        if (origin && origin !== 'null' && !origin.startsWith('file:') && !origin.startsWith('content:')) {
          urls.push(origin);
        }
      }
      return urls;
    }
    
    // Seed views with embedded initial views from project products
    let localViews = {};
    (products || []).forEach(function(p) {
      if (p && typeof p.viewsCount === 'number' && p.viewsCount > 0) {
        localViews[p.id] = p.viewsCount;
      }
    });

    let lastViewedTimestamps = {};
    try {
      const stored = JSON.parse(localStorage.getItem(viewsKey)) || JSON.parse(localStorage.getItem(viewsKeyAlt)) || {};
      if (stored && typeof stored === 'object') {
        for (const k in stored) {
          localViews[k] = Math.max(localViews[k] || 0, stored[k] || 0);
        }
      }
    } catch(e) {}
    try {
      lastViewedTimestamps = JSON.parse(localStorage.getItem(lastViewedKey)) || {};
    } catch(e) { lastViewedTimestamps = {}; }

    function persistViews(viewsObj) {
      localViews = viewsObj || {};
      const str = JSON.stringify(localViews);
      try { localStorage.setItem(viewsKey, str); } catch(e) {}
      try { localStorage.setItem(viewsKeyAlt, str); } catch(e) {}
    }

    function getProductViews(p) {
      if (!p) return 0;
      return Math.max(p.viewsCount || 0, localViews[p.id] || 0);
    }

    function getTrendingProductIds() {
      const topByCat = {};
      (products || []).forEach(p => {
        if (!p) return;
        const v = getProductViews(p);
        if (v < 1) return;
        const ts = lastViewedTimestamps[p.id] || 0;
        const pCats = getProductCategories(p);

        pCats.forEach(cat => {
          const cur = topByCat[cat];
          if (!cur) {
            topByCat[cat] = { id: p.id, views: v, timestamp: ts };
          } else {
            if (v > cur.views) {
              topByCat[cat] = { id: p.id, views: v, timestamp: ts };
            } else if (v === cur.views) {
              if (ts >= cur.timestamp) {
                topByCat[cat] = { id: p.id, views: v, timestamp: ts };
              }
            }
          }
        });
      });

      const set = new Set();
      Object.keys(topByCat).forEach(cat => {
        if (topByCat[cat] && topByCat[cat].id) {
          set.add(topByCat[cat].id);
        }
      });
      return set;
    }

    let activeModalProductId = null;

    function updateModalViewsDisplay(p) {
      if (!p) return;
      const count = getProductViews(p);
      const span = document.getElementById('modalProductViews');
      const label = document.getElementById('modalProductViewsLabel');
      if (span) {
        span.textContent = count;
      }
      if (label) {
        label.textContent = count === 1 ? 'vista' : 'vistas';
      }
    }

    function mergeViews(data) {
      if (data && typeof data === 'object') {
        for (const k in data) {
          localViews[k] = Math.max(localViews[k] || 0, data[k] || 0);
        }
      }
    }

    // Connect to Server-Sent Events (SSE) and live API for real-time views synchronization
    function fetchLatestViews() {
      try {
        if (typeof fetch === 'undefined') return;

        const baseViews = {};
        (products || []).forEach(function(p) {
          if (p && typeof p.viewsCount === 'number' && p.viewsCount > 0) {
            baseViews[p.id] = p.viewsCount;
          }
        });

        const endpoints = getApiEndpoints();
        endpoints.forEach(function(base) {
          fetch(base + '/api/views/sync/' + '${project.id}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ views: baseViews })
          })
            .then(function(res) {
              if (!res.ok) throw new Error('API error');
              return res.json();
            })
            .then(function(data) {
              if (data && typeof data === 'object') {
                mergeViews(data);
                persistViews(localViews);
                
                if (typeof renderCatalog === 'function') {
                  try { renderCatalog(); } catch(err) {}
                }
                
                if (activeModalProductId) {
                  const currentProd = (products || []).find(prod => prod && prod.id === activeModalProductId);
                  if (currentProd) {
                    updateModalViewsDisplay(currentProd);
                  }
                }
              }
            })
            .catch(function(e) {
              // Fallback simple GET
              fetch(base + '/api/views/' + '${project.id}')
                .then(function(res) { return res.json(); })
                .then(function(data) {
                  if (data && typeof data === 'object') {
                    mergeViews(data);
                    persistViews(localViews);
                    if (typeof renderCatalog === 'function') {
                      try { renderCatalog(); } catch(err) {}
                    }
                    if (activeModalProductId) {
                      const currentProd = (products || []).find(prod => prod && prod.id === activeModalProductId);
                      if (currentProd) {
                        updateModalViewsDisplay(currentProd);
                      }
                    }
                  }
                }).catch(function() {});
            });
        });
      } catch(e) {
        console.warn('Fetch views caught:', e);
      }
    }

    // Load views immediately on page startup
    try { fetchLatestViews(); } catch(e) {}

    function connectRealtimeViews() {
      try {
        if (typeof EventSource === 'undefined') return;
        const endpoints = getApiEndpoints();
        endpoints.forEach(function(base) {
          try {
            const streamUrl = base + '/api/views/stream/' + '${project.id}';
            const eventSource = new EventSource(streamUrl);

            eventSource.onmessage = function(event) {
              try {
                const data = JSON.parse(event.data);
                if (data && typeof data === 'object') {
                  mergeViews(data);
                  persistViews(localViews);
                  
                  if (typeof renderCatalog === 'function') {
                    try { renderCatalog(); } catch(err) {}
                  }
                  
                  if (activeModalProductId) {
                    const currentProd = (products || []).find(prod => prod && prod.id === activeModalProductId);
                    if (currentProd) {
                      updateModalViewsDisplay(currentProd);
                    }
                  }
                }
              } catch (err) {
                console.error('Error processing real-time views update:', err);
              }
            };

            eventSource.onerror = function(err) {
              try { eventSource.close(); } catch(e) {}
            };
          } catch(err) {}
        });
      } catch (err) {
        console.warn('Could not initialize EventSource:', err);
      }
    }

    try { connectRealtimeViews(); } catch(e) {}

    // Robust polling fallback every 5 seconds and on visibility/focus for all devices
    try {
      setInterval(fetchLatestViews, 5000);
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          fetchLatestViews();
        }
      });
      window.addEventListener('focus', fetchLatestViews);
    } catch(e) {}

    let currentCategory = 'TODOS';
    let favoritesOnly = false;
    let shuffledBlocks = [];

    // Navigation & Screen Helpers
    function closeActiveModal() {
      const currentHash = window.location.hash;
      if (currentHash && currentHash !== '' && currentHash !== '#main') {
        try {
          window.history.back();
        } catch(e) {
          try { window.location.hash = '#main'; } catch(err) {}
        }
      } else {
        try { window.location.hash = '#main'; } catch(e) {}
      }
    }

    function handleBackClick() {
      closeActiveModal();
    }

    function isAnyScreenOpen() {
      const screens = ['favoritesScreen', 'companyScreen', 'aboutScreen', 'howItWorksScreen', 'configMenu'];
      for (const id of screens) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) {
          return true;
        }
      }
      return false;
    }

    function closeAllScreens() {
      closeActiveModal();
    }

    function pushScreenState() {
      try {
        if (window.history && window.history.pushState) {
          window.history.pushState({ screenOpen: true }, '');
        }
      } catch(e) {}
    }

    let isAppFullyInitialized = false;

    function syncUIWithHash() {
      let hash = window.location.hash;

      const detailsDiv = document.getElementById('appProductDetails');
      const header = document.getElementById('appHeader');
      const filters = document.getElementById('appFilters');
      const main = document.getElementById('appMain');
      const footer = document.getElementById('appFooter');
      const btnBack = document.getElementById('detailBackButton');

      // Hide all secondary screens
      const screens = ['favoritesScreen', 'companyScreen', 'aboutScreen', 'howItWorksScreen', 'configMenu', 'exitConfirmModal'];
      screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('hidden');
          el.classList.remove('flex');
        }
      });
      
      const configBackdrop = document.getElementById('configMenuBackdrop');
      if (configBackdrop) configBackdrop.classList.add('hidden');

      const settingsGearIcon = document.getElementById('settingsGearIcon');
      if (settingsGearIcon) {
        settingsGearIcon.classList.remove('rotate-90', 'text-amber-500');
      }

      document.body.style.overflow = '';
      resumePromos();

      if (!hash || hash === '' || hash === '#') {
        try {
          window.history.replaceState({ step: 'main' }, '', '#main');
        } catch(e) {}
        hash = '#main';
      }

      // Show active screen based on hash
      if (hash && hash.startsWith('#prod-')) {
        const id = hash.replace('#prod-', '');
        activeModalProductId = id;

        populateProductModalData(id);

        if (header) header.classList.add('hidden');
        if (filters) filters.classList.add('hidden');
        if (main) main.classList.add('hidden');
        if (footer) footer.classList.add('hidden');
        if (btnBack) btnBack.classList.remove('hidden');
        if (detailsDiv) detailsDiv.classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#menu') {
        const menu = document.getElementById('configMenu');
        const backdrop = document.getElementById('configMenuBackdrop');
        if (menu && backdrop) {
          menu.classList.remove('hidden');
          backdrop.classList.remove('hidden');
          if (settingsGearIcon) {
            settingsGearIcon.classList.add('rotate-90', 'text-amber-500');
          }
        }
        if (activeModalProductId) {
          if (header) header.classList.add('hidden');
          if (filters) filters.classList.add('hidden');
          if (main) main.classList.add('hidden');
          if (footer) footer.classList.add('hidden');
          if (btnBack) btnBack.classList.remove('hidden');
          if (detailsDiv) detailsDiv.classList.remove('hidden');
        } else {
          if (header) header.classList.remove('hidden');
          if (filters) filters.classList.remove('hidden');
          if (main) main.classList.remove('hidden');
          if (footer) footer.classList.remove('hidden');
          if (btnBack) btnBack.classList.add('hidden');
          if (detailsDiv) detailsDiv.classList.add('hidden');
        }
      } else {
        activeModalProductId = null;
        try { sessionStorage.removeItem('active-viewed-prod-' + pId); } catch(e) {}

        if (header) header.classList.remove('hidden');
        if (filters) filters.classList.remove('hidden');
        if (main) main.classList.remove('hidden');
        if (footer) footer.classList.remove('hidden');
        if (btnBack) btnBack.classList.add('hidden');
        if (detailsDiv) detailsDiv.classList.add('hidden');

        if (hash === '#favorites') {
          const screen = document.getElementById('favoritesScreen');
          if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('flex');
            document.body.style.overflow = 'hidden';
            renderFavoritesScreenList();
          }
        } else if (hash === '#company') {
          const screen = document.getElementById('companyScreen');
          if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        } else if (hash === '#about') {
          const screen = document.getElementById('aboutScreen');
          if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        } else if (hash === '#how-it-works') {
          const screen = document.getElementById('howItWorksScreen');
          if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('flex');
            document.body.style.overflow = 'hidden';
          }
        }
      }
    }

    function hideLoadingNotice() {
      // Safe no-op (loading notice removed for immediate catalog rendering)
    }

    // Initialization routine
    function init() {
      try {
        loadAllCatalogData();
        currentCategory = 'TODOS';
        favoritesOnly = false;

        const searchEl = document.getElementById('searchInput');
        if (searchEl) searchEl.value = '';

        function getPromoSortTimestamp(b) {
          if (!b) return 0;
          if (typeof b.createdAt === 'number' && !isNaN(b.createdAt) && b.createdAt > 0) return b.createdAt;
          if (typeof b.createdAt === 'string' && b.createdAt.trim() !== '') {
            const num = Number(b.createdAt);
            if (!isNaN(num) && num > 0) return num;
            const dt = Date.parse(b.createdAt);
            if (!isNaN(dt) && dt > 0) return dt;
          }
          if (b.id && typeof b.id === 'string') {
            const match = b.id.match(/\d{10,}/);
            if (match) {
              const parsed = parseInt(match[0], 10);
              if (!isNaN(parsed) && parsed > 0) return parsed;
            }
          }
          return 0;
        }

        if (customBlocks && customBlocks.length > 0) {
          shuffledBlocks = [...customBlocks].sort((a, b) => {
            const tsA = getPromoSortTimestamp(a);
            const tsB = getPromoSortTimestamp(b);
            if (tsA !== tsB && tsA > 0 && tsB > 0) return tsB - tsA;
            if (tsA > 0 && tsB === 0) return -1;
            if (tsB > 0 && tsA === 0) return 1;
            return 0;
          });
        } else {
          shuffledBlocks = [];
        }

        // Scroll listener for floating scroll-to-top button
        window.addEventListener('scroll', () => {
          const btn = document.getElementById('scrollTopBtn');
          if (btn) {
            if (window.scrollY > 300) {
              btn.classList.remove('hidden');
            } else {
              btn.classList.add('hidden');
            }
          }
        });

        try { renderCategories(); } catch(e) { console.error('renderCategories error:', e); }
        try { renderPromotions(); } catch(e) { console.error('renderPromotions error:', e); }
        try { renderCatalog(); } catch(e) { console.error('renderCatalog error:', e); }
        try { updateFavoriteCounters(); } catch(e) { console.error('updateFavoriteCounters error:', e); }
        try { startPromosAutoplay(); } catch(e) {}

        // Baseline history initialization
        if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#menu') {
          try {
            window.history.replaceState({ step: 'main' }, '', '#main');
          } catch(e) {}
        }

        // Simple unified hashchange listener for robust hardware back support and routing
        window.addEventListener('hashchange', syncUIWithHash);

        // Check query parameter or Hash to open specific product automatically on load
        let prodId = null;
        try {
          const urlParams = new URLSearchParams(window.location.search || '');
          prodId = urlParams.get('p');
        } catch(e) {}

        if (prodId) {
          try { window.location.hash = '#prod-' + prodId; } catch(e) {}
        } else {
          syncUIWithHash();
        }

        isAppFullyInitialized = true;
        setTimeout(hideLoadingNotice, 750);
      } catch(globalErr) {
        console.error('Error during init:', globalErr);
        try { renderCategories(); } catch(e) {}
        try { renderCatalog(); } catch(e) {}
        hideLoadingNotice();
      }
    }

    function renderPromotions() {
      const container = document.getElementById('promosSection');
      if (!container) return;

      if (!shuffledBlocks || shuffledBlocks.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
      }

      container.classList.remove('hidden');
      container.innerHTML = \`
        <div id="promosScrollContainer" class="flex gap-4 overflow-x-auto pb-2.5 snap-x snap-mandatory scroll-smooth" onmouseenter="pausePromos()" onmouseleave="resumePromos()" ontouchstart="pausePromos()">
          \${shuffledBlocks.map(block => {
            const hasImg = !!block.image;
            return \`
              <div onclick="openPromoModal('\${block.id}')" class="snap-start shrink-0 w-[290px] sm:w-[360px] bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-sm hover:border-stone-400 transition-all overflow-hidden flex flex-row cursor-pointer select-none">
                \${hasImg ? \`
                  <div class="w-24 h-24 sm:w-28 sm:h-28 bg-stone-50 flex-shrink-0 border-r border-stone-100">
                    <img src="\${block.image}" alt="\${block.title}" class="w-full h-full object-cover pointer-events-none">
                  </div>
                \` : ''}
                <div class="p-3 flex-grow flex flex-col justify-between min-w-0">
                  <div>
                    <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                      <h4 class="font-semibold text-stone-900 text-sm truncate max-w-[150px] sm:max-w-[200px]" title="\${block.title}">\${block.title}</h4>
                      \${block.badge ? \`
                        <span class="text-xs text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style="background-color: \${design.primaryColor}">
                          \${block.badge}
                        </span>
                      \` : ''}
                    </div>
                    <p class="text-xs text-stone-600 leading-relaxed font-sans line-clamp-3 whitespace-pre-line">\${block.content}</p>
                  </div>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    function renderCategories() {
      if (!products || products.length === 0) {
        loadAllCatalogData();
      }
      const container = document.getElementById('categoryContainer');
      if (!container) return;
      container.innerHTML = '';
      
      // Build unified list of categories (from categories array and products)
      const catMap = new Map();
      (categories || []).forEach(cat => {
        if (cat && typeof cat === 'string' && cat.trim() !== '' && cat.toUpperCase() !== 'TODOS') {
          const trimmed = cat.trim();
          catMap.set(trimmed.toLowerCase(), trimmed);
        }
      });

      (products || []).forEach(p => {
        const pCats = getProductCategories(p);
        pCats.forEach(cat => {
          if (cat && typeof cat === 'string' && cat.trim() !== '' && cat.toUpperCase() !== 'TODOS') {
            const trimmed = cat.trim();
            if (!catMap.has(trimmed.toLowerCase())) {
              catMap.set(trimmed.toLowerCase(), trimmed);
            }
          }
        });
      });

      const activeCats = ['TODOS', ...Array.from(catMap.values())];

      activeCats.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat === 'TODOS' ? 'Todos' : cat;
        
        const isSelected = currentCategory.trim().toLowerCase() === cat.trim().toLowerCase();
        btn.className = 'snap-start shrink-0 text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out cursor-pointer border ' +
          (isSelected
            ? 'text-white border-transparent shadow-xs scale-[1.02]'
            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300');
        
        if (isSelected) {
          btn.style.backgroundColor = design.primaryColor || '#78716c';
        }

        btn.onclick = () => {
          currentCategory = cat;
          renderCategories();
          renderCatalog();
        };
        container.appendChild(btn);
      });
    }

    function toggleFavorite(prodId) {
      if (!prodId) return;
      const cleanFavs = Array.from(new Set(favorites)).filter(id => id && String(id).trim() !== '');
      const idx = cleanFavs.indexOf(prodId);
      if (idx > -1) {
        cleanFavs.splice(idx, 1);
      } else {
        cleanFavs.push(prodId);
      }
      persistFavorites(cleanFavs);
      updateFavoriteCounters();
      renderCatalog();
    }

    function toggleModalFavorite(prodId) {
      toggleFavorite(prodId);
      const isFav = favorites.includes(prodId);
      const btn = document.getElementById('modalFavBtn');
      if (btn) {
        if (isFav) {
          btn.className = "w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer bg-red-50 border-red-100 text-red-700 hover:bg-red-100";
          btn.innerHTML = "❤ Favorito";
        } else {
          btn.className = "w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100";
          btn.innerHTML = "♡ Guardar";
        }
      }
    }

    function updateFavoriteCounters() {
      const el = document.getElementById('favCount');
      if (el) {
        const validFavCount = favorites.filter(favId => products.some(p => p.id === favId)).length;
        el.textContent = validFavCount;
      }
      const menuBadge = document.getElementById('menuFavCountBadge');
      if (menuBadge) {
        const validFavCount = favorites.filter(favId => products.some(p => p.id === favId)).length;
        menuBadge.textContent = validFavCount;
      }
    }

    function toggleConfigMenu() {
      if (window.location.hash === '#menu') {
        closeActiveModal();
      } else {
        window.location.hash = '#menu';
      }
    }

    function closeConfigMenu() {
      if (window.location.hash === '#menu') {
        closeActiveModal();
      } else {
        const menu = document.getElementById('configMenu');
        const backdrop = document.getElementById('configMenuBackdrop');
        const settingsGearIcon = document.getElementById('settingsGearIcon');
        if (menu && backdrop) {
          menu.classList.add('hidden');
          backdrop.classList.add('hidden');
          if (settingsGearIcon) {
            settingsGearIcon.classList.remove('rotate-90', 'text-amber-500');
          }
        }
      }
    }

    function navigateToTargetHash(targetHash) {
      if (window.location.hash === targetHash) {
        syncUIWithHash();
        return;
      }
      if (window.location.hash === '#menu') {
        try {
          window.history.replaceState({ step: targetHash }, '', targetHash);
        } catch(e) {
          try { window.location.hash = targetHash; } catch(err) {}
        }
        syncUIWithHash();
      } else {
        try { window.location.hash = targetHash; } catch(e) {}
      }
    }

    function openFavoritesScreen() {
      navigateToTargetHash('#favorites');
    }

    function closeFavoritesScreen() {
      closeActiveModal();
    }

    function openCompanyScreen() {
      navigateToTargetHash('#company');
    }

    function closeCompanyScreen() {
      closeActiveModal();
    }

    function openAboutScreen() {
      navigateToTargetHash('#about');
    }

    function closeAboutScreen() {
      closeActiveModal();
    }

    // Navigation & Screen Helpers
    function openHowItWorksScreen() {
      navigateToTargetHash('#how-it-works');
    }

    function closeHowItWorksScreen() {
      closeActiveModal();
    }

    function closeExitConfirmModal() {
      const exitModal = document.getElementById('exitConfirmModal');
      if (exitModal) {
        exitModal.classList.add('hidden');
        exitModal.classList.remove('flex');
      }
      if (!window.location.hash || window.location.hash === '#' || window.location.hash === '') {
        try {
          window.history.pushState({ step: 'main' }, '', '#main');
        } catch(e) {
          try { window.location.hash = '#main'; } catch(err) {}
        }
      }
    }

    function confirmExit() {
      try { window.close(); } catch(e) {}
      try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'close_catalog' }, '*'); } catch(e) {}
      setTimeout(() => {
        try { window.history.go(-2); } catch(e) {}
        setTimeout(() => { try { window.location.href = 'about:blank'; } catch(e) {} }, 100);
      }, 100);
    }

    function renderFavoritesScreenList() {
      const container = document.getElementById('favoritesScreenListContainer');
      if (!container) return;
      
      const validFavs = products.filter(p => favorites.includes(p.id));
      if (validFavs.length === 0) {
        container.innerHTML = \`
          <div class="text-center py-12 px-4 space-y-3">
            <span class="text-4xl">❤️</span>
            <p class="text-sm font-semibold text-stone-700">No tienes productos guardados aún</p>
            <p class="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              Presione el ícono de corazón en los productos para agregarlos a sus favoritos de exhibición e iniciar una colección personalizada.
            </p>
          </div>
        \`;
        return;
      }
      
      let favsCardsHTML = '';
      validFavs.forEach(prod => {
        const validImages = (prod.images || []).filter(img => img && img.trim() !== '');
        const primaryIdx = typeof prod.primaryImageIndex === 'number' ? prod.primaryImageIndex : 0;
        const displayImg = validImages[primaryIdx] || validImages[0];
        const hasImg = !!displayImg;
        const priceText = prod.price && prod.price > 0 ? '$' + prod.price.toLocaleString() : 'Consultar';
        
        const imgHTML = hasImg 
          ? '<img src="' + displayImg + '" alt="' + prod.name + '" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">'
          : '<div class="w-full h-full flex items-center justify-center bg-stone-200/60 text-stone-400 text-[10px]">Sin foto</div>';

        favsCardsHTML += \`
          <div onclick="selectProductFromFavs('\${prod.id}')" class="flex gap-3 bg-stone-50 hover:bg-stone-100/70 p-2.5 rounded-xl border border-stone-200/60 transition-all cursor-pointer group">
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/50 flex-shrink-0 relative">
              \${imgHTML}
            </div>
            <div class="flex-grow min-w-0 flex flex-col justify-between">
              <div>
                <h4 class="text-xs font-bold text-stone-850 truncate group-hover:text-amber-950 transition-colors">\${prod.name}</h4>
                <p class="text-[10px] text-stone-450 uppercase tracking-wider font-semibold mt-0.5">\${prod.category}</p>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs font-black text-[#1c1917] font-mono">\${priceText}</span>
                <button onclick="event.stopPropagation(); removeFavoriteFromScreen('\${prod.id}')" class="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer" title="Eliminar de favoritos">
                  ✕
                </button>
              </div>
            </div>
          </div>
        \`;
      });

      container.innerHTML = \`
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
          \${favsCardsHTML}
        </div>
      \`;
    }

    function selectProductFromFavs(prodId) {
      openProductModal(prodId);
    }

    function removeFavoriteFromScreen(prodId) {
      toggleFavorite(prodId);
      renderFavoritesScreenList();
    }

    window.selectProductFromFavs = selectProductFromFavs;
    window.removeFavoriteFromScreen = removeFavoriteFromScreen;

    async function shareCatalogLinkFromMenu() {
      closeConfigMenu();
      await shareCatalogLink();
    }

    async function shareCatalogLink() {
      const url = '${escapeForJSString(project.design.shareUrl || '')}' || window.location.href;
      const title = '${escapeForJSString(project.name || 'Catálogo Digital')}' || 'Catálogo Digital';
      const text = formatCatalogShareText(url);
      const copyLinkBtnText = document.getElementById('copyLinkBtnText');

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (err) {}
      }

      try {
        await navigator.clipboard.writeText(url);
        if (copyLinkBtnText) copyLinkBtnText.textContent = "¡Copiado!";
        setTimeout(() => {
          if (copyLinkBtnText) copyLinkBtnText.textContent = "Copiar Link";
        }, 1500);
      } catch (err) {
        window.prompt("Copia el enlace del catálogo:", url);
      }
    }

    async function handleExporterShare() {
      const url = '${escapeForJSString(project.design.shareUrl || '')}' || window.location.href;
      const title = '${escapeForJSString(project.name || 'Catálogo Digital')}' || 'Catálogo Digital';
      const text = formatCatalogShareText(url);
      const btn = document.getElementById('shareToggleBtn');
      const textSpan = document.getElementById('shareBtnText');
      
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (err) {}
      }
      
      try {
        await navigator.clipboard.writeText(url);
        if (textSpan) textSpan.textContent = "Copiado!";
        if (btn) btn.className = "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-bold transition-all bg-emerald-600 border-emerald-600 text-white cursor-pointer shadow-sm";
        setTimeout(() => {
          if (textSpan) textSpan.textContent = "Compartir";
          if (btn) btn.className = "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-bold transition-all bg-amber-50/50 border-amber-100 text-amber-800 hover:bg-amber-100 cursor-pointer";
        }, 1500);
      } catch (err) {
        window.prompt("Copia el enlace del catálogo:", url);
      }
    }

    function normalizeText(str) {
      if (!str) return '';
      try {
        return String(str)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      } catch(e) {
        return String(str).toLowerCase();
      }
    }

    function escapeHTML(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getRelatedProducts(target, allProducts, limit) {
      if (!target || !Array.isArray(allProducts) || allProducts.length <= 1) return [];
      limit = typeof limit === 'number' ? limit : 3;

      const candidates = allProducts.filter(function(p) { return p && p.id !== target.id; });
      if (candidates.length === 0) return [];

      const targetCats = getProductCategories(target).map(function(c) { return normalizeText(c); }).filter(Boolean);
      const targetTags = (Array.isArray(target.tags) ? target.tags : [])
        .map(function(t) { return normalizeText(t); })
        .filter(Boolean);

      const productIndices = {};
      allProducts.forEach(function(p, idx) {
        if (p && p.id) productIndices[p.id] = idx;
      });

      const scored = candidates.map(function(p) {
        const pCats = getProductCategories(p).map(function(c) { return normalizeText(c); }).filter(Boolean);
        const pTags = (Array.isArray(p.tags) ? p.tags : [])
          .map(function(t) { return normalizeText(t); })
          .filter(Boolean);

        const catMatches = targetCats.filter(function(c) { return pCats.includes(c); }).length;
        const tagMatches = targetTags.filter(function(t) { return pTags.includes(t); }).length;

        const totalTargetCats = Math.max(targetCats.length, 1);
        const totalTargetTags = targetTags.length;

        const is100CategoryMatch = catMatches === targetCats.length && targetCats.length > 0;
        const is100TagMatch = totalTargetTags > 0 ? tagMatches === totalTargetTags : true;
        const is100PercentMatch = is100CategoryMatch && is100TagMatch;

        return {
          product: p,
          is100PercentMatch: is100PercentMatch,
          catMatches: catMatches,
          catScore: catMatches / totalTargetCats,
          tagMatches: tagMatches,
          tagScore: totalTargetTags > 0 ? tagMatches / totalTargetTags : 0,
          originalIndex: typeof productIndices[p.id] === 'number' ? productIndices[p.id] : 0
        };
      });

      scored.sort(function(a, b) {
        if (a.is100PercentMatch && !b.is100PercentMatch) return -1;
        if (!a.is100PercentMatch && b.is100PercentMatch) return 1;

        if (b.catMatches !== a.catMatches) {
          return b.catMatches - a.catMatches;
        }

        if (b.tagMatches !== a.tagMatches) {
          return b.tagMatches - a.tagMatches;
        }

        return a.originalIndex - b.originalIndex;
      });

      return scored.slice(0, limit).map(function(s) { return s.product; });
    }

    function renderCatalog() {
      const grid = document.getElementById('productsGrid') || document.getElementById('prodGrid');
      if (!grid) return;
      grid.innerHTML = '';

      const searchInput = document.getElementById('searchInput');
      const q = normalizeText(searchInput ? searchInput.value : '');
      const validFavs = getValidFavorites();

      let matching = (products || []).filter(function(p) {
        if (!p) return false;
        const nameText = normalizeText(p.name);
        const pCats = getProductCategories(p);
        const catText = normalizeText(pCats.join(' '));
        const matText = normalizeText(p.material);
        const descText = normalizeText(p.description);
        const tagsText = normalizeText((Array.isArray(p.tags) ? p.tags : []).join(' '));

        const matchesSearch = !q || nameText.includes(q) || catText.includes(q) || matText.includes(q) || descText.includes(q) || tagsText.includes(q);
        const matchesCat = currentCategory === 'TODOS' || pCats.some(function(c) { return normalizeText(c) === normalizeText(currentCategory); });
        const matchesFav = !favoritesOnly || validFavs.includes(p.id);

        return matchesSearch && matchesCat && matchesFav;
      });

      const sortEl = document.getElementById('sortSelect');
      const sortBy = sortEl ? sortEl.value : 'default';
      if (sortBy === 'default') {
        matching = sortProductsNewestFirst(matching);
      } else if (sortBy === 'alpha') {
        matching.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      } else if (sortBy === 'alpha_desc') {
        matching.sort((a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }));
      } else if (sortBy === 'price_asc') {
        matching.sort((a, b) => {
          var priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
          var priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;
          if (priceA === 0 && priceB > 0) return 1;
          if (priceB === 0 && priceA > 0) return -1;
          return priceA - priceB;
        });
      } else if (sortBy === 'price_desc') {
        matching.sort((a, b) => {
          var priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
          var priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;
          return priceB - priceA;
        });
      } else if (sortBy === 'views') {
        const productIndices = {};
        (products || []).forEach((p, idx) => {
          if (p && p.id) productIndices[p.id] = idx;
        });
        matching.sort((a, b) => {
          const diff = getProductViews(b) - getProductViews(a);
          if (diff !== 0) return diff;
          const tsA = lastViewedTimestamps[a.id] || 0;
          const tsB = lastViewedTimestamps[b.id] || 0;
          if (tsB !== tsA) return tsB - tsA;
          return (typeof productIndices[a.id] === 'number' ? productIndices[a.id] : 0) - (typeof productIndices[b.id] === 'number' ? productIndices[b.id] : 0);
        });
      }

      const itemCountEl = document.getElementById('itemCount');
      if (itemCountEl) {
        itemCountEl.textContent = matching.length;
      }

      if (matching.length === 0) {
        grid.innerHTML = \`<div class="col-span-full py-16 text-center text-stone-400 italic text-xs">
          🏜️ No se encontraron productos coincidentes en este filtro.
        </div>\`;
        return;
      }

      const fragment = document.createDocumentFragment();
      const trendingProductIds = getTrendingProductIds();

      matching.forEach((p, idx) => {
        const isFav = favorites.includes(p.id);
        const pImgIdx = typeof p.primaryImageIndex === 'number' ? p.primaryImageIndex : 0;
        const pImages = Array.isArray(p.images) ? p.images : [];
        const principalImg = pImages[pImgIdx] || pImages[0] || p.image;
        const hasImg = !!principalImg;
        const card = document.createElement('div');
        card.className = "bg-white rounded-xl border border-stone-200/85 p-3.5 flex flex-col justify-between hover:border-stone-400 hover:shadow-sm transition-all group cursor-pointer";
        card.onclick = () => openProductModal(p.id);
        
        const views = getProductViews(p);
        const pCats = getProductCategories(p);
        const isTrending = trendingProductIds.has(p.id);

        let viewsHTML = '';
        if (isTrending) {
          viewsHTML = \`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">🔥 \${views}</span>\`;
        } else {
          viewsHTML = \`<span class="text-stone-400 flex items-center gap-1 text-[11px]">👁️ \${views}</span>\`;
        }

        const priceHTML = (typeof p.price === 'number' && p.price > 0)
          ? \`<span class="text-xs font-bold text-stone-900 font-sans tracking-tight">$\${p.price} <span class="text-[10px] font-semibold text-stone-500">\${escapeHTML(p.currency || 'USD')}</span></span>\`
          : \`<span class="text-[11px] text-stone-400 font-medium">Consultar</span>\`;

        const safeName = escapeHTML(p.name || 'Producto');
        const safeId = escapeHTML(p.id);
        const catsHTML = pCats.map(c => '<span class="text-[10px] text-stone-500 font-semibold uppercase tracking-wider bg-stone-100 px-1.5 py-0.5 rounded">' + escapeHTML(c) + '</span>').join('');

        const isPriority = idx < 6;
        const loadingAttr = isPriority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';

        card.innerHTML = \`
          <div class="w-full aspect-square bg-stone-100 rounded-lg overflow-hidden relative border border-stone-100 flex items-center justify-center">
            \${hasImg 
              ? '<img src="' + escapeHTML(principalImg) + '" alt="' + safeName + '" ' + loadingAttr + ' decoding="async" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-1" onerror="this.style.display=\\'none\\';if(this.nextElementSibling)this.nextElementSibling.style.display=\\'flex\\';">' +
                '<div class="w-full h-full flex-col items-center justify-center text-stone-300 text-xs font-semibold" style="display:none;">Sin foto</div>'
              : '<div class="w-full h-full flex flex-col items-center justify-center text-stone-300 text-xs font-semibold">Sin foto</div>'
            }
            <button onclick="event.stopPropagation(); toggleFavorite('\${safeId}')" class="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full border shadow-sm transition-all cursor-pointer z-10 \${
              isFav 
                ? 'bg-red-50 border-red-200 text-red-500 scale-105' 
                : 'bg-white/80 border-transparent hover:bg-white text-stone-400 hover:text-red-500 scale-105'
            }">
              ❤
            </button>
          </div>
          <div class="mt-3 flex-grow flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-semibold text-stone-850 text-sm truncate group-hover:text-amber-800">\${safeName}</h4>
              </div>
              <div class="flex flex-wrap gap-1 mt-0.5">\${catsHTML}</div>
            </div>
            <div class="mt-3 pt-2 border-t border-stone-100/80 flex items-center justify-between text-stone-600 gap-2">
              \${priceHTML}
              <span class="text-xs font-sans font-medium flex items-center flex-shrink-0">
                \${viewsHTML}
              </span>
            </div>
          </div>
        \`;
        fragment.appendChild(card);
      });
      grid.appendChild(fragment);
    }

    function handleSortChange() {
      renderCatalog();
    }

    function sendQuickWhatsApp(id) {
      const p = products.find(prod => prod.id === id);
      if(!p) return;
      const cleanPhone = (contact.phone || '').replace(/[+\\s-]/g, '');
      const text = formatConsultProductText(p);
      window.open('https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(text), '_blank');
    }

    let isGeneratingExportScreenshot = false;

    function fallbackShareText(prod, text) {
      if (navigator.share) {
        navigator.share({
          title: prod.name,
          text: text,
        }).catch(err => console.log(err));
      } else {
        navigator.clipboard.writeText(text).then(() => {
          const shareBtnText = document.getElementById('modalShareText');
          if (shareBtnText) {
            shareBtnText.innerText = '¡Copiado!';
            setTimeout(() => {
              shareBtnText.innerText = 'Compartir';
            }, 2000);
          }
        });
      }
    }

    function downloadBlob(blob, fileName) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }

    async function shareProductDetail(id) {
      if (isGeneratingExportScreenshot) return;
      const prod = products.find(p => p.id === id);
      if (!prod) return;

      const detailText = formatProductShareText(prod);

      const shareBtnText = document.getElementById('modalShareText');
      const shareBtn = document.getElementById('modalShareBtn');

      const validImages = (prod.images || []).filter(img => img && img.trim() !== '');
      const imgUrl = validImages[prod.primaryImageIndex ?? 0] || validImages[0] || '';

      isGeneratingExportScreenshot = true;
      if (shareBtnText) shareBtnText.innerText = 'Cargando...';
      if (shareBtn) shareBtn.style.opacity = '0.7';

      try {
        let file = null;
        let blob = null;

        if (imgUrl) {
          if (imgUrl.startsWith('data:')) {
            const arr = imgUrl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            blob = new Blob([u8arr], { type: mime });
            const extension = mime.split('/')[1] || 'png';
            file = new File([blob], prod.name.replace(/\\s+/g, '_') + '.' + extension, { type: mime });
          } else {
            const response = await fetch(imgUrl);
            blob = await response.blob();
            const extension = blob.type.split('/')[1] || 'png';
            file = new File([blob], prod.name.replace(/\\s+/g, '_') + '.' + extension, { type: blob.type });
          }
        }

        if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: prod.name,
              text: detailText,
              files: [file]
            });
          } catch (err) {
            console.log('Error sharing files, downloading instead:', err);
            if (blob) {
              const extension = blob.type.split('/')[1] || 'png';
              downloadBlob(blob, prod.name.replace(/\\s+/g, '_') + '.' + extension);
            }
            fallbackShareText(prod, detailText);
          }
        } else {
          if (blob) {
            const extension = blob.type.split('/')[1] || 'png';
            downloadBlob(blob, prod.name.replace(/\\s+/g, '_') + '.' + extension);
          }
          fallbackShareText(prod, detailText);
        }
      } catch (err) {
        console.error('Sharing failed, falling back to text:', err);
        fallbackShareText(prod, detailText);
      } finally {
        isGeneratingExportScreenshot = false;
        if (shareBtnText) shareBtnText.innerText = 'Compartir';
        if (shareBtn) shareBtn.style.opacity = '1';
      }
    }

    async function consultProductDetail(id) {
      const prod = products.find(p => p.id === id);
      if (!prod) return;

      const detailText = formatConsultProductText(prod);
      const cleanPhone = contact && contact.phone ? contact.phone.replace(/[+\\s-]/g, '') : '';
      const imgInfo = getProductImageInfo(prod);
      const rawImg = imgInfo.rawImg;

      try {
        let file = null;
        if (rawImg) {
          if (rawImg.startsWith('data:')) {
            const arr = rawImg.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const extension = mime.split('/')[1] || 'png';
            file = new File([blob], prod.name.replace(/\\s+/g, '_') + '.' + extension, { type: mime });
          } else if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
            const response = await fetch(rawImg);
            const blob = await response.blob();
            const extension = blob.type.split('/')[1] || 'png';
            file = new File([blob], prod.name.replace(/\\s+/g, '_') + '.' + extension, { type: blob.type });
          }
        }

        if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: prod.name,
              text: detailText,
              files: [file]
            });
            return;
          } catch (err) {
            console.log('Error sharing files, opening direct WhatsApp URL:', err);
          }
        }
      } catch (err) {
        console.error('Sharing failed, opening direct WhatsApp URL:', err);
      }

      const whatsappUrl = cleanPhone 
        ? 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(detailText)
        : 'https://api.whatsapp.com/send?text=' + encodeURIComponent(detailText);

      window.open(whatsappUrl, '_blank');
    }

    function setModalMainImage(btn) {
      if (!btn) return;
      const imgEl = btn.querySelector('img');
      if (!imgEl) return;
      const imgUrl = imgEl.src;
      const mainImg = document.getElementById('modalMainImg');
      if (mainImg) {
        mainImg.src = imgUrl;
      }
      const buttons = document.querySelectorAll('.thumbnail-btn');
      buttons.forEach(function(b) {
        b.className = "thumbnail-btn w-12 h-12 rounded-md overflow-hidden border-2 bg-white transition-all cursor-pointer border-stone-200 hover:border-stone-400";
      });
      btn.className = "thumbnail-btn w-12 h-12 rounded-md overflow-hidden border-2 bg-white transition-all cursor-pointer border-amber-700 scale-105 shadow-xs";
    }

    function openProductModal(id) {
      navigateToTargetHash('#prod-' + id);
    }

    function populateProductModalData(id) {
      const p = products.find(prod => prod.id === id);
      if(!p) return;
      
      activeModalProductId = id; // Track current open product in modal

      // Check if product view was already registered in the active session
      // (prevents incrementing view on browser refresh/reload inside the product)
      const sessionActiveKey = 'active-viewed-prod-' + pId;
      let isSameSession = false;
      try {
        isSameSession = sessionStorage.getItem(sessionActiveKey) === id;
      } catch(e) {}

      if (!isSameSession) {
        try { sessionStorage.setItem(sessionActiveKey, id); } catch(e) {}

        const currentViews = getProductViews(p);
        localViews[id] = currentViews + 1;
        lastViewedTimestamps[id] = Date.now();
        persistViews(localViews);
        try {
          localStorage.setItem(lastViewedKey, JSON.stringify(lastViewedTimestamps));
        } catch(e) {}

        // Update main page views instantly
        if (typeof renderCatalog === 'function') {
          renderCatalog();
        }

        // Synchronize with all backend endpoints (100% online)
        const endpoints = getApiEndpoints();
        endpoints.forEach(function(base) {
          try {
            fetch(base + '/api/views/' + '${project.id}' + '/' + id, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ baseViews: currentViews })
            })
              .then(function(res) {
                if (!res.ok) throw new Error('API error');
                return res.json();
              })
              .then(function(data) {
                if (data && typeof data === 'object') {
                  mergeViews(data);
                  persistViews(localViews);
                  updateModalViewsDisplay(p);
                  if (typeof renderCatalog === 'function') {
                    renderCatalog();
                  }
                }
              })
              .catch(function(e) {
                console.error('Error recording view count:', e);
              });
          } catch(e) {}
        });
      }
      
      const detailsDiv = document.getElementById('appProductDetails');
      const imgCont = document.getElementById('modalImgContainer');
      const txtCont = document.getElementById('modalTextContainer');

      const validImages = (p.images || []).filter(img => img && img.trim() !== '');
      const pModalImgIdx = typeof p.primaryImageIndex === 'number' ? p.primaryImageIndex : 0;
      const initialImg = validImages[pModalImgIdx] || validImages[0];

      const prodLink = window.location.origin + window.location.pathname + '#prod-' + p.id;
      let imgPart = '';
      if (initialImg && !initialImg.startsWith('data:')) {
        const absoluteImg = initialImg.startsWith('http') 
          ? initialImg 
          : window.location.origin + (initialImg.startsWith('/') ? '' : '/') + initialImg;
        imgPart = '\\n🖼️ *Imagen:* ' + absoluteImg;
      }
      const catText = getProductCategories(p).join(', ');
      const waMessageText = 'Hola, estoy interesado en consultar sobre el siguiente producto de su catálogo:\\n\\n*Producto:* ' + p.name + '\\n*Categoría:* ' + catText + imgPart + '\\n\\n¿Podría brindarme más detalles?';

      imgCont.innerHTML = \`
        <div class="w-full aspect-square relative overflow-hidden bg-stone-100 rounded-lg flex items-center justify-center">
          \${initialImg 
            ? '<img id="modalMainImg" src="' + initialImg + '" alt="' + escapeHTML(p.name) + '" loading="eager" fetchpriority="high" decoding="async" referrerpolicy="no-referrer" class="absolute inset-0 w-full h-full object-contain transition-all duration-200" onerror="this.style.display=\\'none\\';if(this.nextElementSibling)this.nextElementSibling.style.display=\\'flex\\';">' +
              '<div class="absolute inset-0 flex-col items-center justify-center text-stone-300 text-xs font-semibold" style="display:none;">Sin imagen</div>'
            : '<div class="absolute inset-0 flex items-center justify-center text-stone-300">Sin Imagen</div>'
          }
        </div>
        \${validImages.length > 1 ? \`
          <div class="mt-4 w-full">
            <p class="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 text-center">Fotos de Muestra</p>
            <div class="flex flex-wrap gap-2 justify-center">
              \${validImages.map((img, idx) => {
                const isActive = img === initialImg;
                return \`
                  <button
                    onclick="setModalMainImage(this)"
                    onmouseenter="setModalMainImage(this)"
                    class="thumbnail-btn w-12 h-12 rounded-md overflow-hidden border-2 bg-white transition-all cursor-pointer \${
                      isActive ? 'border-amber-700 scale-105 shadow-xs' : 'border-stone-200 hover:border-stone-400'
                    }"
                  >
                    <img src="\${img}" alt="Vista \${idx + 1}" class="w-full h-full object-cover" loading="eager" decoding="async" referrerpolicy="no-referrer">
                  </button>
                \`;
              }).join('')}
            </div>
          </div>
        \` : ''}
      \`;

      const isFav = favorites.includes(p.id);
      const viewsDisplayCount = getProductViews(p);

      // Compute trending status for detailed view highlight across categories
      const trendingProductIds = getTrendingProductIds();
      const isTrending = trendingProductIds.has(p.id);

      let viewsHTML = '';
      if (isTrending) {
        viewsHTML = \`
          <div
            title="¡Este producto es tendencia en su categoría!"
            class="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap bg-amber-50 border-amber-200 text-amber-700 shadow-2xs select-none"
          >
            🔥 <span id="modalProductViews">\${viewsDisplayCount}</span> <span id="modalProductViewsLabel">\${viewsDisplayCount === 1 ? 'vista' : 'vistas'}</span>
          </div>
        \`;
      } else {
        viewsHTML = \`
          <div
            class="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap bg-stone-50 border-stone-200 text-stone-700 select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span id="modalProductViews">\${viewsDisplayCount}</span> <span id="modalProductViewsLabel">\${viewsDisplayCount === 1 ? 'vista' : 'vistas'}</span>
          </div>
        \`;
      }

      let tagsHTML = '';
      const sortedTags = getProductTags(p);
      if (sortedTags.length > 0) {
        tagsHTML = '<div class="flex flex-wrap gap-1 mt-2">' + 
          sortedTags.map(tag => '<span class="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">#' + escapeHTML(tag) + '</span>').join('') + 
          '</div>';
      }

      txtCont.innerHTML = \`
        <div>
          <h3 class="text-xl md:text-2xl font-extrabold text-stone-950 tracking-tight leading-tight">\${p.name}</h3>
          <div class="flex flex-wrap gap-1 mt-1">\${getProductCategories(p).map(c => '<span class="text-xs text-stone-600 font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded border border-stone-200">' + escapeHTML(c) + '</span>').join('')}</div>
          
          \${tagsHTML}

          <div class="grid grid-cols-3 gap-1.5 w-full mt-4">
            \${viewsHTML}
            <button 
              id="modalFavBtn"
              onclick="event.stopPropagation(); toggleModalFavorite('\${p.id}')"
              class="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer \${
                favorites.includes(p.id) 
                  ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100' 
                  : 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100'
              }"
            >
              \${favorites.includes(p.id) ? '❤ Favorito' : '♡ Guardar'}
            </button>
            <button
              id="modalShareBtn"
              onclick="event.stopPropagation(); shareProductDetail('\${p.id}')"
              class="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span id="modalShareText">Compartir</span>
            </button>
          </div>
          
          <div class="mt-4 space-y-2 text-xs text-stone-600 leading-relaxed font-sans">
            \${p.description && p.description.trim() !== '' ? '<p class="italic">' + p.description + '</p>' : ''}
            \${p.dimensions && p.dimensions.trim() !== '' ? '<p>📐 <strong>Medidas:</strong> ' + p.dimensions + '</p>' : ''}
            \${p.material && p.material.trim() !== '' ? '<p>🪵 <strong>Materiales:</strong> ' + p.material + '</p>' : ''}
            \${p.moq && parseInt(p.moq) > 1 ? '<p>📦 <strong>Mínimo de Compra (MOQ):</strong> ' + p.moq + ' unidades</p>' : ''}
            \${p.colors && p.colors.length > 0 ? '<p>🎨 <strong>Colores:</strong> ' + p.colors.join(', ') + '</p>' : ''}
          </div>

          \${contact && contact.phone && typeof contact.phone === 'string' && contact.phone.trim() !== '' ? \`
            <button
              onclick="consultProductDetail('\${p.id}')"
              class="mt-5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01] duration-150 cursor-pointer border-none"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.805-9.795.001-2.618-1.019-5.078-2.873-6.932C16.35 2.023 13.895.998 11.28.997 5.875.997 1.474 5.394 1.472 10.796c0 1.512.411 2.99 1.192 4.282l-.426 1.558 1.606-.421 1.62.949-.001-.001zM18.106 14.7c-.33-.165-1.951-.963-2.251-1.072-.3-.109-.518-.165-.736.165-.218.33-.844 1.072-1.035 1.291-.19.218-.382.245-.712.08-1.18-.59-1.977-1.08-2.761-2.422-.206-.352-.02-.54.152-.712.155-.155.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.736-1.774-1.008-2.43-.266-.643-.538-.553-.736-.563-.19-.01-.408-.012-.626-.012-.218 0-.573.082-.873.413-.3.33-1.145 1.118-1.145 2.724 0 1.605 1.169 3.159 1.329 3.378.16.218 2.3 3.511 5.572 4.92.778.335 1.386.535 1.86.686.782.249 1.493.214 2.055.13.628-.094 1.951-.798 2.224-1.57.273-.772.273-1.43.191-1.57-.082-.14-.3-.218-.63-.383z"/>
              </svg>
              <span>Consultar por WhatsApp</span>
            </button>
          \` : ''}
        </div>
        \${p.price && p.price > 0 ? \`
          <div class="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span class="text-xs uppercase font-semibold text-stone-400">Precio FOB</span>
              <p class="text-base font-extrabold text-stone-900">\${p.price} \${p.currency || ''}</p>
            </div>
          </div>
        \` : ''}
      \`;

      // Related products suggestion
      const related = getRelatedProducts(p, products, 3);
      const relatedCont = document.getElementById('modalRelatedContainer');
      if (related.length === 0) {
        relatedCont.classList.add('hidden');
        relatedCont.innerHTML = '';
      } else {
        relatedCont.classList.remove('hidden');
        relatedCont.innerHTML = \`
          <h4 class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 mt-4">Productos Relacionados</h4>
          <div class="grid grid-cols-3 gap-3">
            \${related.map(rp => {
              const rpImg = rp.images && (rp.images[rp.primaryImageIndex ?? 0] || rp.images[0]);
              const hasRpImg = !!rpImg;
              const displayCat = getProductCategories(rp).join(', ') || rp.category;
              return \`
                <div onclick="openProductModal('\${rp.id}')" class="bg-white border border-stone-200/60 rounded-lg p-2.5 flex flex-col justify-between hover:border-stone-400 cursor-pointer group transition-all hover:shadow-xs">
                  <div class="aspect-square w-full bg-stone-50 rounded overflow-hidden flex items-center justify-center border border-stone-100 mb-2 flex-shrink-0 relative">
                    \${hasRpImg 
                      ? '<img src="' + rpImg + '" alt="' + escapeHTML(rp.name) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.outerHTML=\\'<span class=\\\\\\'text-xs text-stone-300 font-semibold\\\\\\'>Sin foto</span>\\';">'
                      : '<span class="text-xs text-stone-300 font-semibold">Sin foto</span>'
                    }
                  </div>
                  <div class="min-w-0">
                    <h5 class="font-semibold text-sm text-stone-850 truncate leading-tight group-hover:text-amber-850">\${rp.name}</h5>
                    <p class="text-xs text-stone-400 uppercase truncate mt-0.5" title="\${escapeHTML(displayCat)}">\${escapeHTML(displayCat)}</p>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        \`;
      }

      // Populate offscreen capture card
      const capCard = document.getElementById('exportCaptureCard');
      if (capCard) {
        let imageSectionHTML = '';
        if (validImages.length === 0) {
          imageSectionHTML = \`
            <div class="w-full h-64 bg-stone-50 border border-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-400 mb-6">
              <span class="text-xs font-semibold">Sin imagen disponible</span>
            </div>
          \`;
        } else if (validImages.length === 1) {
          imageSectionHTML = \`
            <div class="w-full aspect-[4/3] overflow-hidden bg-stone-50 border border-stone-100 rounded-xl mb-6 flex items-center justify-center">
              <img src="\${validImages[0]}" alt="\${p.name}" referrerpolicy="no-referrer" class="max-w-full max-h-full object-contain" crossorigin="anonymous">
            </div>
          \`;
        } else {
          imageSectionHTML = \`
            <div class="mb-6 space-y-3">
              <div class="w-full aspect-[4/3] overflow-hidden bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-center">
                <img src="\${initialImg}" alt="\${p.name}" referrerpolicy="no-referrer" class="max-w-full max-h-full object-contain" crossorigin="anonymous">
              </div>
              <div class="grid grid-cols-4 gap-2">
                \${validImages.slice(0, 4).map((img, i) => \`
                  <div class="aspect-square bg-stone-50 border border-stone-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="\${img}" alt="Vista \${i + 1}" referrerpolicy="no-referrer" class="max-w-full max-h-full object-cover" crossorigin="anonymous">
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        }

        let specsHTML = '';
        if (p.dimensions && p.dimensions.trim() !== '') {
          specsHTML += \`<div>📐 <strong>Medidas:</strong> \${p.dimensions}</div>\`;
        }
        if (p.material && p.material.trim() !== '') {
          specsHTML += \`<div>🪵 <strong>Materiales:</strong> \${p.material}</div>\`;
        }
        if (p.moq && parseInt(p.moq) > 1) {
          specsHTML += \`<div>📦 <strong>Mínimo (MOQ):</strong> \${p.moq} u.</div>\`;
        }
        if (p.colors && p.colors.length > 0) {
          specsHTML += \`<div>🎨 <strong>Colores:</strong> \${p.colors.join(', ')}</div>\`;
        }
        if (p.price && parseFloat(p.price) > 0) {
          specsHTML += \`
            <div class="col-span-2 pt-2 mt-1 border-t border-stone-200/60 flex items-center justify-between text-stone-900 font-sans">
              <span class="font-semibold text-stone-500">Precio FOB:</span>
              <span class="text-sm font-extrabold text-stone-950">\${p.price} \${p.currency || ''}</span>
            </div>
          \`;
        }

        const baseUrl = design.shareUrl || window.location.origin + window.location.pathname;
        const shareProductUrl = baseUrl + '?p=' + p.id;

        const projectTitle = "${escapeForJSString(project.name || 'Catálogo de Productos')}";
        const companyStr = "${escapeForJSString(project.contact?.company || 'Catálogo Digital')}";
        const phoneStr = "${escapeForJSString(project.contact?.phone || '')}";
        const emailStr = "${escapeForJSString(project.contact?.email || '')}";

        capCard.innerHTML = \`
          <div class="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <div>
              <h2 class="text-xl font-bold text-stone-900 tracking-tight">\${projectTitle}</h2>
              <p class="text-xs text-stone-400 font-medium mt-0.5 uppercase tracking-wider">\${companyStr}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">✨ PRODUCTO DESTACADO</span>
            </div>
          </div>

          \${imageSectionHTML}

          <div class="space-y-4">
            <div>
              <h1 class="text-2xl font-extrabold text-stone-950 tracking-tight leading-tight">\${p.name}</h1>
              <p class="text-xs font-semibold text-amber-800 uppercase tracking-wider mt-1">\${p.category}</p>
            </div>

            \${p.description && p.description.trim() !== '' ? \`<p class="text-sm text-stone-600 leading-relaxed italic border-l-2 border-stone-200 pl-3">\${p.description}</p>\` : ''}

            \${specsHTML ? \`<div class="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs text-stone-600 font-sans">\${specsHTML}</div>\` : ''}
          </div>

          <div class="border-t border-stone-150 pt-5 mt-6 flex items-center justify-between text-stone-400 text-[10px]">
            <div>
              <p class="font-semibold text-stone-600">Para consultas o pedidos:</p>
              \${phoneStr ? \`<p class="mt-0.5 text-stone-500 font-medium">WhatsApp: \${phoneStr}</p>\` : ''}
              \${emailStr ? \`<p class="text-stone-500 font-medium">Email: \${emailStr}</p>\` : ''}
            </div>
            <div class="text-right">
              <p class="font-semibold text-amber-700">Ver producto completo en:</p>
              <p class="mt-0.5 text-stone-500 font-mono select-all">\${shareProductUrl}</p>
            </div>
          </div>
        \`;
      }

      // Show and hide elements to guarantee a beautiful full-screen visual layout
      const header = document.getElementById('appHeader');
      if (header) header.classList.add('hidden');

      const filters = document.getElementById('appFilters');
      if (filters) filters.classList.add('hidden');

      const main = document.getElementById('appMain');
      if (main) main.classList.add('hidden');

      const footer = document.getElementById('appFooter');
      if (footer) footer.classList.add('hidden');

      const btnBack = document.getElementById('detailBackButton');
      if (btnBack) btnBack.classList.remove('hidden');

      detailsDiv.classList.remove('hidden');
      
      // Scroll to top instantly
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function closeProductModal() {
      closeActiveModal();
    }

    // Autoplay, swipe-friendly and modal details for Promotions
    let promosInterval = null;
    function startPromosAutoplay() {
      if (shuffledBlocks.length <= 1) return;
      if (promosInterval) clearInterval(promosInterval);
      promosInterval = setInterval(() => {
        const el = document.getElementById('promosScrollContainer');
        if (!el) return;
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        if (el.scrollLeft >= maxScrollLeft - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const firstChild = el.firstElementChild;
          const step = firstChild ? firstChild.offsetWidth + 16 : 300;
          el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' });
        }
      }, 4000);
    }

    function pausePromos() {
      if (promosInterval) {
        clearInterval(promosInterval);
        promosInterval = null;
      }
    }

    function resumePromos() {
      startPromosAutoplay();
    }

    function openPromoModal(blockId) {
      const block = customBlocks.find(b => b.id === blockId);
      if (!block) return;
      
      const imgContainer = document.getElementById('promoModalImgContainer');
      const textContainer = document.getElementById('promoModalTextContainer');
      const modal = document.getElementById('promoModal');
      
      pausePromos();
      
      if (block.image) {
        imgContainer.classList.remove('hidden');
        imgContainer.innerHTML = \`<img src="\${block.image}" alt="\${block.title}" class="max-w-full max-h-[300px] object-contain w-full rounded-lg">\`;
      } else {
        imgContainer.classList.add('hidden');
        imgContainer.innerHTML = '';
      }
      
      textContainer.innerHTML = \`
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <h3 class="font-serif text-lg font-bold text-stone-900">\${block.title}</h3>
          \${block.badge ? \`<span class="text-[9px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style="background-color: \${design.primaryColor}">\${block.badge}</span>\` : ''}
        </div>
        <p class="text-stone-600 font-sans text-xs leading-relaxed whitespace-pre-line mt-2">\${block.content}</p>
      \`;
      
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      pushScreenState();
    }

    function closePromoModal() {
      let backed = false;
      try {
        if (window.history && window.history.state && window.history.state.screenOpen) {
          window.history.back();
          backed = true;
        }
      } catch(e) {}
      if (!backed) {
        const modal = document.getElementById('promoModal');
        if (modal) {
          modal.classList.remove('flex');
          modal.classList.add('hidden');
          document.body.style.overflow = '';
          resumePromos();
        }
      }
    }

    // Ultra-robust multi-triggered initialization engine (guarantees execution across all Android viewers and mobile WebViews)
    let isInitRan = false;
    function safeInit() {
      if (isInitRan) return;
      isInitRan = true;
      try {
        init();
      } catch(err) {
        console.error('Fatal init caught:', err);
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(safeInit, 1);
    } else {
      document.addEventListener('DOMContentLoaded', safeInit);
      window.addEventListener('load', safeInit);
      setTimeout(safeInit, 300);
    }
  </script>
</body>
</html>`;
}
