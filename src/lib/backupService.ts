import {
  CatalogProject,
  CatalogProduct,
  CatalogDesign,
  ContactInfo,
  MenuOptionItem,
  CustomMessages,
  CustomBlock
} from '../types';
import { DEFAULT_MENU_OPTIONS, DEFAULT_CUSTOM_MESSAGES, DEFAULT_PROJECTS } from '../defaultData';

export interface BackupPayload {
  version: string;
  exportDate: string;
  project: CatalogProject;
  customBlocks: CustomBlock[];
}

export function createFullJSONBackup(project: CatalogProject, customBlocks: CustomBlock[] = []): string {
  const defaultProj = DEFAULT_PROJECTS[0];
  const resolvedSubtitle =
    project.design?.subtitle !== undefined
      ? project.design.subtitle
      : project.subtitle !== undefined
      ? project.subtitle
      : '';

  const rawMenuOptions =
    project.menuOptions && project.menuOptions.length > 0
      ? project.menuOptions
      : DEFAULT_MENU_OPTIONS;

  const waOpt = rawMenuOptions.find((o) => o.id === 'whatsapp');
  const resolvedContactWhatsapp =
    project.messages?.contactWhatsapp !== undefined
      ? project.messages.contactWhatsapp
      : waOpt?.content !== undefined
      ? waOpt.content
      : DEFAULT_CUSTOM_MESSAGES.contactWhatsapp || 'Hola, me interesa ver más detalles de tu catálogo.';

  const completeMenuOptions: MenuOptionItem[] = rawMenuOptions.map((opt) => ({
    id: opt.id,
    label: opt.label,
    iconName: opt.iconName,
    visible: opt.visible !== false,
    color: opt.color,
    content: opt.id === 'whatsapp' ? resolvedContactWhatsapp : opt.content,
    steps: opt.steps
  }));

  const completeMessages: CustomMessages = {
    contactWhatsapp: resolvedContactWhatsapp,
    shareCatalog:
      project.messages?.shareCatalog !== undefined
        ? project.messages.shareCatalog
        : DEFAULT_CUSTOM_MESSAGES.shareCatalog,
    shareProduct:
      project.messages?.shareProduct !== undefined
        ? project.messages.shareProduct
        : DEFAULT_CUSTOM_MESSAGES.shareProduct,
    consultProduct:
      project.messages?.consultProduct !== undefined
        ? project.messages.consultProduct
        : DEFAULT_CUSTOM_MESSAGES.consultProduct
  };

  const completeContact: ContactInfo = {
    name: project.contact?.name ?? defaultProj.contact.name,
    company: project.contact?.company ?? defaultProj.contact.company,
    phone: project.contact?.phone ?? defaultProj.contact.phone,
    email: project.contact?.email ?? defaultProj.contact.email,
    address: project.contact?.address ?? defaultProj.contact.address ?? '',
    website: project.contact?.website ?? defaultProj.contact.website ?? ''
  };

  const completeDesign: CatalogDesign = {
    primaryColor: project.design?.primaryColor || defaultProj.design.primaryColor,
    secondaryColor: project.design?.secondaryColor || defaultProj.design.secondaryColor,
    fontFamily: project.design?.fontFamily || defaultProj.design.fontFamily,
    layoutGrid: project.design?.layoutGrid || defaultProj.design.layoutGrid || '2x2',
    footerText: project.design?.footerText !== undefined ? project.design.footerText : (defaultProj.design.footerText ?? ''),
    bannerImage: project.design?.bannerImage ?? '',
    logoImage: project.design?.logoImage ?? '',
    subtitle: resolvedSubtitle
  };

  const resolvedBlocks: CustomBlock[] = Array.isArray(customBlocks)
    ? customBlocks
    : Array.isArray(project.customBlocks)
    ? project.customBlocks
    : [];

  const completeProject: CatalogProject = {
    ...project,
    id: project.id || 'proj-1',
    name: project.name !== undefined ? project.name : defaultProj.name,
    subtitle: resolvedSubtitle,
    createdAt: project.createdAt || Date.now(),
    description: project.description !== undefined ? project.description : defaultProj.description,
    products: Array.isArray(project.products) ? project.products : [],
    categories: Array.isArray(project.categories) && project.categories.length > 0 ? project.categories : ['TODOS'],
    tags: Array.isArray(project.tags) ? project.tags : [],
    contact: completeContact,
    design: completeDesign,
    favorites: Array.isArray(project.favorites) ? project.favorites : [],
    menuOptions: completeMenuOptions,
    messages: completeMessages,
    customBlocks: resolvedBlocks
  };

  const payload: BackupPayload = {
    version: '29.0',
    exportDate: new Date().toISOString(),
    project: completeProject,
    customBlocks: resolvedBlocks
  };

  return JSON.stringify(payload, null, 2);
}

