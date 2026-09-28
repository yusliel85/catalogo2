import React, { useState, useEffect } from 'react';
import { CatalogProject, CatalogProduct, CatalogDesign, ContactInfo, MenuOptionItem, CustomMessages, CustomBlock } from './types';
import { DEFAULT_PROJECTS, DEFAULT_MENU_OPTIONS, DEFAULT_CUSTOM_MESSAGES } from './defaultData';
import {
  saveProjectsToStorage,
  loadProjectsFromStorage,
  saveActiveProjectId,
  loadActiveProjectId,
  saveCustomBlocksToStorage,
  loadCustomBlocksFromStorage
} from './lib/dbService';
import { restoreFromJSONText } from './lib/backupService';

function normalizeProjectData(proj: CatalogProject): CatalogProject {
  const defaultOptsMap = new Map(DEFAULT_MENU_OPTIONS.map((o) => [o.id, o]));
  const rawMenuOptions: MenuOptionItem[] =
    proj.menuOptions && proj.menuOptions.length > 0
      ? proj.menuOptions.map((opt) => {
          const def = defaultOptsMap.get(opt.id);
          return {
            ...def,
            ...opt,
            label: opt.label !== undefined ? opt.label : (def?.label || ''),
            iconName: opt.iconName || def?.iconName || 'Info',
            visible: opt.visible !== undefined ? opt.visible : (def?.visible ?? true),
            color: opt.color || def?.color || (opt.id === 'favorites' || opt.id === 'share' ? 'neutral' : undefined),
            steps: opt.steps && opt.steps.length > 0 ? opt.steps : def?.steps
          };
        })
      : DEFAULT_MENU_OPTIONS;

  const whatsappOpt = rawMenuOptions.find((o) => o.id === 'whatsapp');
  const resolvedContactWhatsapp =
    proj.messages?.contactWhatsapp !== undefined
      ? proj.messages.contactWhatsapp
      : whatsappOpt?.content !== undefined
      ? whatsappOpt.content
      : DEFAULT_CUSTOM_MESSAGES.contactWhatsapp || 'Hola, me interesa ver más detalles de tu catálogo.';

  const normalizedMenuOptions = rawMenuOptions.map((opt) =>
    opt.id === 'whatsapp' ? { ...opt, content: resolvedContactWhatsapp } : opt
  );

  const rawShareProduct = proj.messages?.shareProduct;
  const isOldDefaultShareProduct =
    rawShareProduct === undefined ||
    rawShareProduct.includes('Te comparto *{nombre}* ({precio}) del catálogo *{nombre_catalogo}*');

  const normalizedMessages: CustomMessages = {
    shareCatalog:
      proj.messages?.shareCatalog !== undefined
        ? proj.messages.shareCatalog
        : DEFAULT_CUSTOM_MESSAGES.shareCatalog,
    shareProduct: isOldDefaultShareProduct ? DEFAULT_CUSTOM_MESSAGES.shareProduct : rawShareProduct,
    consultProduct:
      proj.messages?.consultProduct !== undefined
        ? proj.messages.consultProduct
        : DEFAULT_CUSTOM_MESSAGES.consultProduct,
    contactWhatsapp: resolvedContactWhatsapp
  };

  const resolvedSubtitle =
    proj.design?.subtitle !== undefined
      ? proj.design.subtitle
      : proj.subtitle !== undefined
      ? proj.subtitle
      : '';

  return {
    ...proj,
    subtitle: resolvedSubtitle,
    design: {
      ...DEFAULT_PROJECTS[0].design,
      ...proj.design,
      subtitle: resolvedSubtitle
    },
    contact: {
      ...DEFAULT_PROJECTS[0].contact,
      ...proj.contact
    },
    menuOptions: normalizedMenuOptions,
    messages: normalizedMessages
  };
}

import { CatalogPreview } from './components/CatalogPreview';
import { AdminProducts } from './components/AdminProducts';
import { AdminDesign } from './components/AdminDesign';
import { AdminCategories } from './components/AdminCategories';
import { AdminTags } from './components/AdminTags';
import { AdminContact } from './components/AdminContact';
import { AdminAbout } from './components/AdminAbout';
import { AdminBlocks } from './components/AdminBlocks';
import { AdminOptionsMenu } from './components/AdminOptionsMenu';
import { AdminMessages } from './components/AdminMessages';
import { AdminVersionsHistory } from './components/AdminVersionsHistory';
import { AdminGuide } from './components/AdminGuide';
import { ExporterAdmin } from './exporter_admin';
import { ImportJsonModal } from './components/ImportJsonModal';

