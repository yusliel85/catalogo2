import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { CatalogProject, CatalogProduct, MenuOptionItem } from '../types';
import { DEFAULT_MENU_OPTIONS, DEFAULT_CUSTOM_MESSAGES } from '../defaultData';
import { CustomBlock } from './AdminBlocks';
import { sortPromosNewestFirst } from '../lib/promoUtils';
import { 
  saveFavoritesToStorage, 
  loadFavoritesFromStorage, 
  saveViewsToStorage, 
  loadViewsFromStorage 
} from '../lib/dbService';
import { getProductSortTimestamp, sortProductsNewestFirst } from '../lib/productUtils';
import { optimizeImageUrl } from '../lib/imageUtils';
import { isRunningInAndroidApp } from '../lib/downloadHelper';
import { 
  Search, Heart, Globe, Sparkles, SlidersHorizontal, X, Share2, Check, 
  BookOpen, ArrowUp, Eye, Settings, Phone, Info, Building, Menu, HelpCircle,
  MessageCircle, Gift, MapPin, Star, Mail, ShoppingBag, Tags, Clock, ArrowUpDown, ArrowLeft, Smartphone
} from 'lucide-react';

const MENU_ICONS: Record<string, React.ComponentType<any>> = {
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Building,
  Info,
  HelpCircle,
  Sparkles,
  Gift,
  MapPin,
  Globe,
  BookOpen,
  Star,
  Mail,
  ShoppingBag,
  Tags,
  Clock
};

const normalizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const getProductCategories = (p: CatalogProduct | undefined | null): string[] => {
  if (!p) return ['General'];
  let list: string[] = [];
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    list = p.categories.filter(c => c && typeof c === 'string' && c.trim() !== '').map(c => c.trim());
  } else if (typeof (p as any).categories === 'string' && (p as any).categories.trim() !== '') {
    list = [(p as any).categories.trim()];
  } else if (p.category && typeof p.category === 'string' && p.category.trim() !== '') {
    list = [p.category.trim()];
  }
  if (list.length === 0) return ['General'];
  const unique = Array.from(new Set(list));
  return unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

