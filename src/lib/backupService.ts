import { CatalogProject, CatalogProduct, CatalogDesign, ContactInfo, CustomMessages } from '../types';
import { CustomBlock } from '../components/AdminBlocks';
import { sortProductsNewestFirst, getProductSortTimestamp } from './productUtils';
import { sortPromosNewestFirst } from './promoUtils';

/**
 * Converts any image URL (http, relative, blob, etc.) to a Base64 data URL.
 * If the string is already a Base64 data URL, it returns it unchanged.
 */
export async function urlToBase64(url: string): Promise<{ dataUrl: string; ok: boolean }> {
  if (!url || typeof url !== 'string') return { dataUrl: '', ok: true };
  const trimmed = url.trim();
  if (!trimmed) return { dataUrl: '', ok: true };
  
  // Already Base64
  if (trimmed.startsWith('data:image/')) {
    return { dataUrl: trimmed, ok: true };
  }

  // 1. Try fetch API
  try {
    const response = await fetch(trimmed, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
            resolve(reader.result);
          } else {
            reject(new Error('Formato Base64 no válido'));
          }
        };
        reader.onerror = () => reject(new Error('Error de lectura'));
        reader.readAsDataURL(blob);
      });
      return { dataUrl: base64, ok: true };
    }
  } catch (e) {
    // Continue to canvas fallback
  }

  // 2. Canvas element fallback
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const data = canvas.toDataURL('image/png');
            if (data && data.startsWith('data:image/')) {
              return resolve(data);
            }
          }
          reject(new Error('Error en canvas'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = trimmed;
    });
    return { dataUrl, ok: true };
  } catch (e) {
    console.warn(`[BackupService] No se pudo convertir la imagen a Base64: ${trimmed}`);
    return { dataUrl: trimmed, ok: false };
  }
}

export interface ExportBackupResult {
  jsonString: string;
  filename: string;
  totalImages: number;
  failedImages: number;
}

/**
 * Creates a fully self-contained JSON backup with all text data and Base64 encoded images.
 */
export async function createFullJSONBackup(
  project: CatalogProject,
  projects: CatalogProject[] = [],
  customBlocks: CustomBlock[] = [],
  onProgress?: (msg: string) => void
): Promise<ExportBackupResult> {
  onProgress?.('Iniciando empaquetado de respaldo...');

  let totalImages = 0;
  let failedImages = 0;

  const processImage = async (url: string, label: string): Promise<string> => {
    if (!url || !url.trim()) return '';
    totalImages++;
    onProgress?.(`Incrustando imagen en Base64: ${label}`);
    const res = await urlToBase64(url);
    if (!res.ok) {
      failedImages++;
    }
    return res.dataUrl;
  };

  const processProjectImages = async (proj: CatalogProject): Promise<CatalogProject> => {
    const clone: CatalogProject = JSON.parse(JSON.stringify(proj));

    // Design images
    if (clone.design) {
      if (clone.design.logoImage) {
        clone.design.logoImage = await processImage(
          clone.design.logoImage,
          `Logotipo (${proj.name})`
        );
      }
      if (clone.design.bannerImage) {
        clone.design.bannerImage = await processImage(
          clone.design.bannerImage,
          `Banner (${proj.name})`
        );
      }
    }

    // Product images
    if (Array.isArray(clone.products)) {
      for (let i = 0; i < clone.products.length; i++) {
        const prod = clone.products[i];
        const prodName = prod.name || `Producto #${i + 1}`;

        if (Array.isArray(prod.images) && prod.images.length > 0) {
          const newImages: string[] = [];
          for (let j = 0; j < prod.images.length; j++) {
            const b64 = await processImage(
              prod.images[j],
              `Foto ${j + 1} de "${prodName}"`
            );
            if (b64) newImages.push(b64);
          }
          prod.images = newImages;
        }

        if (prod.image) {
          prod.image = await processImage(prod.image, `Foto principal de "${prodName}"`);
        } else if (prod.images && prod.images.length > 0) {
          prod.image = prod.images[0];
        }
      }
    }

    return clone;
  };

  const allProjects = projects.length > 0 ? projects : [project];
  const processedProjects: CatalogProject[] = [];

  for (let idx = 0; idx < allProjects.length; idx++) {
    onProgress?.(`Procesando catálogo ${idx + 1} de ${allProjects.length}...`);
    const processed = await processProjectImages(allProjects[idx]);
    processedProjects.push(processed);
  }

  // Process Custom Blocks
  const processedBlocks: CustomBlock[] = [];
  if (Array.isArray(customBlocks)) {
    for (let idx = 0; idx < customBlocks.length; idx++) {
      const block = { ...customBlocks[idx] };
      if (block.image) {
        block.image = await processImage(block.image, `Bloque "${block.title || idx + 1}"`);
      }
      processedBlocks.push(block);
    }
  }

  const activeProcessed = processedProjects.find(p => p.id === project.id) || processedProjects[0] || project;

  const fullBackupData = {
    version: "2.5",
    exportDate: new Date().toISOString(),
    isSelfContainedBase64: true,
    project: activeProcessed,
    projects: processedProjects,
    customBlocks: processedBlocks
  };

  const safeCatalogName = (project.name || 'catalogo').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `respaldo_catalogo_${safeCatalogName}_${project.id || Date.now()}.json`;
  const jsonString = JSON.stringify(fullBackupData, null, 2);

  return {
    jsonString,
    filename,
    totalImages,
    failedImages
  };
}

