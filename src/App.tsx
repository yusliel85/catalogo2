import React, { useState, useEffect, useRef } from 'react';
import { CatalogProject, CatalogProduct, ContactInfo, CatalogDesign, MenuOptionItem, CustomMessages } from './types';
import { DEFAULT_PROJECTS, DEFAULT_MENU_OPTIONS, DEFAULT_CUSTOM_MESSAGES, INITIAL_PRODUCTS } from './defaultData';
import { AdminProducts } from './components/AdminProducts';
import { AdminCategories } from './components/AdminCategories';
import { AdminTags } from './components/AdminTags';
import { AdminDesign } from './components/AdminDesign';
import { AdminContact } from './components/AdminContact';
import { AdminOptionsMenu } from './components/AdminOptionsMenu';
import { AdminMessages } from './components/AdminMessages';
import { AdminBlocks, CustomBlock } from './components/AdminBlocks';
import { sortPromosNewestFirst } from './lib/promoUtils';
import { CatalogPreview } from './components/CatalogPreview';
import { ExporterAdmin } from './exporter_admin';
import { AdminVersionsHistory } from './components/AdminVersionsHistory';
import { CustomConfirm } from './components/CustomConfirm';
import { ImportJsonModal } from './components/ImportJsonModal';
import { restoreFromJSONText } from './lib/backupService';
import { generateStandaloneCatalogHTML } from './exporter';
import { downloadFile, isRunningInAndroidApp } from './lib/downloadHelper';
import { 
  saveProjectsToStorage, 
  loadProjectsFromStorage, 
  saveCustomBlocksToStorage, 
  loadCustomBlocksFromStorage,
  saveActiveProjectId,
  loadActiveProjectId
} from './lib/dbService';
import { sortProductsNewestFirst } from './lib/productUtils';
import confetti from 'canvas-confetti';
import { SlidersHorizontal, Eye, Plus, Trash2, Layout, BookOpen, Layers, CheckSquare, Sparkles, LogOut, ArrowRight, HelpCircle, FileJson, Copy, ExternalLink, X, Smartphone, Check, Edit2, FileDown } from 'lucide-react';

export { sortProductsNewestFirst };