import {
  SlidersHorizontal,
  Eye,
  FolderOpen,
  Plus,
  FileJson,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2,
  Package,
  Layers,
  AlignLeft,
  X
} from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<CatalogProject[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [customBlocks, setCustomBlocks] = useState<CustomBlock[]>([]);
  const [viewMode, setViewMode] = useState<'preview' | 'admin'>('preview');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  // Load from DB on init
  useEffect(() => {
    async function init() {
      try {
        const storedProjects = await loadProjectsFromStorage();
        if (storedProjects && storedProjects.length > 0) {
          setProjects(storedProjects.map(normalizeProjectData));
        }
        const storedBlocks = await loadCustomBlocksFromStorage();
        if (storedBlocks) {
          setCustomBlocks(storedBlocks);
        }
        const storedActiveId = await loadActiveProjectId();
        if (storedActiveId) {
          setActiveProjectId(storedActiveId);
        }
      } catch (err) {
        console.warn('Init error:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  // Sync to storage
  useEffect(() => {
    if (!isLoaded) return;
    saveProjectsToStorage(projects);
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveCustomBlocksToStorage(customBlocks);
  }, [customBlocks, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !activeProjectId) return;
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId, isLoaded]);

  // Current project
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  // Updaters for active project
  const updateCurrentProject = (updater: (prev: CatalogProject) => CatalogProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? updater(p) : p))
    );
  };

  const setProducts = (action: React.SetStateAction<CatalogProduct[]>) => {
    updateCurrentProject((p) => ({
      ...p,
      products: typeof action === 'function' ? action(p.products) : action
    }));
  };

  const setCategories = (action: React.SetStateAction<string[]>) => {
    updateCurrentProject((p) => ({
      ...p,
      categories: typeof action === 'function' ? action(p.categories || ['TODOS']) : action
    }));
  };

  const setTags = (action: React.SetStateAction<string[]>) => {
    updateCurrentProject((p) => ({
      ...p,
      tags: typeof action === 'function' ? action(p.tags || []) : action
    }));
  };

  const setDesign = (action: React.SetStateAction<CatalogDesign>) => {
    updateCurrentProject((p) => {
      const nextDesign = typeof action === 'function' ? action(p.design) : action;
      return {
        ...p,
        subtitle: nextDesign.subtitle !== undefined ? nextDesign.subtitle : p.subtitle,
        design: nextDesign
      };
    });
  };

  const setContact = (action: React.SetStateAction<ContactInfo>) => {
    updateCurrentProject((p) => ({
      ...p,
      contact: typeof action === 'function' ? action(p.contact) : action
    }));
  };

  const setDescription = (desc: string) => {
    updateCurrentProject((p) => ({ ...p, description: desc }));
  };

  const setMenuOptions = (action: React.SetStateAction<MenuOptionItem[]>) => {
    updateCurrentProject((p) => {
      const nextMenuOptions = typeof action === 'function' ? action(p.menuOptions || []) : action;
      const waOpt = nextMenuOptions.find((o) => o.id === 'whatsapp');
      const nextMessages: CustomMessages = {
        shareCatalog: p.messages?.shareCatalog || DEFAULT_CUSTOM_MESSAGES.shareCatalog,
        shareProduct: p.messages?.shareProduct || DEFAULT_CUSTOM_MESSAGES.shareProduct,
        consultProduct: p.messages?.consultProduct || DEFAULT_CUSTOM_MESSAGES.consultProduct,
        contactWhatsapp:
          waOpt && waOpt.content !== undefined
            ? waOpt.content
            : p.messages?.contactWhatsapp || DEFAULT_CUSTOM_MESSAGES.contactWhatsapp
      };
      return {
        ...p,
        menuOptions: nextMenuOptions,
        messages: nextMessages
      };
    });
  };

  const setMessages = (action: React.SetStateAction<CustomMessages>) => {
    updateCurrentProject((p) => {
      const prevMsgs = p.messages || DEFAULT_CUSTOM_MESSAGES;
      const nextMessages = typeof action === 'function' ? action(prevMsgs) : action;
      const nextMenuOptions = (p.menuOptions || DEFAULT_MENU_OPTIONS).map((opt) =>
        opt.id === 'whatsapp' && nextMessages.contactWhatsapp !== undefined
          ? { ...opt, content: nextMessages.contactWhatsapp }
          : opt
      );
      return {
        ...p,
        messages: nextMessages,
        menuOptions: nextMenuOptions
      };
    });
  };

  const handleUpdateContactPhone = (phone: string) => {
    setContact((prev) => ({ ...prev, phone }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('cat_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [viewMode]);

  // Import JSON handler
  const handleImportJSON = (jsonText: string) => {
    try {
      const { project, customBlocks: importedBlocks } = restoreFromJSONText(jsonText);
      const newId = project.id || `proj-${Date.now()}`;
      const resolvedBlocks = Array.isArray(importedBlocks)
        ? importedBlocks
        : Array.isArray(project.customBlocks)
        ? project.customBlocks
        : [];
      const newProject = normalizeProjectData({
        ...project,
        id: newId,
        customBlocks: resolvedBlocks
      });

      setProjects((prev) => {
        const withoutSameId = prev.filter((p) => p.id !== newId);
        return [newProject, ...withoutSameId];
      });
      setActiveProjectId(newId);
      setCustomBlocks(resolvedBlocks);
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al importar archivo JSON');
    }
  };

  // If in preview mode, render full interactive CatalogPreview
  if (viewMode === 'preview') {
    return (
      <div className="relative min-h-screen">
        <CatalogPreview
          project={currentProject}
          customBlocks={customBlocks}
          onOpenAdmin={() => setViewMode('admin')}
        />

        {/* Floating Quick Switcher to Admin Panel */}
        <div className="fixed bottom-4 right-4 z-40">
          <button
            type="button"
            id="floating-btn-admin"
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900/90 hover:bg-stone-900 text-white rounded-full text-xs font-bold shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer border border-stone-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Panel de Gestión</span>
          </button>
        </div>
      </div>
    );
  }

  const isDarkMode =
    typeof window !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
      localStorage.getItem('cat_theme') === 'dark');

  // Admin Dashboard Mode
  return (
    <div
      className={`catalog-page-bg admin-page-bg min-h-screen transition-colors duration-200 pb-16 font-sans ${
        isDarkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-100/80 text-stone-900'
      }`}
    >
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-stone-900 text-amber-400 rounded-lg sm:rounded-xl shadow-xs shrink-0">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-stone-900 leading-tight whitespace-nowrap">
                Gestor del Catálogo
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium leading-normal mt-0.5 whitespace-nowrap">
                Versión 29.0 (Estable)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-return-preview"
              onClick={() => setViewMode('preview')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Catálogo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Administration Sections: Orden Intuitivo y Cerrados por Defecto (Acordeón Exclusivo) */}
        <div className="space-y-4">
          {/* 1. Diseño y Cabecera */}
          <AdminDesign
            design={currentProject.design}
            setDesign={setDesign}
            catalogName={currentProject.name}
            onUpdateCatalogName={(name) =>
              updateCurrentProject((p) => ({ ...p, name }))
            }
            isOpen={openSection === 'design'}
            onToggle={() => toggleSection('design')}
          />

          {/* 2. Promociones / Bloques Destacados */}
          <AdminBlocks
            customBlocks={customBlocks}
            setCustomBlocks={setCustomBlocks}
            isOpen={openSection === 'blocks'}
            onToggle={() => toggleSection('blocks')}
          />

          {/* 3. Categorías */}
          <AdminCategories
            categories={currentProject.categories || ['TODOS']}
            setCategories={setCategories}
            products={currentProject.products}
            setProducts={setProducts}
            isOpen={openSection === 'categories'}
            onToggle={() => toggleSection('categories')}
          />

          {/* 4. Etiquetas */}
          <AdminTags
            tags={currentProject.tags || []}
            setTags={setTags}
            products={currentProject.products}
            setProducts={setProducts}
            isOpen={openSection === 'tags'}
            onToggle={() => toggleSection('tags')}
          />

          {/* 5. Catálogo de Productos */}
          <AdminProducts
            products={currentProject.products}
            setProducts={setProducts}
            categories={currentProject.categories || ['TODOS']}
            tags={currentProject.tags || []}
            primaryColor={currentProject.design?.primaryColor}
            isOpen={openSection === 'products'}
            onToggle={() => toggleSection('products')}
          />

          {/* 6. Menú de Opciones */}
          <AdminOptionsMenu
            menuOptions={currentProject.menuOptions || []}
            setMenuOptions={setMenuOptions}
            contact={currentProject.contact}
            setContact={setContact}
            catalogDescription={currentProject.description || ''}
            onUpdateCatalogDescription={setDescription}
            shareCatalogMessage={
              currentProject.messages?.shareCatalog !== undefined
                ? currentProject.messages.shareCatalog
                : DEFAULT_CUSTOM_MESSAGES.shareCatalog
            }
            onUpdateShareCatalogMessage={(msg) =>
              setMessages((prev) => ({ ...prev, shareCatalog: msg }))
            }
            contactWhatsappMessage={
              currentProject.messages?.contactWhatsapp !== undefined
                ? currentProject.messages.contactWhatsapp
                : DEFAULT_CUSTOM_MESSAGES.contactWhatsapp ||
                  'Hola, me interesa ver más detalles de tu catálogo.'
            }
            onUpdateContactWhatsappMessage={(msg) =>
              setMessages((prev) => ({ ...prev, contactWhatsapp: msg }))
            }
            isOpen={openSection === 'optionsMenu'}
            onToggle={() => toggleSection('optionsMenu')}
          />

          {/* 7. Mensajes de WhatsApp (Productos: Compartir y Consultar) */}
          <AdminMessages
            messages={currentProject.messages || DEFAULT_CUSTOM_MESSAGES}
            setMessages={setMessages}
            contact={currentProject.contact}
            setContact={setContact}
            isOpen={openSection === 'messages'}
            onToggle={() => toggleSection('messages')}
          />

          {/* 8. Historial de Versiones */}
          <AdminVersionsHistory
            isOpen={openSection === 'versions'}
            onToggle={() => toggleSection('versions')}
          />

          {/* 9. Exportación (ÚLTIMO APARTADO) */}
          <ExporterAdmin
            project={currentProject}
            customBlocks={customBlocks}
            onOpenImport={() => setIsImportModalOpen(true)}
            onImportText={handleImportJSON}
            isOpen={openSection === 'export'}
            onToggle={() => toggleSection('export')}
          />
        </div>
      </main>

      {/* Import Modal */}
      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportText={handleImportJSON}
      />
    </div>
  );
}
export default App;