export interface ImportRestoreResult {
  success: boolean;
  projects: CatalogProject[];
  customBlocks: CustomBlock[];
  warnings: string[];
  restoredProductsCount: number;
  restoredImagesCount: number;
}

/**
 * Validates Base64 image strings during import.
 * Returns true if valid base64 data url or standard URL.
 */
function isValidImageData(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return true;
  }
  if (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('/') || 
    trimmed.startsWith('./') || 
    trimmed.startsWith('../')
  ) {
    return true;
  }
  // Raw base64 check
  if (trimmed.length > 50 && /^[A-Za-z0-9+/=\r\n\s]+$/.test(trimmed.slice(0, 80))) {
    return true;
  }
  return false;
}

/**
 * Universal Base64 and Raw JSON parser for embedded data nodes
 */
export function parseB64JSON(rawInput: string, fallback: any = null): any {
  if (!rawInput || typeof rawInput !== 'string') return fallback;
  let str = rawInput.trim();
  if (!str) return fallback;

  // 1. Direct JSON check
  if (str.startsWith('[') || str.startsWith('{')) {
    try {
      return JSON.parse(str);
    } catch (e) {}
  }

  // 2. Base64 decoding
  try {
    str = str.replace(/[^A-Za-z0-9+/=]/g, '');
    if (!str) return fallback;
    while (str.length % 4 !== 0) str += '=';
    
    if (typeof atob === 'function') {
      const bin = atob(str);
      if (!bin) return fallback;

      // Try UTF-8 TextDecoder
      try {
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          bytes[i] = bin.charCodeAt(i);
        }
        if (typeof TextDecoder !== 'undefined') {
          const decoded = new TextDecoder('utf-8').decode(bytes);
          return JSON.parse(decoded);
        }
      } catch (e) {}

      // Fallbacks
      try {
        return JSON.parse(decodeURIComponent(escape(bin)));
      } catch (e) {}
      try {
        return JSON.parse(decodeURIComponent(bin));
      } catch (e) {}
      return JSON.parse(bin);
    }
  } catch (e) {}

  return fallback;
}

/**
 * Extracts structured catalog data directly from an exported standalone HTML file (.html).
 */