function App() {
  const [projects, setProjects] = useState<CatalogProject[]>(() => {
    try {
      const stored = localStorage.getItem('catalog-all-projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validProjects = parsed
            .filter((p: any) => p && typeof p === 'object' && p.id)
            .map((p: any) => {
              const rawProducts = Array.isArray(p.products) ? p.products : [];
              return {
                ...p,
                products: sortProductsNewestFirst(rawProducts),
                categories: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : ['TODOS', 'Muebles de Exterior', 'Muebles de Interior', 'Iluminación', 'Decoración y Jardín', 'Telas y Textiles'],
                tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : Array.from(new Set(rawProducts.flatMap((prod: any) => prod.tags || []))),
                contact: {
                  name: 'Sofía Valenzuela',
                  email: 'export@artesaniasglobales.com',
                  phone: '+52 55 1234 5678',
                  company: 'Artesanías Globales S.A.',
                  address: 'Paseo de la Reforma 450, Ciudad de México, México',
                  website: 'www.artesaniasglobales.com',
                  ...p.contact
                },
                design: {
                  primaryColor: '#8c6d58',
                  secondaryColor: '#2b3a32',
                  fontFamily: 'serif',
                  layoutGrid: '2x2',
                  footerText: '© 2026 Artesanías Globales S.A. | Reservados todos los derechos.',
                  ...p.design
                },
                favorites: Array.isArray(p.favorites) ? p.favorites : ['prod-1', 'prod-2', 'prod-3'],
                menuOptions: Array.isArray(p.menuOptions) ? p.menuOptions : DEFAULT_MENU_OPTIONS
              };
            });
          if (validProjects.length > 0) {
            return validProjects;
          }
        }
      }
    } catch (e) {}
    return DEFAULT_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('catalog-active-project-id');
      if (saved && saved.trim() !== '') return saved.trim();
    } catch (e) {}
    return projects[0]?.id || 'proj-1';
  });

  // Editor mode state: 'admin' (Catalog Creator Workspace) or 'preview' (Interactive Catalog Display)
  const [viewMode, setViewMode] = useState<'admin' | 'preview'>('admin');

  // Currently active project details
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Helper bindings for state management updates
  const setProducts: React.Dispatch<React.SetStateAction<CatalogProduct[]>> = (updater) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const nextProds = typeof updater === 'function' ? updater(p.products) : updater;
        return { ...p, products: sortProductsNewestFirst(nextProds) };
      }
      return p;
    }));
  };

  const setCategories: React.Dispatch<React.SetStateAction<string[]>> = (updater) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const nextCats = typeof updater === 'function' ? updater(p.categories) : updater;
        return { ...p, categories: nextCats };
      }
      return p;
    }));
  };

  const setTags: React.Dispatch<React.SetStateAction<string[]>> = (updater) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const currentTags = p.tags || [];
        const nextTags = typeof updater === 'function' ? updater(currentTags) : updater;
        return { ...p, tags: nextTags };
      }
      return p;
    }));
  };

  const setContact: React.Dispatch<React.SetStateAction<ContactInfo>> = (updater) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const nextContact = typeof updater === 'function' ? updater(p.contact) : updater;
        return { ...p, contact: nextContact };
      }
      return p;
    }));
  };

  const setDesign: React.Dispatch<React.SetStateAction<CatalogDesign>> = (updater) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const nextDesign = typeof updater === 'function' ? updater(p.design) : updater;
        return { ...p, design: nextDesign };
      }
      return p;
    }));
  };

  const setMessages = (messagesOrFn: CustomMessages | ((prev: CustomMessages) => CustomMessages)) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const currentMsgs = p.messages || DEFAULT_CUSTOM_MESSAGES;
        const nextMsgs = typeof messagesOrFn === 'function' ? messagesOrFn(currentMsgs) : messagesOrFn;
        return { ...p, messages: nextMsgs };
      }
      return p;
    }));
  };

  // Additional editorial Blocks
  const [customBlocks, setCustomBlocks] = useState<CustomBlock[]>(() => {
    try {
      const stored = localStorage.getItem('catalog-custom-blocks');
      if (stored) return sortPromosNewestFirst(JSON.parse(stored));
    } catch (e) {}
    return [];
  });

  const [newProjectName, setNewProjectName] = useState('');
  const [globalSaved, setGlobalSaved] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProjectNameId, setEditingProjectNameId] = useState<string | null>(null);
  const [tempProjectName, setTempProjectName] = useState('');

  const handleGlobalSave = async () => {
    try {
      await saveProjectsToStorage(projects);
      await saveCustomBlocksToStorage(customBlocks);
      await saveActiveProjectId(activeProjectId);
      setGlobalSaved(true);
      setTimeout(() => setGlobalSaved(false), 3000);
      alert('💾 ¡TODO GUARDADO CON ÉXITO!\n\nSe ha persistido de manera segura la siguiente información en la base de datos de tu navegador:\n\n✔️ Base de datos de productos e imágenes\n✔️ Categorías y Clasificaciones\n✔️ Ajustes de contacto y redes\n✔️ Colores de marca y logotipos\n✔️ Secciones y bloques dinámicos\n\n💡 Sugerencia: Puedes descargar un respaldo físico .JSON desde el panel de "Publicación" para resguardar tus datos ante limpiezas de historial.');
    } catch (e: any) {
      alert('Error al guardar datos localmente: ' + (e?.message || e));
    }
  };

  // PWA & Mobile Install triggers state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    try {
      return localStorage.getItem('catalog-pwa-dismissed') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isAndroid = isRunningInAndroidApp();

  useEffect(() => {
    const checkStandalone = () => {
      if (isRunningInAndroidApp()) {
        setIsStandalone(false);
        return;
      }

      let isInsideIframe = false;
      try {
        isInsideIframe = window.self !== window.top;
      } catch (e) {
        isInsideIframe = true;
      }

      // If running inside an iframe (like AI Studio preview - Entorno 1), it is always web mode
      if (isInsideIframe) {
        setIsStandalone(false);
        return;
      }

      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true;
      setIsStandalone(!!isPWA);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkStandalone);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = localStorage.getItem('catalog-pwa-dismissed') === 'true';
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed, hide banner
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      // In iframes, direct prompts are blocked by current browser sandboxing rules
      setShowInstallGuideModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowInstallBanner(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error(err);
        setShowInstallGuideModal(true);
      }
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      let origin = window.location.origin;
      if (origin && origin !== 'null' && !origin.startsWith('file:')) {
        if (origin.includes('-dev-')) {
          origin = origin.replace('-dev-', '-pre-');
        }
        return origin;
      }
    }
    return 'https://ais-pre-tvnitfjrirlgmma5m3vptj-811628296425.us-east1.run.app';
  };

  const handleExportHTML = () => {
    if (!activeProject) return;
    try {
      const apiBaseUrl = getApiBaseUrl();

      // Gather all accumulated views for this project
      const pId = activeProject.id;
      let accumulatedViews: Record<string, number> = {};
      try {
        const stored = localStorage.getItem(`catalog-views-${pId}`) || localStorage.getItem(`interactive-catalog-views-${pId}`);
        if (stored) {
          accumulatedViews = JSON.parse(stored) || {};
        }
      } catch(e) {}

      const updatedProducts = (activeProject.products || []).map(p => {
        const totalViews = Math.max(p.viewsCount || 0, accumulatedViews[p.id] || 0);
        return { ...p, viewsCount: totalViews };
      });

      const projectToExport: CatalogProject = {
        ...activeProject,
        products: updatedProducts
      };

      const htmlContent = generateStandaloneCatalogHTML(projectToExport, customBlocks, apiBaseUrl);
      downloadFile('index.html', htmlContent, 'text/html');

      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.6 }
      });

      alert('¡Excelente! Tu catálogo HTML autónomo e interactivo ha sido descargado (index.html). Puedes compartirlo directamente o subirlo a cualquier hosting estático.');
    } catch (e: any) {
      alert('Hubo un error al compilar el catálogo HTML: ' + (e?.message || e));
    }
  };

  // Rastreo de carga inicial para evitar que el estado por defecto sobrescriba la base de datos
  const isStorageLoaded = useRef(false);
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Carga asíncrona de respaldo en IndexedDB si existe para PWAs y navegadores móviles
  useEffect(() => {
    let isMounted = true;
    async function loadAsyncStorage() {
      try {
        const idbProjects = await loadProjectsFromStorage();
        const savedActiveId = await loadActiveProjectId();

        if (idbProjects && Array.isArray(idbProjects) && idbProjects.length > 0 && isMounted) {
          const normalized = idbProjects.map((p: any) => {
            const rawProducts = Array.isArray(p.products) ? p.products : [];
            return {
              ...p,
              products: sortProductsNewestFirst(rawProducts)
            };
          });
          setProjects(normalized);

          if (savedActiveId && normalized.some(p => p.id === savedActiveId)) {
            setActiveProjectId(savedActiveId);
          } else if (normalized.length > 0) {
            setActiveProjectId(normalized[0].id);
          }
        } else if (savedActiveId && isMounted) {
          setActiveProjectId(savedActiveId);
        }

        const idbBlocks = await loadCustomBlocksFromStorage();
        if (idbBlocks && Array.isArray(idbBlocks) && isMounted) {
          setCustomBlocks(sortPromosNewestFirst(idbBlocks));
        }
      } catch (e) {
        console.warn('Error al cargar datos desde IndexedDB:', e);
      } finally {
        isStorageLoaded.current = true;
        if (isMounted) {
          setIsStorageReady(true);
        }
      }
    }
    loadAsyncStorage();
    return () => { isMounted = false; };
  }, []);

  // Sincronización continua e inmune de base de datos local (IndexedDB + LocalStorage)
  // Solo se sincroniza una vez que la lectura inicial haya finalizado
  useEffect(() => {
    if (!isStorageLoaded.current) return;
    saveProjectsToStorage(projects);
  }, [projects]);

  useEffect(() => {
    if (!isStorageLoaded.current) return;
    saveCustomBlocksToStorage(customBlocks);
  }, [customBlocks]);

  useEffect(() => {
    if (!isStorageLoaded.current) return;
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Handle Importing JSON Backup File or Pasted JSON/HTML Text
  const processImportJSONText = (jsonText: string): boolean => {
    try {
      const result = restoreFromJSONText(jsonText, DEFAULT_MENU_OPTIONS, DEFAULT_CUSTOM_MESSAGES);

      if (!result.success) {
        const errorMsg = result.warnings.join('\n') || 'El archivo no contiene una estructura válida de catálogo.';
        alert(`❌ Error al importar respaldo:\n\n${errorMsg}`);
        return false;
      }

      const importedProjects = result.projects;
      if (importedProjects.length > 0) {
        if (importedProjects.length === 1) {
          const singleProj = importedProjects[0];
          setProjects(prev => {
            const isOnlyDefault = prev.length <= 1 && prev[0]?.id === 'proj-1';
            let nextList: CatalogProject[];
            let chosenId = singleProj.id;
            if (isOnlyDefault) {
              chosenId = 'proj-1';
              nextList = [{ ...singleProj, id: chosenId }];
            } else {
              const existingIdx = prev.findIndex(p => p.id === singleProj.id || p.id === activeProjectId);
              if (existingIdx > -1) {
                chosenId = prev[existingIdx].id;
                nextList = prev.map((p, idx) => idx === existingIdx ? { ...singleProj, id: chosenId } : p);
              } else {
                nextList = [singleProj, ...prev];
              }
            }
            setActiveProjectId(chosenId);
            saveActiveProjectId(chosenId);
            saveProjectsToStorage(nextList);
            return nextList;
          });
        } else {
          setProjects(importedProjects);
          setActiveProjectId(importedProjects[0].id);
          saveActiveProjectId(importedProjects[0].id);
          saveProjectsToStorage(importedProjects);
        }

        if (result.customBlocks && result.customBlocks.length > 0) {
          const sorted = sortPromosNewestFirst(result.customBlocks);
          setCustomBlocks(sorted);
          saveCustomBlocksToStorage(sorted);
        }
      }

      let successMsg = `🎉 ¡Restauración Completa!\n\n✔️ Catálogo(s): ${importedProjects.length}\n✔️ Productos restaurados: ${result.restoredProductsCount}\n✔️ Imágenes restauradas: ${result.restoredImagesCount}`;

      if (result.warnings.length > 0) {
        successMsg += `\n\n⚠️ Avisos sobre algunas imágenes:\n${result.warnings.slice(0, 5).map(w => '• ' + w).join('\n')}`;
        if (result.warnings.length > 5) {
          successMsg += `\n...y ${result.warnings.length - 5} aviso(s) adicional(es).`;
        }
      }

      alert(successMsg);
      return true;
    } catch (err: any) {
      alert('Error inesperado al leer o procesar el archivo JSON: ' + (err?.message || 'Formato no válido'));
      return false;
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        processImportJSONText(content);
      };
      reader.readAsText(file, 'UTF-8');
      e.target.value = '';
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: CatalogProject = {
      id: 'proj-' + Date.now(),
      name: newProjectName.trim(),
      createdAt: Date.now(),
      products: [],
      categories: ['TODOS', 'General'],
      tags: ['Oferta', 'Nuevo', 'Destacado'],
      contact: {
        name: 'Tu Nombre',
        email: 'ventas@tuempresa.com',
        phone: '+52 55 0000 0000',
        company: 'Tu Compañía'
      },
      design: {
        primaryColor: '#78716c',
        secondaryColor: '#44403c',
        fontFamily: 'sans',
        layoutGrid: '2x2',
        footerText: 'Todos los derechos reservados.'
      },
      favorites: []
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setNewProjectName('');
  };

  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteProject = (id: string, name: string) => {
    if (projects.length <= 1) {
      alert('Debe conservar al menos un proyecto de catálogo de muestra.');
      return;
    }
    setProjectToDelete({ id, name });
  };

  const handleConfirmDeleteProject = () => {
    if (!projectToDelete) return;
    const { id } = projectToDelete;
    const nextProjects = projects.filter(p => p.id !== id);
    setProjects(nextProjects);
    setActiveProjectId(nextProjects[0].id);
    setProjectToDelete(null);
  };

  const handleRenameProject = (id: string) => {
    if (!tempProjectName.trim()) {
      setEditingProjectNameId(null);
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, name: tempProjectName.trim() };
      }
      return p;
    }));
    setEditingProjectNameId(null);
  };

  if (!activeProject || !isStorageReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafaf9] p-6 text-center">
        <div className="w-11 h-11 rounded-full border-3 border-stone-200 border-t-amber-600 animate-spin mb-4"></div>
        <h3 className="font-serif font-bold text-stone-900 text-base md:text-lg">
          Espere un momento se esta cargando la información...
        </h3>
        <p className="text-xs text-stone-500 mt-1.5 font-sans">
          Cargando catálogo, productos y fotografías...
        </p>
      </div>
    );
  }

  // Switch display between Admin Workspace and Full Live interactive view
  if (viewMode === 'preview') {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {isStandalone && !isAndroid && (
            <a
              href="https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702"
              onClick={(e) => {
                e.preventDefault();
                window.open("https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702", "_blank", "noopener,noreferrer");
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xl cursor-pointer transition-all border border-sky-500/50"
              title="Regresar a este proyecto en Google AI Studio"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white" />
              <span>Regresar</span>
            </a>
          )}
          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-stone-100 text-xs font-bold rounded-lg shadow-xl cursor-pointer transition-colors border border-stone-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
        <CatalogPreview project={activeProject} customBlocks={customBlocks} previewOnly={true} />

        {/* PWA Custom Install Guide Modal */}
        {showInstallGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col transform transition-all scale-100">
              
              {/* Modal Header */}
              <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif font-bold text-xs text-stone-100 uppercase tracking-wide">Instalar en tu Celular</h3>
                </div>
                <button 
                  onClick={() => setShowInstallGuideModal(false)}
                  className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm text-2xl mb-1">
                    📲
                  </div>
                  <h4 className="font-serif font-black text-stone-900 text-base">La mejor opción para tu Celular</h4>
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">
                    La forma ideal de tener la aplicación en tu celular es <strong>instalar la PWA</strong> para usarla a pantalla completa con velocidad nativa.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4 pt-2 border-t border-stone-150">
                  
                  {/* Warning about frame */}
                  <div className="bg-emerald-50/60 border border-emerald-150 p-3 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold text-xs mt-0.5">⚠️</span>
                      <div className="text-[11px] text-emerald-800 font-sans leading-relaxed font-medium">
                        Como estás dentro del sistema seguro de <strong>Google AI Studio</strong> (que usa un panel incrustado o iframe), el navegador restringe los instaladores automáticos. <strong>Abre el link de manera independiente</strong> para habilitar la instalación directa:
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-850 text-white text-[11px] font-bold rounded shadow-sm cursor-pointer transition-all"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                        <span>Abrir Standalone</span>
                      </button>
                      
                      <button 
                        onClick={handleCopyLink}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 text-[11px] font-bold rounded cursor-pointer transition-all"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-400" />
                            <span>Copiar Enlace</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Android Steps */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-stone-800 flex items-center gap-1.5 font-serif">
                      <span className="text-xs">🤖</span> Instalación en Android (Chrome / Brave)
                    </h5>
                    <p className="text-[11px] text-stone-600 pl-5 leading-relaxed">
                      1. Haz clic arriba en <span className="font-bold">"Abrir Standalone"</span> para abrirlo en el navegador nativo de tu celular.<br />
                      2. Toca los <span className="font-bold text-stone-800">tres puntos (⋮)</span> superiores o inferiores.<br />
                      3. Selecciona la opción <span className="font-bold text-stone-900 bg-stone-50 px-1 py-0.5 border border-stone-200 rounded">"Instalar aplicación"</span> o <span className="font-bold">"Agregar a pantalla de inicio"</span>.
                    </p>
                  </div>

                  {/* iPhone Steps */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h5 className="font-bold text-xs text-stone-800 flex items-center gap-1.5 font-serif">
                      <span className="text-xs">🍎</span> Instalación en iPhone / iPad (Safari)
                    </h5>
                    <p className="text-[11px] text-stone-600 pl-5 leading-relaxed">
                      1. Abre el enlace arriba en Safari seleccionando <span className="font-bold">"Abrir Standalone"</span>.<br />
                      2. Toca el botón <span className="font-bold">Compartir (⎙ o el icono de la flecha hacia arriba ↑)</span> en el menú inferior.<br />
                      3. Desliza hacia abajo y selecciona la opción <span className="font-bold text-stone-900 bg-stone-50 px-1 py-0.5 border border-stone-200 rounded">"Agregar a inicio"</span>.
                    </p>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center">
                {!isAndroid ? (
                  <a
                    href="https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702"
                    onClick={(e) => {
                      e.preventDefault();
                      if (document.referrer && document.referrer.includes('ai.studio')) {
                        window.top ? (window.top.location.href = document.referrer) : (window.location.href = document.referrer);
                      } else {
                        window.top ? (window.top.location.href = "https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702") : (window.location.href = "https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702");
                      }
                    }}
                    target="_top"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:text-stone-800 underline font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Regresar a Google AI Studio</span>
                  </a>
                ) : <div />}
                <button
                  onClick={() => setShowInstallGuideModal(false)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Entendido, ¡Listo!
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-805 selection:bg-stone-300 selection:text-stone-900" id="catalog-admin-root">
      
      {/* Top Admin Sidebar / Banner Panel Header */}
      <header className="bg-stone-900 text-stone-300 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wide text-white font-serif">Catalog-Exporter Pro</h1>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Gestor de Exhibición & Catálogos Standalone</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              {isStandalone && !isAndroid ? (
                <a
                  href="https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open("https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702", "_blank", "noopener,noreferrer");
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-sky-400 hover:text-sky-300 border border-stone-700/60 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="Regresar a este proyecto en Google AI Studio"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Regresar</span>
                </a>
              ) : !isAndroid ? (
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-400 hover:text-emerald-300 border border-stone-700/60 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  title="Instalar App del catálogo como PWA en tu pantalla de inicio"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>📲 Instalar App Móvil</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleExportHTML}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 border border-stone-700/60 rounded-lg text-xs font-bold cursor-pointer transition-all"
                title="Descargar catálogo estático autónomo .HTML listo para compartir o alojar"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar HTML</span>
              </button>
            </div>

            <div className="hidden sm:block h-5 w-[1px] bg-stone-800"></div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGlobalSave}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all ${
                  globalSaved
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                title="Guardar de manera explícita todos tus cambios"
              >
                {globalSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>¡Todo Guardado!</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                    <span>💾 Guardar Todo</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  try { window.location.hash = '#main'; } catch(e) {}
                  setViewMode('preview');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ejecutar Demo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workspace Space */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        

        {/* Project Organizer Strip */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mr-2">Catálogo Actual:</span>
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-1.5">
                {editingProjectNameId === p.id ? (
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-lg p-0.5">
                    <input
                      type="text"
                      value={tempProjectName}
                      onChange={(e) => setTempProjectName(e.target.value)}
                      onBlur={() => handleRenameProject(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameProject(p.id);
                        } else if (e.key === 'Escape') {
                          setEditingProjectNameId(null);
                        }
                      }}
                      className="text-xs px-2 py-1 font-bold text-stone-900 focus:outline-none max-w-[170px] bg-white rounded"
                      autoFocus
                    />
                    <button
                      onMouseDown={() => handleRenameProject(p.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                      title="Guardar Nombre"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onMouseDown={() => setEditingProjectNameId(null)}
                      className="p-1 text-stone-400 hover:text-stone-600 font-bold text-xs"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-stone-50/50 hover:bg-stone-50 border border-stone-100 p-0.5 rounded-lg transition-all">
                    <button
                      onClick={() => setActiveProjectId(p.id)}
                      onDoubleClick={() => {
                        if (p.id === activeProjectId) {
                          setEditingProjectNameId(p.id);
                          setTempProjectName(p.name);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                        p.id === activeProjectId
                          ? 'bg-stone-900 text-white'
                          : 'bg-transparent text-stone-600 hover:text-stone-900'
                      }`}
                      title={p.id === activeProjectId ? "Doble clic para renombrar" : "Seleccionar catálogo"}
                    >
                      {p.name}
                    </button>
                    {p.id === activeProjectId && (
                      <div className="flex items-center gap-0.5 pr-1">
                        <button
                          onClick={() => {
                            setEditingProjectNameId(p.id);
                            setTempProjectName(p.name);
                          }}
                          className="p-1 hover:text-stone-900 text-stone-400 hover:scale-110 transition-all cursor-pointer"
                          title="Renombrar catálogo"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="p-1 hover:text-red-600 text-stone-400 hover:scale-110 transition-all cursor-pointer"
                          title="Eliminar Catálogo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo catálogo..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="text-xs px-3 py-2 bg-stone-50 border border-stone-250 rounded focus:outline-none"
            />
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-white static rounded-lg text-xs font-bold hover:bg-stone-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>
        </div>

        {/* 1. Categorías & 2. Etiquetas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
          <AdminCategories 
            categories={activeProject.categories} 
            setCategories={setCategories} 
            products={activeProject.products} 
            setProducts={setProducts} 
          />
          <AdminTags 
            tags={activeProject.tags || []} 
            setTags={setTags} 
            products={activeProject.products} 
            setProducts={setProducts} 
          />
        </div>

        {/* 3. Productos */}
        <div className="my-6">
          <AdminProducts
            products={activeProject.products}
            categories={activeProject.categories}
            tags={activeProject.tags || []}
            setProducts={setProducts}
            setCategories={setCategories}
            setTags={setTags}
          />
        </div>

        {/* 4. Promociones */}
        <div className="my-6">
          <AdminBlocks customBlocks={customBlocks} setCustomBlocks={setCustomBlocks} />
        </div>

        {/* 5. Menú de Opciones */}
        <div className="my-6">
          <AdminOptionsMenu 
            menuOptions={activeProject.menuOptions || DEFAULT_MENU_OPTIONS} 
            setMenuOptions={(opts) => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, menuOptions: opts } : p))}
          />
        </div>

        {/* 6. Plantillas de Mensajes (WhatsApp y Compartir) */}
        <div className="my-6">
          <AdminMessages
            messages={activeProject.messages}
            setMessages={setMessages}
          />
        </div>

        {/* 6. Información Empresa, 7. Información Web */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
          <div>
            <AdminContact 
              contact={activeProject.contact} 
              setContact={setContact} 
            />
          </div>
          <div>
            <AdminDesign design={activeProject.design} setDesign={setDesign} />
          </div>
        </div>

        {/* 8. Historial de Versiones */}
        <div className="my-6">
          <AdminVersionsHistory />
        </div>

        {/* 9. Publicación y Exportación */}
        <div className="my-6">
          <ExporterAdmin 
            project={activeProject} 
            projects={projects}
            customBlocks={customBlocks} 
            onImportConfig={handleImportConfig}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        </div>

      </main>

      {/* Helpful developer guide / how it works strip */}
      <section className="bg-stone-50 border-t border-stone-200 mt-12 py-10 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h3 className="font-serif font-black text-stone-800 text-sm">💡 ¿Cómo funciona Catalog-Exporter Pro?</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-sans max-w-2xl mx-auto">
            1. Llena los productos y clasifícalos de manera interactiva en sus respectivas líneas. <br />
            2. Ajusta los colores de tu marca y carga tu logotipo. <br />
            3. Prueba el catálogo presionando <strong>"Ejecutar Demo Interactiva"</strong>. <br />
            4. Usa las opciones de <strong>Respaldo y Restauración (.JSON)</strong> para guardar o importar la información de tu catálogo en cualquier momento.
          </p>
        </div>
      </section>

      {/* PWA Custom Install Guide Modal */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-xs text-stone-100 uppercase tracking-wide">Instalar en tu Celular</h3>
              </div>
              <button 
                onClick={() => setShowInstallGuideModal(false)}
                className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm text-2xl mb-1">
                  📲
                </div>
                <h4 className="font-serif font-black text-stone-900 text-base">La mejor opción para tu Celular</h4>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  La forma ideal de tener la aplicación en tu celular es <strong>instalar la PWA</strong> para usarla a pantalla completa con velocidad nativa.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4 pt-2 border-t border-stone-150">
                
                {/* Warning about frame */}
                <div className="bg-emerald-50/60 border border-emerald-150 p-3 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold text-xs mt-0.5">⚠️</span>
                    <div className="text-[11px] text-emerald-800 font-sans leading-relaxed font-medium">
                      Como estás dentro del sistema seguro de <strong>Google AI Studio</strong> (que usa un panel incrustado o iframe), el navegador restringe los instaladores automáticos. <strong>Abre el link de manera independiente</strong> para habilitar la instalación directa:
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-850 text-white text-[11px] font-bold rounded shadow-sm cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                      <span>Abrir Standalone</span>
                    </button>
                    
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 text-[11px] font-bold rounded cursor-pointer transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-400" />
                          <span>Copiar Enlace</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Android Steps */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-stone-800 flex items-center gap-1.5 font-serif">
                    <span className="text-xs">🤖</span> Instalación en Android (Chrome / Brave)
                  </h5>
                  <p className="text-[11px] text-stone-600 pl-5 leading-relaxed">
                    1. Haz clic arriba en <span className="font-bold">"Abrir Standalone"</span> para abrirlo en el navegador nativo de tu celular.<br />
                    2. Toca los <span className="font-bold text-stone-800">tres puntos (⋮)</span> superiores o inferiores.<br />
                    3. Selecciona la opción <span className="font-bold text-stone-900 bg-stone-50 px-1 py-0.5 border border-stone-200 rounded">"Instalar aplicación"</span> o <span className="font-bold">"Agregar a pantalla de inicio"</span>.
                  </p>
                </div>

                {/* iPhone Steps */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <h5 className="font-bold text-xs text-stone-800 flex items-center gap-1.5 font-serif">
                    <span className="text-xs">🍎</span> Instalación en iPhone / iPad (Safari)
                  </h5>
                  <p className="text-[11px] text-stone-600 pl-5 leading-relaxed">
                    1. Abre el enlace arriba en Safari seleccionando <span className="font-bold">"Abrir Standalone"</span>.<br />
                    2. Toca el botón <span className="font-bold">Compartir (⎙ o el icono de la flecha hacia arriba ↑)</span> en el menú inferior.<br />
                    3. Desliza hacia abajo y selecciona la opción <span className="font-bold text-stone-900 bg-stone-50 px-1 py-0.5 border border-stone-200 rounded">"Agregar a inicio"</span>.
                  </p>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center">
              {!isAndroid ? (
                <a
                  href="https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702"
                  onClick={(e) => {
                    e.preventDefault();
                    if (document.referrer && document.referrer.includes('ai.studio')) {
                      window.top ? (window.top.location.href = document.referrer) : (window.location.href = document.referrer);
                    } else {
                      window.top ? (window.top.location.href = "https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702") : (window.location.href = "https://ai.studio/build/4c636b4f-9295-4dc0-a5bc-6c17b4258702");
                    }
                  }}
                  target="_top"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-500 hover:text-stone-800 underline font-medium flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Regresar a Google AI Studio</span>
                </a>
              ) : <div />}
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow"
              >
                Entendido, ¡Listo!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Project Delete Modal */}
      <CustomConfirm
        isOpen={!!projectToDelete}
        title="Eliminar Catálogo"
        message={`¿Seguro que desea eliminar por completo el catálogo "${projectToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Catálogo"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Import JSON Modal */}
      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportText={processImportJSONText}
      />

    </div>
  );
}

export default App;