const getProductTags = (p: CatalogProduct | undefined | null): string[] => {
  if (!p || !Array.isArray(p.tags)) return [];
  const valid = p.tags
    .filter(t => t && typeof t === 'string' && t.trim() !== '')
    .map(t => t.trim());
  if (valid.length === 0) return [];
  const unique = Array.from(new Set(valid));
  return unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

export const getRelatedProducts = (
  target: CatalogProduct | undefined | null,
  allProducts: CatalogProduct[],
  limit: number = 3
): CatalogProduct[] => {
  if (!target || !allProducts || allProducts.length <= 1) return [];

  const candidates = allProducts.filter(p => p && p.id !== target.id);
  if (candidates.length === 0) return [];

  const targetCats = getProductCategories(target).map(c => normalizeString(c)).filter(Boolean);
  const targetTags = (Array.isArray(target.tags) ? target.tags : [])
    .map(t => normalizeString(t))
    .filter(Boolean);

  const productIndices = new Map<string, number>();
  allProducts.forEach((p, idx) => productIndices.set(p.id, idx));

  const scored = candidates.map(p => {
    const pCats = getProductCategories(p).map(c => normalizeString(c)).filter(Boolean);
    const pTags = (Array.isArray(p.tags) ? p.tags : [])
      .map(t => normalizeString(t))
      .filter(Boolean);

    const catMatches = targetCats.filter(c => pCats.includes(c)).length;
    const tagMatches = targetTags.filter(t => pTags.includes(t)).length;

    const totalTargetCats = Math.max(targetCats.length, 1);
    const totalTargetTags = targetTags.length;

    // 100% full match: matches all categories of target AND matches all tags of target
    const is100CategoryMatch = catMatches === targetCats.length && targetCats.length > 0;
    const is100TagMatch = totalTargetTags > 0 ? tagMatches === totalTargetTags : true;
    const is100PercentMatch = is100CategoryMatch && is100TagMatch;

    return {
      product: p,
      is100PercentMatch,
      catMatches,
      catScore: catMatches / totalTargetCats,
      tagMatches,
      tagScore: totalTargetTags > 0 ? tagMatches / totalTargetTags : 0,
      originalIndex: productIndices.get(p.id) ?? 0
    };
  });

  scored.sort((a, b) => {
    // 1. 100% match on both categories and tags first
    if (a.is100PercentMatch && !b.is100PercentMatch) return -1;
    if (!a.is100PercentMatch && b.is100PercentMatch) return 1;

    // 2. Priority to categories (highest number of matching categories)
    if (b.catMatches !== a.catMatches) {
      return b.catMatches - a.catMatches;
    }

    // 3. Next, priority to tags (highest number of matching tags)
    if (b.tagMatches !== a.tagMatches) {
      return b.tagMatches - a.tagMatches;
    }

    // 4. Stable order based on original catalog position
    return a.originalIndex - b.originalIndex;
  });

  return scored.slice(0, limit).map(s => s.product);
};

export function ProductImageWithLoader({
  src,
  alt,
  className = '',
  referrerPolicy = 'no-referrer',
  objectFit = 'cover',
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  objectFit?: 'cover' | 'contain';
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const isDataUrl = typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'));
  const optimizedSrc = useMemo(() => isDataUrl ? src : optimizeImageUrl(src), [src, isDataUrl]);

  if (hasError || !optimizedSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 text-xs font-semibold bg-stone-50">
        <SlidersHorizontal className="w-6 h-6 stroke-1 mb-1" />
        <span>Sin foto</span>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={priority || isDataUrl ? 'eager' : 'lazy'}
      decoding={isDataUrl ? 'auto' : 'async'}
      {...({ fetchPriority: priority || isDataUrl ? 'high' : 'auto' } as any)}
      onError={() => setHasError(true)}
      referrerPolicy={referrerPolicy}
      className={`${className} ${
        objectFit === 'contain' ? 'object-contain' : 'object-cover'
      }`}
    />
  );
}

interface CatalogPreviewProps {
  project: CatalogProject;
  customBlocks?: CustomBlock[];
  previewOnly?: boolean;
}

export function CatalogPreview({ project, customBlocks = [], previewOnly = false }: CatalogPreviewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(true);
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [project?.id]);

  const menuOptions = project?.menuOptions || DEFAULT_MENU_OPTIONS;
  const favOpt = menuOptions.find(o => o.id === 'favorites');
  const shareOpt = menuOptions.find(o => o.id === 'share');
  const whatsappOpt = menuOptions.find(o => o.id === 'whatsapp');
  const companyOpt = menuOptions.find(o => o.id === 'company');
  const aboutOpt = menuOptions.find(o => o.id === 'about');
  const howItWorksOpt = menuOptions.find(o => o.id === 'how_it_works');
  
  // Standalone storage partitioning key (using project ID context)
  const favStorageKey = `catalog-fav-${project?.id || 'default'}`;

  // Read/write favorites to state, initialized synchronously from all known storage keys
  const [tempFavorites, setTempFavorites] = useState<string[]>(() => {
    const pId = project?.id || 'default';
    const keys = [
      `catalog-fav-${pId}`,
      `interactive-catalog-fav-${pId}`,
      `catalog-user-favorites-${pId}`
    ];
    for (const k of keys) {
      try {
        const stored = localStorage.getItem(k);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return project?.favorites || [];
  });

  // Asynchronously load and synchronize favorites from IndexedDB & persistent storage on mount or project switch
  useEffect(() => {
    if (!project?.id) return;
    let isMounted = true;
    loadFavoritesFromStorage(project.id).then(storedFavs => {
      if (isMounted && storedFavs && Array.isArray(storedFavs) && storedFavs.length > 0) {
        setTempFavorites(prev => {
          const merged = Array.from(new Set([...prev, ...storedFavs]));
          return merged;
        });
      }
    }).catch(err => console.error('Error loading persistent favorites:', err));
    return () => { isMounted = false; };
  }, [project?.id]);

  // Get unique valid favorite IDs that actually correspond to existing products
  const validFavorites = useMemo(() => {
    const uniqueIds = Array.from(new Set(tempFavorites)).filter(id => id && id.trim() !== '');
    return uniqueIds.filter(favId => (project?.products || []).some(p => p.id === favId));
  }, [tempFavorites, project?.products]);

  // Standalone storage partitioning key for interactive views
  const viewsStorageKey = `catalog-views-${project?.id || 'default'}`;
  const lastViewedStorageKey = `catalog-last-viewed-${project?.id || 'default'}`;

  const [localViews, setLocalViews] = useState<{ [productId: string]: number }>(() => {
    const pId = project?.id || 'default';
    const initViews: Record<string, number> = {};
    
    // Seed with existing product viewsCount
    (project?.products || []).forEach(p => {
      if (typeof p.viewsCount === 'number' && p.viewsCount > 0) {
        initViews[p.id] = p.viewsCount;
      }
    });

    const keys = [
      `catalog-views-${pId}`,
      `interactive-catalog-views-${pId}`
    ];
    for (const k of keys) {
      try {
        const stored = localStorage.getItem(k);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const prodId in parsed) {
              initViews[prodId] = Math.max(initViews[prodId] || 0, parsed[prodId] || 0);
            }
          }
        }
      } catch (e) {}
    }
    return initViews;
  });

  const [lastViewedTimestamps, setLastViewedTimestamps] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(`catalog-last-viewed-${project?.id || 'default'}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    if (project?.id) {
      try {
        const stored = localStorage.getItem(`catalog-last-viewed-${project.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') setLastViewedTimestamps(parsed);
        }
      } catch (e) {}
      
      // Load views from IndexedDB backup
      loadViewsFromStorage(project.id).then(storedViews => {
        if (storedViews && Object.keys(storedViews).length > 0) {
          setLocalViews(prev => {
            const merged = { ...prev };
            for (const k in storedViews) {
              merged[k] = Math.max(merged[k] || 0, storedViews[k] || 0);
            }
            return merged;
          });
        }
      }).catch(() => {});
    }
  }, [project?.id]);

  const mergeViewsMax = (prev: { [id: string]: number }, next: { [id: string]: number }) => {
    const merged = { ...prev };
    for (const k in next) {
      merged[k] = Math.max(prev[k] || 0, next[k] || 0);
    }
    return merged;
  };

  // Load global views from backend API on mount or project ID change
  const CANONICAL_API_URL = 'https://ais-pre-tvnitfjrirlgmma5m3vptj-811628296425.us-east1.run.app';

  const getApiEndpoints = () => {
    const endpoints = new Set<string>();
    // In Android APK or standalone local file mode, do not connect to remote Cloud Run
    if (isRunningInAndroidApp()) {
      return [];
    }

    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      if (origin && origin !== 'null' && !origin.startsWith('file:') && !origin.startsWith('content:')) {
        endpoints.add(origin);
      }
    }
    // Only add canonical URL in web environment if on web
    if (!isRunningInAndroidApp()) {
      endpoints.add(CANONICAL_API_URL);
    }
    return Array.from(endpoints);
  };

  useEffect(() => {
    if (!project?.id) return;
    const endpoints = getApiEndpoints();

    // Collect base views from current products
    const productBaseViews: Record<string, number> = {};
    (project.products || []).forEach(p => {
      if (typeof p.viewsCount === 'number' && p.viewsCount > 0) {
        productBaseViews[p.id] = p.viewsCount;
      }
    });

    const syncAndFetchViews = () => {
      endpoints.forEach(apiBaseUrl => {
        fetch(`${apiBaseUrl}/api/views/sync/${project.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ views: productBaseViews })
        })
          .then(res => {
            if (!res.ok) throw new Error('Sync endpoint fallback');
            return res.json();
          })
          .then(data => {
            if (data && typeof data === 'object') {
              setLocalViews(prev => {
                const merged = mergeViewsMax(prev, data);
                saveViewsToStorage(project.id, merged);
                return merged;
              });
            }
          })
          .catch(() => {
            // Fallback simple GET if sync fails
            fetch(`${apiBaseUrl}/api/views/${project.id}`)
              .then(res => res.json())
              .then(data => {
                if (data && typeof data === 'object') {
                  setLocalViews(prev => {
                    const merged = mergeViewsMax(prev, data);
                    saveViewsToStorage(project.id, merged);
                    return merged;
                  });
                }
              })
              .catch(e => console.warn('Error loading global views:', e));
          });
      });
    };

    // Load initially
    syncAndFetchViews();

    // Connect to SSE stream for real-time views updates with robust reconnection handler
    const eventSources: EventSource[] = [];
    let reconnectTimeout: any = null;

    const connectRealtime = () => {
      eventSources.forEach(es => {
        try { es.close(); } catch(e) {}
      });
      eventSources.length = 0;

      endpoints.forEach(apiBaseUrl => {
        try {
          const streamUrl = `${apiBaseUrl}/api/views/stream/${project.id}`;
          const es = new EventSource(streamUrl);

          es.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data && typeof data === 'object') {
                setLocalViews(prev => {
                  const merged = mergeViewsMax(prev, data);
                  saveViewsToStorage(project.id, merged);
                  return merged;
                });
              }
            } catch (err) {
              console.error('Error parsing SSE real-time views:', err);
            }
          };

          es.onerror = () => {
            try { es.close(); } catch(e) {}
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(connectRealtime, 6000);
          };

          eventSources.push(es);
        } catch (e) {}
      });
    };

    connectRealtime();

    // Setup robust backup polling interval for reliable sync across all devices
    const pollInterval = setInterval(syncAndFetchViews, 5000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncAndFetchViews();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      eventSources.forEach(es => {
        try { es.close(); } catch(e) {}
      });
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [project?.id]);

  // UI state
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(() => {
    if (typeof window !== 'undefined' && project?.products) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#prod-')) {
        const id = hash.replace('#prod-', '');
        return project.products.find(p => p.id === id) || null;
      }
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('p');
      if (prodId) {
        return project.products.find(p => p.id === prodId) || null;
      }
    }
    return null;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isApprovingExit = useRef(false);
  const hasInitializedHistory = useRef(false);

  const closeOnlyModals = () => {
    setShowConfigMenu(false);
    setShowFavoritesScreen(false);
    setShowCompanyScreen(false);
    setShowAboutScreen(false);
    setShowHowItWorksScreen(false);
  };

  const closeAllModals = () => {
    const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
    try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
    setSelectedProduct(null);
    setSelectedPromo(null);
    closeOnlyModals();
  };

  const syncUIWithHash = () => {
    const hash = window.location.hash;
    
    // Check URL query parameters on load
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('p');
    if (prodId && !hasInitializedHistory.current) {
      const prod = project?.products?.find(p => p.id === prodId);
      if (prod) {
        hasInitializedHistory.current = true;
        window.history.replaceState({ step: 'main' }, '', '#main');
        window.history.pushState({ step: `#prod-${prodId}` }, '', `#prod-${prodId}`);
        closeAllModals();
        setSelectedProduct(prod);
        return;
      }
    }

    // Baseline history initialization
    if (!hasInitializedHistory.current) {
      hasInitializedHistory.current = true;
      const rawHash = window.location.hash;
      const initialHash = (rawHash && rawHash !== '#' && rawHash !== '#menu') ? rawHash : '#main';
      window.history.replaceState({ step: 'main' }, '', '#main');
      if (initialHash !== '#main') {
        window.history.pushState({ step: initialHash }, '', initialHash);
      } else {
        try { window.location.hash = '#main'; } catch(e) {}
      }
    }

    if (!hash || hash === '' || hash === '#') {
      if (isApprovingExit.current) return;
      window.history.pushState({ step: 'main' }, '', '#main');
      setShowExitConfirm(true);
      return;
    }

    if (hash === '#main') {
      closeAllModals();
    } else if (hash.startsWith('#prod-')) {
      const id = hash.replace('#prod-', '');
      const prod = project?.products?.find(p => p.id === id);
      if (prod) {
        setShowExitConfirm(false);
        closeOnlyModals();
        setSelectedProduct(prod);
      } else {
        window.location.hash = '#main';
      }
    } else if (hash === '#menu') {
      setShowExitConfirm(false);
      closeOnlyModals();
      setShowConfigMenu(true);
    } else if (hash === '#favorites') {
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
      setShowExitConfirm(false);
      setSelectedProduct(null);
      setSelectedPromo(null);
      closeOnlyModals();
      setShowFavoritesScreen(true);
    } else if (hash === '#company') {
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
      setShowExitConfirm(false);
      setSelectedProduct(null);
      setSelectedPromo(null);
      closeOnlyModals();
      setShowCompanyScreen(true);
    } else if (hash === '#about') {
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
      setShowExitConfirm(false);
      setSelectedProduct(null);
      setSelectedPromo(null);
      closeOnlyModals();
      setShowAboutScreen(true);
    } else if (hash === '#how-it-works') {
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
      setShowExitConfirm(false);
      setSelectedProduct(null);
      setSelectedPromo(null);
      closeOnlyModals();
      setShowHowItWorksScreen(true);
    } else if (hash.startsWith('#promo-')) {
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
      const id = hash.replace('#promo-', '');
      const promo = (shuffledBlocks.length > 0 ? shuffledBlocks : (customBlocks || [])).find(b => b.id === id);
      if (promo) {
        setShowExitConfirm(false);
        setSelectedProduct(null);
        closeOnlyModals();
        setSelectedPromo(promo);
      } else {
        window.location.hash = '#main';
      }
    } else {
      window.location.hash = '#main';
    }
  };

  const navigateToHash = (targetHash: string) => {
    if (window.location.hash === targetHash) {
      syncUIWithHash();
      return;
    }
    if (window.location.hash === '#menu') {
      window.history.replaceState({ step: targetHash }, '', targetHash);
      syncUIWithHash();
    } else {
      window.location.hash = targetHash;
    }
  };

  const closeActiveModal = () => {
    const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
    try { sessionStorage.removeItem(sessionActiveKey); } catch (e) {}
    const currentHash = window.location.hash;
    const isCurrentlyModal = currentHash && currentHash !== '#main' && currentHash !== '' && currentHash !== '#';
    if (isCurrentlyModal) {
      window.history.back();
    } else {
      window.location.hash = '#main';
    }
  };

  const selectProduct = (prod: CatalogProduct | null) => {
    if (prod) {
      navigateToHash(`#prod-${prod.id}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      closeActiveModal();
    }
  };

  const handleBack = () => {
    closeActiveModal();
  };

  const handleConfirmExit = () => {
    isApprovingExit.current = true;
    setShowExitConfirm(false);
    
    // Intenta cerrar el catálogo de varias maneras
    try {
      window.close();
    } catch (e) {
      console.error(e);
    }

    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'close_catalog' }, '*');
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      window.history.go(-2);
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }, 50);
  };

  // Record a product view globally on backend (100% online) and save locally for fallback
  useEffect(() => {
    if (selectedProduct) {
      const prodId = selectedProduct.id;
      const now = Date.now();

      // Check if this product view was already registered in the active session
      // (prevents incrementing on page refresh/reload while inside the product)
      const sessionActiveKey = `active-viewed-prod-${project?.id || 'default'}`;
      let isSameSession = false;
      try {
        isSameSession = sessionStorage.getItem(sessionActiveKey) === prodId;
      } catch (e) {}

      if (!isSameSession) {
        try {
          sessionStorage.setItem(sessionActiveKey, prodId);
        } catch (e) {}

        setLastViewedTimestamps(prev => {
          const next = { ...prev, [prodId]: now };
          try {
            localStorage.setItem(lastViewedStorageKey, JSON.stringify(next));
          } catch (e) {}
          return next;
        });

        const currentViews = (localViews && typeof localViews[prodId] === 'number') 
          ? localViews[prodId] 
          : (selectedProduct.viewsCount || 0);
        const nextCount = currentViews + 1;

        // Optimistically increment views in state
        setLocalViews(prev => {
          const next = { ...prev, [prodId]: nextCount };
          if (project?.id) {
            saveViewsToStorage(project.id, next);
          }
          return next;
        });

        // 100% online synchronization with backend
        if (project?.id) {
          const endpoints = getApiEndpoints();
          endpoints.forEach(apiBaseUrl => {
            fetch(`${apiBaseUrl}/api/views/${project.id}/${prodId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ baseViews: currentViews })
            })
              .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
              })
              .then(data => {
                if (data && typeof data === 'object') {
                  setLocalViews(prev => {
                    const merged = mergeViewsMax(prev, data);
                    saveViewsToStorage(project.id, merged);
                    return merged;
                  });
                }
              })
              .catch(e => console.error('Error syncing global view with backend:', e));
          });
        }
      }
    }
  }, [selectedProduct?.id, project?.id, lastViewedStorageKey, viewsStorageKey]);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'alpha' | 'alpha_desc' | 'price_asc' | 'price_desc' | 'views'>('default');
  const [copied, setCopied] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showFavoritesScreen, setShowFavoritesScreen] = useState(false);
  const [showCompanyScreen, setShowCompanyScreen] = useState(false);
  const [showAboutScreen, setShowAboutScreen] = useState(false);
  const [showHowItWorksScreen, setShowHowItWorksScreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shuffledBlocks, setShuffledBlocks] = useState<CustomBlock[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<CustomBlock | null>(null);
  const [isHoveringPromo, setIsHoveringPromo] = useState(false);
  const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Helper for computing total views accurately
  const getProductViews = (p: CatalogProduct) => Math.max(p?.viewsCount || 0, localViews[p?.id] || 0);

  // Determine top (most popular) product per category with tie-breaking by last viewed timestamp
  const trendingProductIds = useMemo(() => {
    if (!project?.products || project.products.length === 0) return new Set<string>();

    const topByCat: Record<string, { id: string; views: number; timestamp: number }> = {};

    project.products.forEach(p => {
      const views = getProductViews(p);
      if (views < 1) return;
      const ts = lastViewedTimestamps[p.id] || 0;
      const pCats = getProductCategories(p);

      pCats.forEach(cat => {
        const cur = topByCat[cat];
        if (!cur) {
          topByCat[cat] = { id: p.id, views, timestamp: ts };
        } else {
          if (views > cur.views) {
            topByCat[cat] = { id: p.id, views, timestamp: ts };
          } else if (views === cur.views) {
            // Tie in views count: choose the last viewed product as most popular
            if (ts >= cur.timestamp) {
              topByCat[cat] = { id: p.id, views, timestamp: ts };
            }
          }
        }
      });
    });

    const set = new Set<string>();
    Object.values(topByCat).forEach(item => {
      if (item && item.id) {
        set.add(item.id);
      }
    });
    return set;
  }, [project?.products, localViews, lastViewedTimestamps]);

  // Determine if selected product is trending (most popular in any of its categories)
  const isSelectedProductTrending = useMemo(() => {
    if (!selectedProduct) return false;
    return trendingProductIds.has(selectedProduct.id);
  }, [selectedProduct, trendingProductIds]);

  // Lock body scroll when any independent info screen or modal is active (not product details, which scrolls natively now)
  useEffect(() => {
    if (selectedPromo || showFavoritesScreen || showCompanyScreen || showAboutScreen || showHowItWorksScreen || showExitConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPromo, showFavoritesScreen, showCompanyScreen, showAboutScreen, showHowItWorksScreen, showExitConfirm]);

  // Auto scroll logic for promotions carousel
  useEffect(() => {
    if (!shuffledBlocks || shuffledBlocks.length <= 1 || isHoveringPromo || selectedPromo) return;
    const interval = setInterval(() => {
      const el = carouselRef.current;
      if (!el) return;

      const scrollWidth = el.scrollWidth;
      const clientWidth = el.clientWidth;
      const maxScrollLeft = scrollWidth - clientWidth;

      if (el.scrollLeft >= maxScrollLeft - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const firstChild = el.firstElementChild as HTMLElement;
        const step = firstChild ? firstChild.offsetWidth + 16 : 300;
        el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [shuffledBlocks, isHoveringPromo, selectedPromo]);

  const fallbackShareText = (prod: CatalogProduct, text: string) => {
    if (navigator.share) {
      navigator.share({
        title: prod.name,
        text: text,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(text);
      setCopiedProduct(true);
      setTimeout(() => setCopiedProduct(false), 2000);
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const getCatalogUrl = (): string => {
    return project.design.shareUrl || window.location.href;
  };

  const getProductUrl = (prod: CatalogProduct): string => {
    const baseUrl = project.design.shareUrl || window.location.href;
    const cleanBase = baseUrl.split('#')[0];
    return `${cleanBase}#prod-${prod.id}`;
  };

  const getProductImageInfo = (prod: CatalogProduct) => {
    const validImages = (prod.images || []).filter(img => img && String(img).trim() !== '');
    const rawImg = prod.image || validImages[prod.primaryImageIndex ?? 0] || validImages[0] || '';
    
    let absoluteUrl = '';
    let imgPart = '';

    if (rawImg) {
      if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
        absoluteUrl = rawImg;
        imgPart = `🖼️ *Imagen:* ${absoluteUrl}`;
      }
      // Note: for data: base64 images or relative paths, imgPart remains empty string ""
      // to avoid duplicating the product URL in the message text. The actual image file
      // will be attached dynamically via Web Share API (files) when available.
    }

    return { rawImg, absoluteUrl, imgPart };
  };

  const formatCatalogShareText = (overrideUrl?: string) => {
    const template = project.messages?.shareCatalog || DEFAULT_CUSTOM_MESSAGES.shareCatalog;
    const catalogUrl = overrideUrl || getCatalogUrl();
    const text = template
      .replace(/\{nombre_catalogo\}/gi, project.name || 'Catálogo Digital')
      .replace(/\{nombre\}/gi, project.name || 'Catálogo Digital')
      .replace(/\{empresa\}/gi, project.contact?.company || project.contact?.name || '')
      .replace(/\{direccion\}/gi, project.contact?.address || '')
      .replace(/\{url\}/gi, catalogUrl);
    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  const formatProductShareText = (prod: CatalogProduct) => {
    const template = project.messages?.shareProduct || DEFAULT_CUSTOM_MESSAGES.shareProduct;
    const catalogUrl = getCatalogUrl();
    const prodUrl = getProductUrl(prod);
    const { imgPart } = getProductImageInfo(prod);
    const priceText = prod.price ? `*Precio:* $${prod.price} ${prod.currency || ''}`.trim() : '';

    const text = template
      .replace(/\{nombre\}/gi, prod.name || '')
      .replace(/\{categoria\}/gi, prod.category || '')
      .replace(/\{descripcion\}/gi, prod.description || '')
      .replace(/\{precio\}/gi, priceText)
      .replace(/\{sku\}/gi, prod.sku ? `SKU: ${prod.sku}` : '')
      .replace(/\{imagen\}/gi, imgPart || '')
      .replace(/\{empresa\}/gi, project.contact?.company || project.contact?.name || '')
      .replace(/\{direccion\}/gi, project.contact?.address || '')
      .replace(/\{url\}/gi, prodUrl || catalogUrl);

    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  const formatConsultProductText = (prod: CatalogProduct) => {
    const template = project.messages?.consultProduct || DEFAULT_CUSTOM_MESSAGES.consultProduct;
    const prodUrl = getProductUrl(prod);
    const { imgPart } = getProductImageInfo(prod);
    const priceText = prod.price ? `*Precio:* $${prod.price} ${prod.currency || ''}`.trim() : '';

    const text = template
      .replace(/\{nombre\}/gi, prod.name || '')
      .replace(/\{categoria\}/gi, prod.category || '')
      .replace(/\{descripcion\}/gi, prod.description || '')
      .replace(/\{precio\}/gi, priceText)
      .replace(/\{sku\}/gi, prod.sku ? `SKU: ${prod.sku}` : '')
      .replace(/\{imagen\}/gi, imgPart || '')
      .replace(/\{empresa\}/gi, project.contact?.company || project.contact?.name || '')
      .replace(/\{direccion\}/gi, project.contact?.address || '')
      .replace(/\{url\}/gi, prodUrl);

    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  const handleProductShare = async (prod: CatalogProduct) => {
    setIsGeneratingScreenshot(true);
    
    const { rawImg } = getProductImageInfo(prod);
    const detailText = formatProductShareText(prod);

    try {
      let file: File | null = null;
      let blob: Blob | null = null;

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
          blob = new Blob([u8arr], { type: mime });
          const extension = mime.split('/')[1] || 'png';
          file = new File([blob], `${prod.name.replace(/\s+/g, '_')}.${extension}`, { type: mime });
        } else {
          // Fetch the image from URL
          const response = await fetch(rawImg);
          blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'png';
          file = new File([blob], `${prod.name.replace(/\s+/g, '_')}.${extension}`, { type: blob.type });
        }
      }

      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: prod.name,
            text: detailText,
            files: [file],
          });
        } catch (err) {
          console.log('Error sharing image file, falling back to download + text:', err);
          if (blob) {
            const extension = blob.type.split('/')[1] || 'png';
            downloadBlob(blob, `${prod.name.replace(/\s+/g, '_')}.${extension}`);
          }
          fallbackShareText(prod, detailText);
        }
      } else {
        if (blob) {
          const extension = blob.type.split('/')[1] || 'png';
          downloadBlob(blob, `${prod.name.replace(/\s+/g, '_')}.${extension}`);
        }
        fallbackShareText(prod, detailText);
      }
    } catch (err) {
      console.error('Sharing failed, falling back to text:', err);
      fallbackShareText(prod, detailText);
    } finally {
      setIsGeneratingScreenshot(false);
    }
  };

  const handleConsultProduct = async (prod: CatalogProduct) => {
    setIsConsulting(true);
    const detailText = formatConsultProductText(prod);
    const phoneClean = project.contact?.phone ? project.contact.phone.replace(/[+\s-]/g, '') : '';
    const { rawImg } = getProductImageInfo(prod);

    try {
      let file: File | null = null;
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
          file = new File([blob], `${prod.name.replace(/\s+/g, '_')}.${extension}`, { type: mime });
        } else if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
          const response = await fetch(rawImg);
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'png';
          file = new File([blob], `${prod.name.replace(/\s+/g, '_')}.${extension}`, { type: blob.type });
        }
      }

      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: prod.name,
            text: detailText,
            files: [file],
          });
          return;
        } catch (err) {
          console.log('Native share cancelled or failed, using direct WhatsApp URL fallback:', err);
        }
      }
    } catch (err) {
      console.error('Error sharing image file in consult:', err);
    } finally {
      setIsConsulting(false);
    }

    const whatsappUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(detailText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(detailText)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Check URL query parameters and Hash to open selected product automatically and support phone/browser back navigation
  const syncRef = useRef(syncUIWithHash);
  syncRef.current = syncUIWithHash;

  useEffect(() => {
    const handlePopState = () => {
      syncRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    syncUIWithHash();
  }, [project?.products, shuffledBlocks, project?.design?.customBlocks]);

  // Monitor scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sort custom blocks newest first (las últimas agregadas primero)
  useEffect(() => {
    if (customBlocks && customBlocks.length > 0) {
      const sorted = sortPromosNewestFirst(customBlocks);
      setShuffledBlocks(sorted);
    } else {
      setShuffledBlocks([]);
    }
  }, [customBlocks]);

  // Set initial active image for the detail modal when a product is opened
  useEffect(() => {
    if (selectedProduct) {
      const validImages = (selectedProduct.images || []).filter(img => img && img.trim() !== '');
      const mainImg = validImages[selectedProduct.primaryImageIndex ?? 0] || validImages[0];
      setActiveModalImage(mainImg || null);
    } else {
      setActiveModalImage(null);
    }
  }, [selectedProduct?.id]);

  const handleShare = async (customText?: string) => {
    const url = project.design.shareUrl || window.location.href;
    const title = project.name || 'Catálogo Digital';
    const text = customText || formatCatalogShareText(url);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return;
      } catch (err) {
        // Fallback on failure or user cancellation
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt("Copia el enlace del catálogo:", url);
    }
  };

  const toggleFavorite = (prodId: string) => {
    if (!prodId) return;
    setTempFavorites(prev => {
      const cleanPrev = Array.from(new Set(prev)).filter(id => id && String(id).trim() !== '');
      const isFav = cleanPrev.includes(prodId);
      const updated = isFav ? cleanPrev.filter(id => id !== prodId) : [...cleanPrev, prodId];
      if (project?.id) {
        saveFavoritesToStorage(project.id, updated);
      }
      return updated;
    });
  };

  // Unified list of categories (from project.categories and project.products)
  const activeCategories = useMemo(() => {
    const catMap = new Map<string, string>();

    // 1. Categories explicitly defined in project
    (project?.categories || []).forEach(cat => {
      if (cat && typeof cat === 'string' && cat.trim() !== '' && cat.toUpperCase() !== 'TODOS') {
        const trimmed = cat.trim();
        catMap.set(trimmed.toLowerCase(), trimmed);
      }
    });

    // 2. Categories assigned to products
    (project?.products || []).forEach(p => {
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

    return ['TODOS', ...Array.from(catMap.values())];
  }, [project?.categories, project?.products]);

  // Style helper based on project fonts
  const fontClass = project.design.fontFamily === 'serif'
    ? 'font-serif'
    : project.design.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Filtering & Sorting Products
  let filteredProducts = (project?.products || []).filter(prod => {
    const q = normalizeString(search);
    const prodCats = getProductCategories(prod);
    const nameStr = normalizeString(prod.name);
    const categoryStr = normalizeString(prodCats.join(' '));
    const materialStr = normalizeString(prod.material);
    const descStr = normalizeString(prod.description);
    const tagsStr = normalizeString((prod.tags || []).join(' '));

    const matchesSearch = nameStr.includes(q) ||
                          categoryStr.includes(q) ||
                          materialStr.includes(q) ||
                          descStr.includes(q) ||
                          tagsStr.includes(q);
    
    const matchesCategory = selectedCategory === 'TODOS' || 
      prodCats.some(c => c && typeof c === 'string' && c.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
    const matchesFavorite = !favoritesOnly || validFavorites.includes(prod.id);

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-center text-stone-500 font-sans" id="catalog-preview-root-empty">
        <BookOpen className="w-12 h-12 stroke-1 text-stone-300 mb-2" />
        <p className="text-sm font-semibold text-stone-600">No hay catálogo seleccionado</p>
        <p className="text-xs text-stone-400 max-w-xs mt-1">Crea o selecciona un catálogo en el panel de control para comenzar a visualizarlo.</p>
      </div>
    );
  }

  if (sortBy === 'default') {
    filteredProducts = sortProductsNewestFirst(filteredProducts);
  } else if (sortBy === 'alpha') {
    filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
  } else if (sortBy === 'alpha_desc') {
    filteredProducts.sort((a, b) => (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }));
  } else if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
      const priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;
      if (priceA === 0 && priceB > 0) return 1;
      if (priceB === 0 && priceA > 0) return -1;
      return priceA - priceB;
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const priceA = typeof a.price === 'number' && !isNaN(a.price) ? a.price : 0;
      const priceB = typeof b.price === 'number' && !isNaN(b.price) ? b.price : 0;
      return priceB - priceA;
    });
  } else if (sortBy === 'views') {
    const productIndices = new Map<string, number>();
    project.products.forEach((p, idx) => {
      productIndices.set(p.id, idx);
    });
    filteredProducts.sort((a, b) => {
      const viewsDiff = getProductViews(b) - getProductViews(a);
      if (viewsDiff !== 0) return viewsDiff;
      const tsA = lastViewedTimestamps[a.id] || 0;
      const tsB = lastViewedTimestamps[b.id] || 0;
      if (tsB !== tsA) return tsB - tsA;
      return (productIndices.get(a.id) ?? 0) - (productIndices.get(b.id) ?? 0);
    });
  }

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

  return (
    <div className={`min-h-screen bg-[#fafaf9] text-stone-800 selection:bg-stone-200 selection:text-stone-900 ${fontClass}`} id="catalog-preview-root">
      
      {/* Brand Top Header Banner */}
      {!selectedProduct && (
        project.design.bannerImage ? (
          <div className="w-full h-44 relative bg-stone-900 overflow-hidden">
            <img src={project.design.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-65" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf9] to-stone-900/45" />
            <div className="absolute bottom-4 left-6 md:left-12 flex items-center gap-4">
              {project.design.logoImage ? (
                <div className="w-14 h-14 rounded-xl bg-white p-1 border shadow-md flex-shrink-0 flex items-center justify-center aspect-square overflow-hidden">
                  <img src={project.design.logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm flex-shrink-0 aspect-square" 
                  style={{
                    color: project.design.primaryColor,
                    backgroundColor: `${project.design.primaryColor}15`,
                    borderColor: `${project.design.primaryColor}30`
                  }}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900 tracking-tight">{project.name}</h1>
                <p className="text-xs text-stone-500 font-medium tracking-wide mt-0.5">{project.design.bannerSubtitle || 'Catálogo de exhibición'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 px-6 md:px-12 bg-white border-b border-stone-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {project.design.logoImage ? (
                <div className="w-12 h-12 bg-white border p-1 rounded-xl flex items-center justify-center flex-shrink-0 aspect-square overflow-hidden">
                  <img src={project.design.logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm flex-shrink-0 aspect-square"
                  style={{
                    color: project.design.primaryColor,
                    backgroundColor: `${project.design.primaryColor}15`,
                    borderColor: `${project.design.primaryColor}30`
                  }}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-serif leading-tight tracking-tight">{project.name}</h1>
                <p className="text-xs text-stone-500 font-medium tracking-wide mt-0.5">{project.design.bannerSubtitle || 'Catálogo de exhibición'}</p>
              </div>
            </div>
          </div>
        )
      )}

      {!selectedProduct ? (
        <>
          {/* Top Filter and Search Control Bar (Guarantees mobile friendliness: no products pushed down) */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-1.5 pb-1">
            
            {/* Promociones y Avisos Destacados - Horizontal Scroll Carousel */}
            {shuffledBlocks && shuffledBlocks.length > 0 && (
              <div id="promos-ads-section" className="mb-3">
                <div 
                  ref={carouselRef}
                  onMouseEnter={() => setIsHoveringPromo(true)}
                  onMouseLeave={() => setIsHoveringPromo(false)}
                  onTouchStart={() => setIsHoveringPromo(true)}
                  className="flex gap-4 overflow-x-auto pb-2.5 snap-x snap-mandatory scroll-smooth"
                >
                  {shuffledBlocks.map(block => {
                    const hasImg = !!block.image;
                    return (
                      <div
                        key={block.id}
                        onClick={() => navigateToHash(`#promo-${block.id}`)}
                        className="snap-start shrink-0 w-[290px] sm:w-[360px] bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-sm hover:border-stone-400 transition-all overflow-hidden flex flex-row cursor-pointer select-none"
                      >
                        {hasImg && (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-stone-50 flex-shrink-0 border-r border-stone-100">
                            <img
                              src={block.image}
                              alt={block.title}
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          </div>
                        )}
                        <div className="p-3 flex-grow flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <h4 className="font-semibold text-stone-900 text-sm truncate max-w-[150px] sm:max-w-[200px]" title={block.title}>{block.title}</h4>
                              {block.badge && (
                                <span 
                                  className="text-xs text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                  style={{ backgroundColor: project.design.primaryColor }}
                                >
                                  {block.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-3 whitespace-pre-line">{block.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modern simplified search block with Sort selector */}
            <div className="flex items-center gap-3 w-full mb-3">
              <div className="relative flex-grow bg-white p-3 rounded-xl border border-stone-200/85 shadow-sm flex items-center h-12">
                <div className="absolute left-4.5 flex items-center pointer-events-none text-stone-400">
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-stone-500 focus:outline-none transition-colors font-sans h-8"
                />
              </div>
              <div className="relative w-12 h-12 bg-white rounded-xl border border-stone-200/85 shadow-sm flex items-center justify-center shrink-0 hover:border-stone-400 hover:bg-stone-50 transition-colors cursor-pointer group">
                <ArrowUpDown className="w-4.5 h-4.5 text-stone-600 group-hover:text-stone-800 transition-colors stroke-[2]" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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

            {/* Horizontal scrollable chips bar */}
            <div className="w-full overflow-hidden">
              <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mb-1">
                {activeCategories.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`snap-start shrink-0 text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200 ease-in-out cursor-pointer border ${
                        isSelected
                          ? 'text-white border-transparent shadow-xs scale-[1.02]'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                      }`}
                      style={isSelected ? { backgroundColor: project.design.primaryColor } : undefined}
                    >
                      {cat === 'TODOS' ? 'Todos' : cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Grid display area - products render dynamic specs */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            

            {isInitialLoading ? (
              <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-sm my-4 flex flex-col items-center justify-center min-h-[320px] animate-in fade-in duration-200">
                <div className="w-10 h-10 rounded-full border-3 border-stone-200 border-t-amber-600 animate-spin mb-4"></div>
                <h3 className="font-serif font-bold text-stone-900 text-base md:text-lg">
                  Espere un momento se esta cargando la información...
                </h3>
                <p className="text-xs text-stone-500 mt-1.5 font-sans max-w-sm mx-auto leading-relaxed">
                  Estamos organizando los productos, fotografías y detalles del catálogo para su exhibición.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-sm">
                <span className="text-3xl">🏜️</span>
                <h3 className="font-serif font-bold text-stone-850 mt-3 text-sm">No se encontraron productos coincidentes</h3>
                <p className="text-xs text-stone-550 mt-1 max-w-sm mx-auto leading-relaxed">
                  {favoritesOnly 
                    ? "Presione el ícono de corazón en los productos para agregarlos a sus favoritos de exhibición e iniciar una colección personalizada."
                    : "Intente utilizar palabras clave generales o verifique que esté seleccionada la sección o línea correspondiente."
                  }
                </p>
              </div>
            ) : (
              <div className={`grid gap-5 ${
                project.design.layoutGrid === '3x3'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : project.design.layoutGrid === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-2 lg:grid-cols-3'
              }`}>
                {filteredProducts.map((prod, idx) => {
                  const isFavorite = validFavorites.includes(prod.id);
                  const rawImgs = (Array.isArray(prod.images) ? prod.images : []).filter(img => img && typeof img === 'string' && img.trim() !== '');
                  const validImages = rawImgs.length > 0 ? rawImgs : (prod.image && typeof prod.image === 'string' && prod.image.trim() !== '' ? [prod.image.trim()] : []);
                  const principalImg = validImages[prod.primaryImageIndex ?? 0] || validImages[0] || '';
                  const hasImage = !!principalImg;
                  
                  const views = getProductViews(prod);
                  const isTrending = trendingProductIds.has(prod.id);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => selectProduct(prod)}
                        className={`bg-white rounded-xl border border-stone-250/70 p-3.5 hover:border-stone-500 hover:shadow-sm transition-all flex flex-col justify-between group cursor-pointer ${
                          project.design.layoutGrid === 'list' ? 'flex-row gap-5 items-center' : ''
                        }`}
                      >
                        {/* Top image layout */}
                        <div className={`${project.design.layoutGrid === 'list' ? 'w-24 h-24' : 'w-full aspect-square'} rounded-lg bg-stone-50 overflow-hidden relative border border-stone-100/50 flex-shrink-0`}>
                          {hasImage ? (
                            <ProductImageWithLoader 
                              src={principalImg} 
                              alt={prod.name} 
                              priority={idx < 6}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-250">
                               <SlidersHorizontal className="w-6 h-6 stroke-1 mb-1" />
                               <span className="text-xs font-semibold text-stone-400">Sin foto</span>
                            </div>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(prod.id); }}
                            className={`absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full border transition-all cursor-pointer shadow-sm z-10 ${
                              isFavorite 
                                ? 'bg-red-50 border-red-200 text-red-500 hover:scale-105' 
                                : 'bg-white/80 border-transparent hover:bg-white text-stone-400 hover:text-red-500 hover:scale-105'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        {/* text contents info */}
                        <div className="mt-3 flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-stone-850 truncate text-sm group-hover:text-amber-800 transition-colors" title={prod.name}>
                                {prod.name}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {getProductCategories(prod).map((cat, idx) => (
                                <span key={idx} className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider bg-stone-100 px-1.5 py-0.5 rounded">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Specification strip with visible price tag and view count */}
                          <div className="mt-3 pt-2 border-t border-stone-100/80 flex items-center justify-between text-stone-600 gap-2">
                            {prod.price && prod.price > 0 ? (
                              <span className="text-xs font-bold text-stone-900 font-sans tracking-tight">
                                ${prod.price} <span className="text-[10px] font-semibold text-stone-500">{prod.currency || 'USD'}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-400 font-medium">Consultar</span>
                            )}

                            <span className="text-xs font-sans font-medium flex items-center flex-shrink-0">
                              {isTrending ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">
                                  🔥 {views}
                                </span>
                              ) : (
                                <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                                  👁️ {views}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

          </div>
        </>
      ) : (
        /* PRODUCT INTEGRATED DETAIL VIEW (FRAME) */
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 font-sans">
          
          {/* Details wrapper styled as a premium frame inside the main page layout */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-stone-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-150">
                <div className="w-full aspect-square relative overflow-hidden bg-stone-100 rounded-xl border border-stone-200/40">
                  {activeModalImage ? (
                    <ProductImageWithLoader
                      key={activeModalImage}
                      src={activeModalImage}
                      alt={selectedProduct.name}
                      className="absolute inset-0 w-full h-full p-2 transition-all duration-200"
                      objectFit="contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SlidersHorizontal className="w-12 h-12 text-stone-300 stroke-1" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {(() => {
                  const rawImgs = (Array.isArray(selectedProduct.images) ? selectedProduct.images : []).filter(img => img && typeof img === 'string' && img.trim() !== '');
                  const validImages = rawImgs.length > 0 ? rawImgs : (selectedProduct.image && typeof selectedProduct.image === 'string' && selectedProduct.image.trim() !== '' ? [selectedProduct.image.trim()] : []);
                  if (validImages.length <= 1) return null;
                  return (
                    <div className="mt-5 w-full">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 text-center">Fotos de Muestra</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {validImages.map((img, idx) => {
                          const isActive = img === activeModalImage;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModalImage(img);
                              }}
                              onMouseEnter={() => setActiveModalImage(img)}
                              className={`w-12 h-12 rounded-lg overflow-hidden border-2 bg-white transition-all cursor-pointer ${
                                isActive ? 'border-amber-700 scale-105 shadow-xs' : 'border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              <ProductImageWithLoader src={img} alt={`Vista ${idx + 1}`} className="w-full h-full" referrerPolicy="no-referrer" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-stone-950 tracking-tight leading-tight">{selectedProduct.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getProductCategories(selectedProduct).map((cat, idx) => (
                      <span key={idx} className="text-xs text-stone-600 font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  {getProductTags(selectedProduct).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getProductTags(selectedProduct).map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 w-full mt-4">
                    {isSelectedProductTrending ? (
                      <div
                        className="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap bg-amber-50 border-amber-200 text-amber-700 shadow-2xs select-none"
                        title="¡Este producto es tendencia en su categoría!"
                      >
                        <span>🔥 {getProductViews(selectedProduct)} {getProductViews(selectedProduct) === 1 ? 'vista' : 'vistas'}</span>
                      </div>
                    ) : (
                      <div
                        className="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap bg-stone-50 border-stone-200 text-stone-700 select-none"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>{getProductViews(selectedProduct)} {getProductViews(selectedProduct) === 1 ? 'vista' : 'vistas'}</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={`w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        validFavorites.includes(selectedProduct.id)
                          ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                          : 'bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${validFavorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-amber-800'}`} />
                      <span>{validFavorites.includes(selectedProduct.id) ? 'Favorito' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={() => handleProductShare(selectedProduct)}
                      disabled={isGeneratingScreenshot}
                      className="w-full flex items-center justify-center gap-1 px-1 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer bg-amber-50 border-amber-100 text-amber-800 hover:bg-amber-100 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Share2 className={`w-3 h-3 ${isGeneratingScreenshot ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingScreenshot ? 'Capturando...' : copiedProduct ? '¡Copiado!' : 'Compartir'}</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-2.5 text-xs text-stone-600 font-sans">
                    {selectedProduct.description && selectedProduct.description.trim() !== '' && (
                      <p className="leading-relaxed italic">{selectedProduct.description}</p>
                    )}
                    {selectedProduct.dimensions && selectedProduct.dimensions.trim() !== '' && (
                      <p>📐 <strong>Medidas:</strong> {selectedProduct.dimensions}</p>
                    )}
                    {selectedProduct.material && selectedProduct.material.trim() !== '' && (
                      <p>🪵 <strong>Materiales:</strong> {selectedProduct.material}</p>
                    )}
                    {selectedProduct.moq && selectedProduct.moq > 1 && (
                      <p>📦 <strong>Mínimo de Compra (MOQ):</strong> {selectedProduct.moq} unidades</p>
                    )}
                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                      <p>🎨 <strong>Colores:</strong> {selectedProduct.colors.join(', ')}</p>
                    )}
                  </div>
                  
                  {selectedProduct.price && selectedProduct.price > 0 ? (
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-semibold text-stone-400 font-sans">Precio FOB</span>
                        <p className="text-base font-extrabold text-stone-900 font-sans">
                          {selectedProduct.price} {selectedProduct.currency || ''}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {project.contact?.phone && typeof project.contact.phone === 'string' && project.contact.phone.trim() !== '' && (
                  <button
                    onClick={() => handleConsultProduct(selectedProduct)}
                    disabled={isConsulting}
                    className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01] duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.805-9.795.001-2.618-1.019-5.078-2.873-6.932C16.35 2.023 13.895.998 11.28.997 5.875.997 1.474 5.394 1.472 10.796c0 1.512.411 2.99 1.192 4.282l-.426 1.558 1.606-.421 1.62.949-.001-.001zM18.106 14.7c-.33-.165-1.951-.963-2.251-1.072-.3-.109-.518-.165-.736.165-.218.33-.844 1.072-1.035 1.291-.19.218-.382.245-.712.08-1.18-.59-1.977-1.08-2.761-2.422-.206-.352-.02-.54.152-.712.155-.155.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.736-1.774-1.008-2.43-.266-.643-.538-.553-.736-.563-.19-.01-.408-.012-.626-.012-.218 0-.573.082-.873.413-.3.33-1.145 1.118-1.145 2.724 0 1.605 1.169 3.159 1.329 3.378.16.218 2.3 3.511 5.572 4.92.778.335 1.386.535 1.86.686.782.249 1.493.214 2.055.13.628-.094 1.951-.798 2.224-1.57.273-.772.273-1.43.191-1.57-.082-.14-.3-.218-.63-.383z"/>
                    </svg>
                    <span>{isConsulting ? 'Cargando...' : 'Consultar por WhatsApp'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            {(() => {
              const related = getRelatedProducts(selectedProduct, project.products, 3);
              if (related.length === 0) return null;
              return (
                <div className="px-6 md:px-8 pb-6 border-t border-stone-100 bg-stone-50/50">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 mt-4">Productos Relacionados</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {related.map(p => {
                      const principalImg = p.images[p.primaryImageIndex ?? 0] || p.images[0];
                      const hasImg = !!principalImg;
                      const displayCat = getProductCategories(p).join(', ') || p.category;
                      return (
                        <div
                          key={p.id}
                          onClick={() => selectProduct(p)}
                          className="bg-white border border-stone-200/60 rounded-lg p-2.5 flex flex-col justify-between hover:border-stone-400 cursor-pointer group transition-all hover:shadow-xs"
                        >
                          <div className="aspect-square w-full bg-stone-50 rounded overflow-hidden flex items-center justify-center border border-stone-100 mb-2 flex-shrink-0">
                            {hasImg ? (
                              <ProductImageWithLoader src={principalImg} alt={p.name} className="max-w-full max-h-full group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xs text-stone-300 font-semibold">Sin foto</span>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h5 className="text-xs font-bold text-stone-850 truncate group-hover:text-amber-800 transition-colors" title={p.name}>
                              {p.name}
                            </h5>
                            <p className="text-[10px] text-stone-400 uppercase font-semibold truncate" title={displayCat}>{displayCat}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* FOOTER text design info */}
      {!selectedProduct && (
        <footer className="bg-[#fafaf9] border-t border-stone-200/60 py-6 px-6 text-center text-xs text-stone-400 mt-4 pb-6">
          {project.contact.company && project.contact.company.trim() !== '' && (
            <p className="font-serif italic font-bold text-stone-700" style={{ color: project.design.primaryColor }}>{project.contact.company}</p>
          )}
          {project.design.footerText && project.design.footerText.trim() !== '' && (
            <p className="max-w-md mx-auto mt-1 leading-relaxed text-stone-500">{project.design.footerText}</p>
          )}
        </footer>
      )}

      {/* Hidden offscreen card for high-resolution sharing screenshots */}
      {selectedProduct && (
        <div 
          id={`capture-card-${selectedProduct.id}`}
          className="fixed left-[-9999px] top-0 bg-white p-8 rounded-2xl shadow-xl border border-stone-200"
          style={{ width: '560px', fontFamily: 'Inter, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                {project.name || 'Catálogo de Productos'}
              </h2>
              <p className="text-xs text-stone-400 font-medium mt-0.5 uppercase tracking-wider">
                {project.contact?.company || 'Catálogo Digital'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                ✨ PRODUCTO DESTACADO
              </span>
            </div>
          </div>

          {/* Images Section */}
          {(() => {
            const validImages = (selectedProduct.images || []).filter(img => img && img.trim() !== '');
            if (validImages.length === 0) {
              return (
                <div className="w-full h-64 bg-stone-50 border border-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-400 mb-6">
                  <SlidersHorizontal className="w-8 h-8 text-stone-300 mb-2 stroke-1" />
                  <span className="text-xs font-semibold">Sin imagen disponible</span>
                </div>
              );
            }

            if (validImages.length === 1) {
              return (
                <div className="w-full aspect-[4/3] overflow-hidden bg-stone-50 border border-stone-100 rounded-xl mb-6 flex items-center justify-center">
                  <img 
                    src={validImages[0]} 
                    alt={selectedProduct.name} 
                    className="max-w-full max-h-full object-contain"
                    crossOrigin="anonymous" 
                  />
                </div>
              );
            }

            // Multiple images: Main image and thumbnail row below
            return (
              <div className="mb-6 space-y-3">
                <div className="w-full aspect-[4/3] overflow-hidden bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-center">
                  <img 
                    src={validImages[selectedProduct.primaryImageIndex ?? 0] || validImages[0]} 
                    alt={selectedProduct.name} 
                    className="max-w-full max-h-full object-contain"
                    crossOrigin="anonymous" 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {validImages.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square bg-stone-50 border border-stone-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={img} 
                        alt={`Vista ${i + 1}`} 
                        className="max-w-full max-h-full object-cover"
                        crossOrigin="anonymous" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight leading-tight">
                {selectedProduct.name}
              </h1>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mt-1">
                {selectedProduct.category}
              </p>
            </div>

            {selectedProduct.description && selectedProduct.description.trim() !== '' && (
              <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-stone-200 pl-3">
                {selectedProduct.description}
              </p>
            )}

            {/* Specifications Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs text-stone-600 font-sans">
              {selectedProduct.dimensions && selectedProduct.dimensions.trim() !== '' && (
                <div>📐 <strong>Medidas:</strong> {selectedProduct.dimensions}</div>
              )}
              {selectedProduct.material && selectedProduct.material.trim() !== '' && (
                <div>🪵 <strong>Materiales:</strong> {selectedProduct.material}</div>
              )}
              {selectedProduct.moq && selectedProduct.moq > 1 && (
                <div>📦 <strong>Mínimo (MOQ):</strong> {selectedProduct.moq} u.</div>
              )}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div>🎨 <strong>Colores:</strong> {selectedProduct.colors.join(', ')}</div>
              )}
              {/* Add price if it exists */}
              {selectedProduct.price && selectedProduct.price > 0 && (
                <div className="col-span-2 pt-2 mt-1 border-t border-stone-200/60 flex items-center justify-between text-stone-900 font-sans">
                  <span className="font-semibold text-stone-500">Precio FOB:</span>
                  <span className="text-sm font-extrabold text-stone-950">
                    {selectedProduct.price} {selectedProduct.currency || ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer & QR / Link */}
          <div className="border-t border-stone-150 pt-5 mt-6 flex items-center justify-between text-stone-400 text-[10px]">
            <div>
              <p className="font-semibold text-stone-600">Para consultas o pedidos:</p>
              {project.contact?.phone && (
                <p className="mt-0.5 text-stone-500 font-medium">WhatsApp: {project.contact.phone}</p>
              )}
              {project.contact?.email && (
                <p className="text-stone-500 font-medium font-sans">Email: {project.contact.email}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-amber-700 font-sans">Ver producto completo en:</p>
              <p className="mt-0.5 text-stone-500 font-mono select-all">
                {project.design.shareUrl || window.location.origin + window.location.pathname}?p={selectedProduct.id}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROMOTION DETAIL MODAL */}
      {selectedPromo && (
        <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeActiveModal}
              className="absolute top-4 right-4 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              {selectedPromo.image && (
                <div className="bg-stone-50 w-full flex items-center justify-center border-b border-stone-100 p-4">
                  <img src={selectedPromo.image} alt={selectedPromo.title} className="max-w-full max-h-[300px] object-contain rounded-lg" />
                </div>
              )}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-base md:text-lg font-bold text-stone-900">{selectedPromo.title}</h3>
                    {selectedPromo.badge && (
                      <span 
                        className="text-xs text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: project.design.primaryColor }}
                      >
                        {selectedPromo.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600 font-sans text-xs leading-relaxed whitespace-pre-line mt-2">{selectedPromo.content}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT OPTIONS MENU OVERLAY (Android style popover) */}
      {showConfigMenu && (
        <>
          {/* Click-away backdrop overlay to close menu on outside tap */}
          <div 
            className="fixed inset-0 z-[95]" 
            onClick={closeActiveModal} 
          />
          
          <div className="fixed bottom-20 right-6 z-[100] w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden py-1 animate-in fade-in slide-in-from-bottom-4 duration-200 divide-y divide-stone-100 font-sans">
            <div className="px-4 py-2.5 bg-stone-50/80 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 tracking-wide">Menú de Opciones</span>
              <button 
                onClick={closeActiveModal}
                className="text-stone-400 hover:text-stone-600 transition-colors p-0.5 rounded-full hover:bg-stone-100 cursor-pointer flex items-center justify-center"
                title="Cerrar menú"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="py-1">
              {(project.menuOptions || DEFAULT_MENU_OPTIONS)
                .filter(opt => opt.visible && opt.id !== 'company')
                .map(opt => {
                  const IconComp = MENU_ICONS[opt.iconName] || HelpCircle;
                  
                  if (opt.id === 'favorites') {
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          navigateToHash('#favorites');
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100/50">
                          <IconComp className="w-3.5 h-3.5 fill-red-500" />
                        </div>
                        <div className="flex-grow flex items-center justify-between min-w-0">
                          <span className="text-xs font-semibold truncate text-stone-850">{opt.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-100 text-red-700 font-bold border border-red-200">
                            {validFavorites.length}
                          </span>
                        </div>
                      </button>
                    );
                  }

                  if (opt.id === 'share') {
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          closeActiveModal();
                          handleShare(opt.content);
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-100/50">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                      </button>
                    );
                  }

                  if (opt.id === 'whatsapp') {
                    if (!project.contact?.phone) return null;
                    const waText = opt.content ? `?text=${encodeURIComponent(opt.content)}` : '';
                    return (
                      <a
                        key={opt.id}
                        href={`https://wa.me/${project.contact.phone.replace(/[+\s-]/g, '')}${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeActiveModal}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group no-underline"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                      </a>
                    );
                  }

                  if (opt.id === 'company') {
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          navigateToHash('#company');
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                      </button>
                    );
                  }

                  if (opt.id === 'about') {
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          navigateToHash('#about');
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100/50">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                      </button>
                    );
                  }

                  if (opt.id === 'how_it_works') {
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          navigateToHash('#how-it-works');
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/50">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => setShowConfigMenu(false)}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-left transition-all active:bg-stone-100 cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 border border-stone-200/50">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-stone-850 truncate">{opt.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* INDEPENDENT SCREEN: ❤️ FAVORITOS */}
      {showFavoritesScreen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[85vh] flex flex-col font-sans">
            <div className="p-5 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                Productos Favoritos
              </h3>
              <button
                onClick={closeActiveModal}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow space-y-4">
              {favOpt?.content && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed italic mb-1">
                  {favOpt.content}
                </div>
              )}
              {validFavorites.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <span className="text-4xl">❤️</span>
                  <p className="text-sm font-semibold text-stone-700">No tienes productos guardados aún</p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                    Presione el ícono de corazón en los productos para agregarlos a sus favoritos de exhibición e iniciar una colección personalizada.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.products
                    .filter(p => validFavorites.includes(p.id))
                    .map(prod => {
                      const rawImgs = (Array.isArray(prod.images) ? prod.images : []).filter(img => img && typeof img === 'string' && img.trim() !== '');
                      const validImages = rawImgs.length > 0 ? rawImgs : (prod.image && typeof prod.image === 'string' && prod.image.trim() !== '' ? [prod.image.trim()] : []);
                      const displayImg = validImages[prod.primaryImageIndex ?? 0] || validImages[0];
                      return (
                        <div 
                          key={prod.id} 
                          onClick={() => {
                            selectProduct(prod);
                          }}
                          className="flex gap-3 bg-stone-50 hover:bg-stone-100/70 p-2.5 rounded-xl border border-stone-200/60 transition-all cursor-pointer group"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/50 flex-shrink-0 relative">
                            {displayImg ? (
                              <img 
                                src={displayImg} 
                                alt={prod.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-stone-200/60 text-stone-400 text-[10px]">Sin foto</div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-stone-850 truncate group-hover:text-amber-950 transition-colors">{prod.name}</h4>
                              <p className="text-[10px] text-stone-450 uppercase tracking-wider font-semibold mt-0.5">{prod.category}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              {prod.price && prod.price > 0 ? (
                                <span className="text-xs font-black text-[#1c1917] font-mono">
                                  ${prod.price.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">Consultar</span>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(prod.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                title="Eliminar de favoritos"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
              <button
                onClick={closeActiveModal}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDEPENDENT SCREEN: 🏢 INFORMACIÓN DE LA EMPRESA */}
      {showCompanyScreen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[85vh] flex flex-col font-sans">
            <div className="p-5 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <Building className="w-5 h-5 text-stone-700" />
                Información de la Empresa
              </h3>
              <button
                onClick={closeActiveModal}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow space-y-4">
              {hasContactInfo ? (
                <div className="space-y-4">
                  {project.contact.company && (
                    <div className="text-center py-4 border-b border-stone-100">
                      <span className="text-3xl block mb-2">🏢</span>
                      <h4 className="text-lg font-bold text-stone-900 font-serif">{project.contact.company}</h4>
                    </div>
                  )}

                  {companyOpt?.content && (
                    <p className="text-xs text-stone-600 text-center leading-relaxed italic bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      {companyOpt.content}
                    </p>
                  )}
                  
                  <div className="space-y-3 text-xs">
                    {project.contact.name && (
                      <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                        <span className="text-base">👨‍💼</span>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Atención / Contacto</span>
                          <span className="font-semibold text-stone-850 mt-0.5 block">{project.contact.name}</span>
                        </div>
                      </div>
                    )}

                    {project.contact.phone && (
                      <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                        <span className="text-base">📞</span>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Teléfono / WhatsApp</span>
                          <a 
                            href={`https://wa.me/${project.contact.phone.replace(/[+\s-]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-[#059669] hover:underline mt-0.5 block"
                          >
                            {project.contact.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {project.contact.email && (
                      <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                        <span className="text-base">✉️</span>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Correo Electrónico</span>
                          <a 
                            href={`mailto:${project.contact.email}`} 
                            className="font-semibold text-stone-750 hover:underline mt-0.5 block"
                          >
                            {project.contact.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {project.contact.website && (
                      <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                        <span className="text-base">🌐</span>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sitio Web</span>
                          <a 
                            href={project.contact.website.startsWith('http') ? project.contact.website : `https://${project.contact.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-stone-750 hover:underline mt-0.5 block"
                          >
                            {project.contact.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {project.contact.address && (
                      <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/50">
                        <span className="text-base">📍</span>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">Dirección Física</span>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.contact.address)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-stone-750 hover:underline mt-0.5 block leading-relaxed cursor-pointer"
                            title="Ver en Google Maps"
                          >
                            {project.contact.address}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-2">
                  <span className="text-3xl">🏢</span>
                  <p className="text-sm font-semibold text-stone-750">No hay información de la empresa configurada</p>
                  <p className="text-xs text-stone-400 leading-relaxed">El administrador puede añadir esta información desde la sección de datos de contacto.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
              <button
                onClick={closeActiveModal}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDEPENDENT SCREEN: ℹ️ INFORMACIÓN DEL CATÁLOGO */}
      {showAboutScreen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[85vh] flex flex-col font-sans">
            <div className="p-5 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <Info className="w-5 h-5 text-stone-700" />
                Información del Catálogo
              </h3>
              <button
                onClick={closeActiveModal}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm border border-amber-100 animate-pulse">
                  🪵
                </div>
                <h4 className="text-lg font-extrabold text-stone-900 tracking-tight font-serif">
                  {project.contact.company || 'Nuestro Catálogo'}
                </h4>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">Exhibición de Artículos</p>
              </div>

              <div className="space-y-4 text-sm text-stone-700 leading-relaxed font-sans text-center px-2 max-w-sm mx-auto">
                {(aboutOpt?.content || project.description || 'Catálogo de exhibición de artículos variados en madera y corte láser. Fotos reales. Pregunta sin compromiso. El detalle perfecto, natural y moderno.\n\nHay regalos que marcan para siempre. Deja tu Huella.')
                  .split('\n')
                  .filter((para: string) => para.trim() !== '')
                  .map((para: string, idx: number) => (
                    <p key={idx} className="text-stone-700 whitespace-pre-line font-medium leading-relaxed">
                      {para}
                    </p>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
              <button
                onClick={closeActiveModal}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDEPENDENT SCREEN: ❓ CÓMO FUNCIONA */}
      {showHowItWorksScreen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[85vh] flex flex-col font-sans">
            <div className="p-5 border-b border-stone-150 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-700" />
                ¿Cómo funciona?
              </h3>
              <button
                onClick={closeActiveModal}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-5">
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/70">
                <h4 className="text-sm font-bold text-stone-900 font-serif mb-1">¿Cómo usar este catálogo?</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sigue estos sencillos pasos para sacarle el máximo provecho a nuestra plataforma de exhibición digital:
                </p>
              </div>

              <div className="space-y-4">
                {((howItWorksOpt?.steps && howItWorksOpt.steps.length > 0) ? howItWorksOpt.steps : [
                  { title: 'Explora sin compromiso', desc: 'Este es un catálogo 100% de exhibición.' },
                  { title: 'Contacta si te gusta', desc: '¿Viste algo que te encantó? Puedes contactarnos y pedir más detalles.' },
                  { title: 'Encuentra lo que buscas', desc: 'Usa el buscador por nombre, categoría o material para ir directo al grano.' },
                  { title: 'Guarda tus favoritos', desc: 'Haz clic en el corazón ❤️ para marcar tus piezas preferidas y encontrarlas fácilmente después.' },
                  { title: 'Comparte con quien quieras', desc: '¿Tienes un amigo al que le encantaría esto? Compártelo directamente por WhatsApp con un solo toque.' },
                  { title: 'Descubre más', desc: 'Al ver un producto, te mostraremos recomendaciones similares que quizás también te interesen.' }
                ]).map((step: { title?: string; desc?: string }, idx: number) => {
                  if (!step.title && !step.desc) return null; // skip empty steps
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="w-6 h-6 shrink-0 bg-stone-100 text-stone-800 text-xs font-bold rounded-full flex items-center justify-center border border-stone-200">{idx + 1}</span>
                      <div>
                        <h5 className="text-xs font-bold text-stone-900">{step.title}</h5>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-150 flex justify-end">
              <button
                onClick={closeActiveModal}
                className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BACK BUTTON (Visible only when a product is selected) */}
      {selectedProduct && (
        <button
          onClick={handleBack}
          className="fixed top-6 left-4 sm:left-6 z-[90] p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center w-12 h-12 border border-stone-800"
          title="Regresar al Catálogo"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[110] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-stone-200 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <HelpCircle className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base mb-2">¿Desea salir del catálogo?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Seleccione ACEPTAR si realmente desea salir del catálogo o CANCELAR para regresar
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 px-4 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: project.design.primaryColor || '#1c1917' }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED VERTICAL FLOATING BUTTONS COLUMN (Bottom-to-top) */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col-reverse gap-3 items-center">
        {/* 1. 📋 Opciones (Siempre visible - abre el menú de opciones compacto) */}
        <button
          onClick={() => {
            if (window.location.hash === '#menu') {
              closeActiveModal();
            } else {
              navigateToHash('#menu');
            }
          }}
          className="p-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center w-12 h-12 border border-stone-800"
          title="Opciones"
        >
          <Menu className={`w-5 h-5 transition-transform duration-300 ${showConfigMenu ? 'rotate-90 text-amber-500' : ''}`} />
        </button>

        {/* 3. ⬆️ Regresar arriba (Visible solo al desplazar hacia abajo) */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-full shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center w-12 h-12"
            title="Volver arriba"
          >
            <ArrowUp className="w-5 h-5 animate-bounce" />
          </button>
        )}
      </div>
    </div>
  );
}