export function extractCatalogFromHTML(htmlText: string): any | null {
  if (!htmlText || typeof htmlText !== 'string') return null;
  const trimmed = htmlText.trim();
  if (
    !trimmed.includes('<html') && 
    !trimmed.includes('<!DOCTYPE') && 
    !trimmed.includes('data-products') && 
    !trimmed.includes('__EMBEDDED_CATALOG_DATA__')
  ) {
    return null;
  }

  let catalogName = 'Catálogo Restaurado desde HTML';
  const titleMatch = trimmed.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    catalogName = titleMatch[1].replace(/\|\s*Catálogo.*$/i, '').trim() || catalogName;
  }

  // 1. Try DOMParser (Browser environment)
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'text/html');

      const getDOMContent = (id: string): string => {
        const el = doc.getElementById(id) || doc.getElementById(`${id}-json`);
        if (!el) return '';
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          return (el as HTMLTextAreaElement).value || el.textContent || '';
        }
        return el.textContent || el.innerHTML || '';
      };

      const rawProducts = getDOMContent('data-products');
      const parsedProds = parseB64JSON(rawProducts, null);

      if (parsedProds && Array.isArray(parsedProds) && parsedProds.length > 0) {
        const parsedCats = parseB64JSON(getDOMContent('data-categories'), []);
        const parsedContact = parseB64JSON(getDOMContent('data-contact'), {});
        const parsedDesign = parseB64JSON(getDOMContent('data-design'), {});
        const parsedBlocks = parseB64JSON(getDOMContent('data-blocks'), []);
        const parsedMessages = parseB64JSON(getDOMContent('data-messages'), {});

        const titleEl = doc.querySelector('title');
        if (titleEl && titleEl.textContent) {
          catalogName = titleEl.textContent.replace(/\|\s*Catálogo.*$/i, '').trim() || catalogName;
        }

        return {
          name: catalogName,
          products: parsedProds,
          categories: parsedCats,
          contact: parsedContact,
          design: parsedDesign,
          customBlocks: parsedBlocks,
          messages: parsedMessages
        };
      }
    } catch (e) {
      console.warn('[BackupService] DOMParser HTML extraction fallback:', e);
    }
  }

  // 2. Try window.__EMBEDDED_CATALOG_DATA__ regex extraction
  try {
    const embeddedMatch = trimmed.match(/window\.__EMBEDDED_CATALOG_DATA__\s*=\s*(\{[\s\S]*?\});\s*(?:function|<|\n|\r)/);
    if (embeddedMatch && embeddedMatch[1]) {
      const parsedEmbedded = JSON.parse(embeddedMatch[1]);
      if (parsedEmbedded && (Array.isArray(parsedEmbedded.products) || Array.isArray(parsedEmbedded.categories))) {
        return {
          name: catalogName,
          ...parsedEmbedded
        };
      }
    }
  } catch (e) {}

  // 3. Fallback Regex extraction for textarea or script tags
  try {
    const extractTag = (id: string): string => {
      const tagMatch = trimmed.match(new RegExp(`(?:<textarea|<script)[^>]*id=["']${id}(?:-json)?["'][^>]*>([\\s\\S]*?)(?:<\\/textarea>|<\\/script>)`, 'i'));
      return tagMatch && tagMatch[1] ? tagMatch[1].trim() : '';
    };

    const rawProds = extractTag('data-products');
    const parsedProds = parseB64JSON(rawProds, null);
    if (parsedProds && Array.isArray(parsedProds) && parsedProds.length > 0) {
      const parsedCats = parseB64JSON(extractTag('data-categories'), []);
      const parsedContact = parseB64JSON(extractTag('data-contact'), {});
      const parsedDesign = parseB64JSON(extractTag('data-design'), {});
      const parsedBlocks = parseB64JSON(extractTag('data-blocks'), []);
      const parsedMessages = parseB64JSON(extractTag('data-messages'), {});

      return {
        name: catalogName,
        products: parsedProds,
        categories: parsedCats,
        contact: parsedContact,
        design: parsedDesign,
        customBlocks: parsedBlocks,
        messages: parsedMessages
      };
    }
  } catch (e) {}

  return null;
}

/**
 * Restores project data from JSON text or an exported standalone HTML file (.html), validating Base64 images and capturing any image warnings gracefully.
 */