export function restoreFromJSONText(jsonText: string): {
  project: CatalogProject;
  customBlocks: CustomBlock[];
} {
  let trimmed = (jsonText || '').trim();

  // If user pasted or uploaded an exported standalone HTML file, extract embedded catalog-project-data JSON
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    const match = trimmed.match(/<script[^>]*id=["']catalog-project-data["'][^>]*>([\s\S]*?)<\/script>/i);
    if (match && match[1]) {
      trimmed = match[1].trim();
    }
  }

  const data = JSON.parse(trimmed);
  if (!data || typeof data !== 'object') {
    throw new Error('El archivo JSON no tiene un formato válido.');
  }

  // Support both enveloped { project, customBlocks } and direct CatalogProject
  let rawProject: CatalogProject;
  let customBlocks: CustomBlock[] = [];

  if (data.project && typeof data.project === 'object') {
    rawProject = data.project;
    if (Array.isArray(data.customBlocks)) {
      customBlocks = data.customBlocks;
    } else if (Array.isArray(data.project.customBlocks)) {
      customBlocks = data.project.customBlocks;
    }
  } else if (data.name !== undefined || Array.isArray(data.products)) {
    rawProject = data as CatalogProject;
    if (Array.isArray(data.customBlocks)) {
      customBlocks = data.customBlocks;
    }
  } else {
    throw new Error('No se encontró información de catálogo válida en el archivo JSON.');
  }

  const defaultProj = DEFAULT_PROJECTS[0];
  const defaultOptsMap = new Map(DEFAULT_MENU_OPTIONS.map((o) => [o.id, o]));

  const restoredSubtitle =
    rawProject.design?.subtitle !== undefined
      ? rawProject.design.subtitle
      : rawProject.subtitle !== undefined
      ? rawProject.subtitle
      : '';

  const rawMenuOptions: MenuOptionItem[] =
    Array.isArray(rawProject.menuOptions) && rawProject.menuOptions.length > 0
      ? rawProject.menuOptions.map((opt) => {
          const def = defaultOptsMap.get(opt.id);
          return {
            ...def,
            ...opt,
            id: opt.id || def?.id || `opt-${Date.now()}`,
            label: opt.label !== undefined ? opt.label : (def?.label || ''),
            iconName: opt.iconName || def?.iconName || 'Info',
            visible: opt.visible !== undefined ? opt.visible : (def?.visible ?? true),
            color: opt.color || def?.color || (opt.id === 'favorites' || opt.id === 'share' ? 'neutral' : undefined),
            steps: opt.steps && opt.steps.length > 0 ? opt.steps : def?.steps
          };
        })
      : DEFAULT_MENU_OPTIONS;

  const waOpt = rawMenuOptions.find((o) => o.id === 'whatsapp');
  const resolvedContactWhatsapp =
    rawProject.messages?.contactWhatsapp !== undefined
      ? rawProject.messages.contactWhatsapp
      : waOpt?.content !== undefined
      ? waOpt.content
      : DEFAULT_CUSTOM_MESSAGES.contactWhatsapp || 'Hola, me interesa ver más detalles de tu catálogo.';

  const restoredMenuOptions = rawMenuOptions.map((opt) =>
    opt.id === 'whatsapp' ? { ...opt, content: resolvedContactWhatsapp } : opt
  );

  const restoredMessages: CustomMessages = {
    contactWhatsapp: resolvedContactWhatsapp,
    shareCatalog:
      rawProject.messages?.shareCatalog !== undefined
        ? rawProject.messages.shareCatalog
        : DEFAULT_CUSTOM_MESSAGES.shareCatalog,
    shareProduct:
      rawProject.messages?.shareProduct !== undefined
        ? rawProject.messages.shareProduct
        : DEFAULT_CUSTOM_MESSAGES.shareProduct,
    consultProduct:
      rawProject.messages?.consultProduct !== undefined
        ? rawProject.messages.consultProduct
        : DEFAULT_CUSTOM_MESSAGES.consultProduct
  };

  const restoredContact: ContactInfo = {
    name: rawProject.contact?.name !== undefined ? rawProject.contact.name : defaultProj.contact.name,
    company: rawProject.contact?.company !== undefined ? rawProject.contact.company : defaultProj.contact.company,
    phone: rawProject.contact?.phone !== undefined ? rawProject.contact.phone : defaultProj.contact.phone,
    email: rawProject.contact?.email !== undefined ? rawProject.contact.email : defaultProj.contact.email,
    address: rawProject.contact?.address !== undefined ? rawProject.contact.address : (defaultProj.contact.address || ''),
    website: rawProject.contact?.website !== undefined ? rawProject.contact.website : (defaultProj.contact.website || '')
  };

  const restoredDesign: CatalogDesign = {
    primaryColor: rawProject.design?.primaryColor || defaultProj.design.primaryColor,
    secondaryColor: rawProject.design?.secondaryColor || defaultProj.design.secondaryColor,
    fontFamily: rawProject.design?.fontFamily || defaultProj.design.fontFamily,
    layoutGrid: rawProject.design?.layoutGrid || defaultProj.design.layoutGrid || '2x2',
    footerText:
      rawProject.design?.footerText !== undefined
        ? rawProject.design.footerText
        : (defaultProj.design.footerText || ''),
    bannerImage: rawProject.design?.bannerImage !== undefined ? rawProject.design.bannerImage : '',
    logoImage: rawProject.design?.logoImage !== undefined ? rawProject.design.logoImage : '',
    subtitle: restoredSubtitle
  };

  const restoredProducts: CatalogProduct[] = Array.isArray(rawProject.products)
    ? rawProject.products.map((p) => ({
        ...p,
        id: p.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: p.name ?? '',
        sku: p.sku ?? '',
        price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
        currency: p.currency || 'USD',
        category: p.category || 'General',
        categories: Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []),
        description: p.description ?? '',
        dimensions: p.dimensions ?? '',
        material: p.material ?? '',
        moq: p.moq,
        images: Array.isArray(p.images) ? p.images : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
        colors: Array.isArray(p.colors) ? p.colors : [],
        createdAt: p.createdAt || Date.now(),
        views: p.views,
        highlighted: p.highlighted
      }))
    : [];

  const rawCategories = Array.isArray(rawProject.categories) && rawProject.categories.length > 0
    ? rawProject.categories
    : ['TODOS'];
  const restoredCategories = rawCategories.includes('TODOS')
    ? rawCategories
    : ['TODOS', ...rawCategories];

  const project: CatalogProject = {
    ...rawProject,
    id: rawProject.id || 'proj-1',
    name: rawProject.name !== undefined ? rawProject.name : defaultProj.name,
    subtitle: restoredSubtitle,
    createdAt: rawProject.createdAt || Date.now(),
    description: rawProject.description !== undefined ? rawProject.description : defaultProj.description,
    products: restoredProducts,
    categories: restoredCategories,
    tags: Array.isArray(rawProject.tags) ? rawProject.tags : [],
    contact: restoredContact,
    design: restoredDesign,
    favorites: Array.isArray(rawProject.favorites) ? rawProject.favorites : [],
    menuOptions: restoredMenuOptions,
    messages: restoredMessages,
    customBlocks
  };

  return { project, customBlocks };
}

export function extractCatalogFromHTML(htmlText: string): {
  extractedJson: string;
  project: CatalogProject;
  customBlocks: CustomBlock[];
} {
  const rawHtml = (htmlText || '').trim();
  if (!rawHtml) {
    throw new Error('El archivo HTML no contiene datos válidos del catálogo');
  }

  let extractedJson = '';

  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
      const scriptEl = doc.getElementById('catalog-project-data');
      if (scriptEl && scriptEl.textContent) {
        extractedJson = scriptEl.textContent.trim();
      }
    } catch {
      // Fallback to regex below
    }
  }

  if (!extractedJson) {
    const match = rawHtml.match(
      /<script[^>]*id=["']catalog-project-data["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (match && match[1]) {
      extractedJson = match[1].trim();
    }
  }

  if (!extractedJson) {
    throw new Error('El archivo HTML no contiene datos válidos del catálogo');
  }

  try {
    const parsed = JSON.parse(extractedJson);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON');
    }
    const { project, customBlocks } = restoreFromJSONText(extractedJson);
    if (!project || !Array.isArray(project.products)) {
      throw new Error('Invalid project data');
    }
    return { extractedJson, project, customBlocks };
  } catch {
    throw new Error('El archivo HTML no contiene datos válidos del catálogo');
  }
}