export function restoreFromJSONText(
  jsonText: string,
  defaultMenuOptions: any[],
  defaultCustomMessages: CustomMessages
): ImportRestoreResult {
  const warnings: string[] = [];
  let restoredProductsCount = 0;
  let restoredImagesCount = 0;

  if (!jsonText || !jsonText.trim()) {
    return {
      success: false,
      projects: [],
      customBlocks: [],
      warnings: ['El contenido está vacío.'],
      restoredProductsCount: 0,
      restoredImagesCount: 0
    };
  }

  let parsed: any = null;

  // Check if input is an exported HTML file (.html)
  const extractedFromHtml = extractCatalogFromHTML(jsonText);
  if (extractedFromHtml) {
    parsed = extractedFromHtml;
  } else {
    try {
      parsed = JSON.parse(jsonText);
    } catch (e1) {
      try {
        const cleaned = jsonText.replace(/^\uFEFF/, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        return {
          success: false,
          projects: [],
          customBlocks: [],
          warnings: ['El archivo seleccionado no tiene un formato .JSON o .HTML exportado válido.'],
          restoredProductsCount: 0,
          restoredImagesCount: 0
        };
      }
    }
  }

  const sanitizeProject = (p: any): CatalogProject => {
    const rawProds = Array.isArray(p?.products) 
      ? p.products 
      : (Array.isArray(p?.product) 
        ? p.product 
        : (Array.isArray(p?.productos) 
          ? p.productos 
          : (Array.isArray(p?.items) 
            ? p.items 
            : (Array.isArray(p?.data) 
              ? p.data 
              : (Array.isArray(p?.catalogo) 
                ? p.catalogo 
                : (Array.isArray(p) ? p : []))))));

    const sanitizedProducts: CatalogProduct[] = [];

    rawProds.forEach((prod: any, idx: number) => {
      const prodName = prod?.name || prod?.nombre || prod?.title || prod?.titulo || `Producto #${idx + 1}`;
      
      const prodCats = Array.isArray(prod?.categories) && prod.categories.length > 0
        ? prod.categories
        : (Array.isArray(prod?.categorias) && prod.categorias.length > 0
          ? prod.categorias
          : [prod?.category || prod?.categoria || 'General']);

      // Validate & clean images
      const rawImages: string[] = Array.isArray(prod?.images) 
        ? prod.images 
        : (prod?.image || prod?.imagen || prod?.foto || prod?.img ? [prod?.image || prod?.imagen || prod?.foto || prod?.img] : []);

      const validImages: string[] = [];

      rawImages.forEach((imgStr: any, imgIdx: number) => {
        if (typeof imgStr === 'string' && imgStr.trim()) {
          let cleanImg = imgStr.trim();
          if (!cleanImg.startsWith('data:') && !cleanImg.startsWith('http') && !cleanImg.startsWith('/') && !cleanImg.startsWith('.') && cleanImg.length > 50) {
            cleanImg = `data:image/jpeg;base64,${cleanImg}`;
          }
          if (isValidImageData(cleanImg)) {
            validImages.push(cleanImg);
            restoredImagesCount++;
          } else {
            warnings.push(`Imagen #${imgIdx + 1} de "${prodName}" dañada o con formato no válido.`);
          }
        }
      });

      const primaryImg = validImages[0] || '';

      const resolvedCreatedAt = typeof prod?.createdAt === 'number' && !isNaN(prod.createdAt) && prod.createdAt > 0
        ? prod.createdAt
        : (getProductSortTimestamp(prod) || (Date.now() - idx * 1000));

      sanitizedProducts.push({
        id: prod?.id || 'prod-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substr(2, 5),
        name: prodName,
        description: prod?.description || prod?.descripcion || prod?.detalles || '',
        category: prod?.category || prod?.categoria || prodCats[0] || 'General',
        categories: prodCats,
        tags: Array.isArray(prod?.tags) ? prod.tags : (Array.isArray(prod?.etiquetas) ? prod.etiquetas : []),
        price: typeof prod?.price === 'number' ? prod.price : (parseFloat(prod?.price || prod?.precio) || 0),
        currency: prod?.currency || prod?.moneda || '$',
        sku: prod?.sku || prod?.codigo || '',
        dimensions: prod?.dimensions || prod?.dimensiones || '',
        material: prod?.material || '',
        moq: typeof prod?.moq === 'number' ? prod.moq : (parseInt(prod?.moq) || undefined),
        images: validImages,
        image: primaryImg,
        isOffer: !!(prod?.isOffer || prod?.oferta || prod?.enOferta),
        originalPrice: prod?.originalPrice || prod?.precioOriginal,
        offerTag: prod?.offerTag || prod?.etiquetaOferta,
        isNew: !!(prod?.isNew || prod?.nuevo),
        inStock: prod?.inStock !== undefined ? prod.inStock : true,
        stockQuantity: prod?.stockQuantity || prod?.stock,
        colors: Array.isArray(prod?.colors) ? prod.colors : [],
        primaryImageIndex: prod?.primaryImageIndex || 0,
        viewsCount: prod?.viewsCount || 0,
        createdAt: resolvedCreatedAt
      });

      restoredProductsCount++;
    });

    const sortedSanitizedProducts = sortProductsNewestFirst(sanitizedProducts);

    const inferredCategories = Array.from(new Set(['TODOS', ...sanitizedProducts.flatMap((prod) => prod.categories || [prod.category]).filter(Boolean)]));
    const categories = Array.isArray(p?.categories) && p.categories.length > 0 
      ? (p.categories.includes('TODOS') ? p.categories : ['TODOS', ...p.categories]) 
      : (inferredCategories.length > 0 ? inferredCategories : ['TODOS', 'General']);

    const inferredTags = Array.from(new Set(sanitizedProducts.flatMap((prod) => prod.tags || [])));
    const tags = Array.isArray(p?.tags) && p.tags.length > 0 ? p.tags : (inferredTags.length > 0 ? inferredTags : ['Oferta', 'Nuevo', 'Destacado']);

    // Design images check
    const rawDesign = p?.design || p?.diseno || {};
    const sanitizedDesign: CatalogDesign = {
      primaryColor: rawDesign.primaryColor || '#78716c',
      secondaryColor: rawDesign.secondaryColor || '#44403c',
      fontFamily: rawDesign.fontFamily || 'sans',
      layoutGrid: rawDesign.layoutGrid || '2x2',
      footerText: rawDesign.footerText || 'Todos los derechos reservados.',
      bannerSubtitle: rawDesign.bannerSubtitle,
      shareUrl: rawDesign.shareUrl
    };

    if (rawDesign.logoImage && typeof rawDesign.logoImage === 'string') {
      if (isValidImageData(rawDesign.logoImage)) {
        sanitizedDesign.logoImage = rawDesign.logoImage.trim();
        restoredImagesCount++;
      } else {
        warnings.push(`El logotipo del catálogo "${p?.name || 'Importado'}" no se pudo restaurar por formato no válido.`);
      }
    }

    if (rawDesign.bannerImage && typeof rawDesign.bannerImage === 'string') {
      if (isValidImageData(rawDesign.bannerImage)) {
        sanitizedDesign.bannerImage = rawDesign.bannerImage.trim();
        restoredImagesCount++;
      } else {
        warnings.push(`El banner del catálogo "${p?.name || 'Importado'}" no se pudo restaurar por formato no válido.`);
      }
    }

    return {
      id: p?.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: p?.name || p?.nombre || p?.titulo || 'Catálogo Importado',
      createdAt: p?.createdAt || Date.now(),
      description: p?.description || p?.descripcion || '',
      products: sortedSanitizedProducts,
      categories,
      tags,
      contact: {
        name: 'Tu Nombre',
        email: 'ventas@tuempresa.com',
        phone: '+52 55 0000 0000',
        company: 'Tu Compañía',
        ...(p?.contact || p?.contacto)
      },
      design: sanitizedDesign,
      favorites: Array.isArray(p?.favorites) ? p.favorites : [],
      menuOptions: Array.isArray(p?.menuOptions) ? p.menuOptions : defaultMenuOptions,
      messages: {
        shareCatalog: p?.messages?.shareCatalog || defaultCustomMessages.shareCatalog,
        shareProduct: p?.messages?.shareProduct || defaultCustomMessages.shareProduct,
        consultProduct: p?.messages?.consultProduct || defaultCustomMessages.consultProduct,
        ...(p?.messages || p?.mensajes)
      }
    };
  };

  let projectsToImport: CatalogProject[] = [];

  if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
    projectsToImport = parsed.projects.map((p: any) => sanitizeProject(p));
  } else if (parsed && parsed.project && typeof parsed.project === 'object') {
    projectsToImport = [sanitizeProject(parsed.project)];
  } else if (Array.isArray(parsed) && parsed.length > 0) {
    if (parsed[0] && (parsed[0].products || parsed[0].categories || parsed[0].design || parsed[0].name || parsed[0].price || parsed[0].precio || parsed[0].nombre)) {
      if (parsed[0].products || parsed[0].categories || parsed[0].design || parsed[0].name) {
        projectsToImport = parsed.map((p: any) => sanitizeProject(p));
      } else {
        projectsToImport = [sanitizeProject({ name: 'Catálogo Importado', products: parsed })];
      }
    } else {
      projectsToImport = [sanitizeProject({ name: 'Catálogo Importado', products: parsed })];
    }
  } else if (parsed && (parsed.products || parsed.productos || parsed.items || parsed.data || parsed.catalogo)) {
    projectsToImport = [sanitizeProject(parsed)];
  } else if (parsed && typeof parsed === 'object') {
    projectsToImport = [sanitizeProject(parsed)];
  }

  // Restore Custom Blocks
  const restoredBlocks: CustomBlock[] = [];
  if (parsed && Array.isArray(parsed.customBlocks)) {
    parsed.customBlocks.forEach((block: any, bIdx: number) => {
      let validBlockImg = '';
      if (block.image && typeof block.image === 'string') {
        if (isValidImageData(block.image)) {
          validBlockImg = block.image.trim();
          restoredImagesCount++;
        } else {
          warnings.push(`Imagen del bloque de promoción "${block.title || bIdx + 1}" no se pudo restaurar.`);
        }
      }
      restoredBlocks.push({
        id: block.id || 'block-' + Date.now() + '-' + bIdx,
        createdAt: block.createdAt,
        title: block.title || 'Sección',
        content: block.content || '',
        badge: block.badge,
        image: validBlockImg
      });
    });
  }

  if (projectsToImport.length === 0) {
    return {
      success: false,
      projects: [],
      customBlocks: [],
      warnings: ['El archivo no contiene datos de catálogo reconocibles.'],
      restoredProductsCount: 0,
      restoredImagesCount: 0
    };
  }

  return {
    success: true,
    projects: projectsToImport,
    customBlocks: sortPromosNewestFirst(restoredBlocks),
    warnings,
    restoredProductsCount,
    restoredImagesCount
  };
}
