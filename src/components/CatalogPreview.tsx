import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CatalogProject, CatalogProduct, CustomBlock } from '../types';
import {
  Search,
  Heart,
  Share2,
  Phone,
  Building,
  Info,
  HelpCircle,
  Menu,
  X,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  LogOut,
  ArrowUpDown,
  Clock,
  ArrowDownAZ,
  ArrowUpZA,
  Flame,
  LayoutGrid,
  ArrowUp,
  FolderOpen,
  PackageOpen,
  Sun,
  Moon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ShoppingBag,
  Package,
  Tag,
  MessageCircle,
  Star,
  Globe,
  Mail,
  MapPin
} from 'lucide-react';
import {
  fetchAllProductViewsParallel,
  incrementProductViews,
  flushPendingHits
} from '../lib/counterService';
import { sortProductsNewestFirst } from '../lib/productUtils';
import { sortPromosNewestFirst } from '../lib/promoUtils';
import { ExitConfirmModal } from './ExitConfirmModal';

interface CatalogPreviewProps {
  project: CatalogProject;
  customBlocks?: CustomBlock[];
  onOpenAdmin?: () => void;
}

export function CatalogPreview({ project, customBlocks = [], onOpenAdmin }: CatalogPreviewProps) {
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<CustomBlock | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<string[]>(project.favorites || []);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openedFromMenu, setOpenedFromMenu] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<'company' | 'about' | 'how_it_works' | null>(null);
  const [productViews, setProductViews] = useState<Record<string, number>>({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cat_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('cat_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Precargar todas las imágenes del producto al abrir la vista detallada
  useEffect(() => {
    if (!selectedProduct || !selectedProduct.images) return;
    selectedProduct.images.forEach((src) => {
      if (src) {
        const preloadImg = new Image();
        preloadImg.decoding = 'async';
        preloadImg.src = src;
      }
    });
  }, [selectedProduct]);

  const [sortOption, setSortOption] = useState<
    'default' | 'az' | 'za' | 'price_asc' | 'price_desc' | 'popular'
  >('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // AJUSTE 1: Vista por defecto SIEMPRE en 2 columnas al abrir
  const [activeGrid, setActiveGrid] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [isGridOpen, setIsGridOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageZoomOpen) {
          setIsImageZoomOpen(false);
          return;
        }
        if (selectedProduct) {
          setSelectedProduct(null);
          return;
        }
        if (selectedPromo) {
          setSelectedPromo(null);
          return;
        }
        if (activeInfoModal) {
          setActiveInfoModal(null);
          if (openedFromMenu) {
            setIsMenuOpen(true);
          }
          return;
        }
        if (isMenuOpen) {
          setIsMenuOpen(false);
          return;
        }
        if (showOnlyFavorites) {
          setShowOnlyFavorites(false);
          if (openedFromMenu) {
            setIsMenuOpen(true);
          }
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageZoomOpen, selectedProduct, selectedPromo, activeInfoModal, isMenuOpen, showOnlyFavorites]);

  // Pila de navegación (navStack) y reserva de historial en gestos de usuario para el botón físico "Atrás" de Android
  const navStackRef = useRef<string[]>([]);
  const historyGuardCountRef = useRef<number>(0);
  const historySeqRef = useRef<number>(0);

  const pushHistoryEntry = () => {
    try {
      historySeqRef.current += 1;
      window.history.pushState({ catalogNav: 'guard', seq: historySeqRef.current }, '');
      historyGuardCountRef.current += 1;
    } catch (e) {}
  };

  const ensureHistoryGuard = (minDepth = 6) => {
    const target = Math.max(minDepth, navStackRef.current.length + 4);
    while (historyGuardCountRef.current < target) {
      pushHistoryEntry();
    }
  };

  const removeNavView = (viewId: string) => {
    navStackRef.current = navStackRef.current.filter((v) => v !== viewId);
  };

  const pushNavView = (viewId: string) => {
    const alreadyInStack = navStackRef.current.includes(viewId);
    removeNavView(viewId);
    navStackRef.current.push(viewId);
    ensureHistoryGuard(navStackRef.current.length + 4);
    if (!alreadyInStack) {
      pushHistoryEntry();
    }
  };

  useEffect(() => {
    if (showOnlyFavorites) pushNavView('favorites');
    else removeNavView('favorites');
  }, [showOnlyFavorites]);

  useEffect(() => {
    if (searchTerm && searchTerm.trim().length > 0) pushNavView('search');
    else removeNavView('search');
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'TODOS') pushNavView('category');
    else removeNavView('category');
  }, [selectedCategory]);

  useEffect(() => {
    if (sortOption !== 'default') pushNavView('sort');
    else removeNavView('sort');
  }, [sortOption]);

  useEffect(() => {
    if (selectedProduct) pushNavView('detail');
    else removeNavView('detail');
  }, [selectedProduct]);

  useEffect(() => {
    if (isImageZoomOpen) pushNavView('zoom');
    else removeNavView('zoom');
  }, [isImageZoomOpen]);

  useEffect(() => {
    if (selectedPromo) pushNavView('promo');
    else removeNavView('promo');
  }, [selectedPromo]);

  useEffect(() => {
    if (activeInfoModal) pushNavView('info');
    else removeNavView('info');
  }, [activeInfoModal]);

  useEffect(() => {
    if (isMenuOpen) pushNavView('menu');
    else removeNavView('menu');
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSortOpen || isGridOpen) pushNavView('dropdown');
    else removeNavView('dropdown');
  }, [isSortOpen, isGridOpen]);

  useEffect(() => {
    if (showExitModal) pushNavView('exit');
    else removeNavView('exit');
  }, [showExitModal]);

  // Bloquear el scroll del fondo (html y body) cuando cualquier modal está abierto
  useEffect(() => {
    const anyModalOpen = Boolean(
      selectedProduct ||
      isImageZoomOpen ||
      isMenuOpen ||
      activeInfoModal ||
      selectedPromo ||
      showExitModal
    );

    if (anyModalOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.classList.add('modal-scroll-locked');
      document.body.classList.add('modal-scroll-locked');
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.classList.remove('modal-scroll-locked');
      document.body.classList.remove('modal-scroll-locked');
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.classList.remove('modal-scroll-locked');
      document.body.classList.remove('modal-scroll-locked');
    };
  }, [selectedProduct, isImageZoomOpen, isMenuOpen, activeInfoModal, selectedPromo, showExitModal]);

  useEffect(() => {
    const events = ['click', 'touchend', 'pointerup', 'keydown'] as const;
    const onUserGesture = () => {
      ensureHistoryGuard(6);
    };
    events.forEach((evt) => document.addEventListener(evt, onUserGesture, { capture: true, passive: true }));
    pushHistoryEntry();
    pushHistoryEntry();
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, onUserGesture, { capture: true }));
    };
  }, []);

  // AJUSTE 3: Manejo del botón físico "Atrás" de Android / Navegación móvil con pila (stack)
  useEffect(() => {
    const handlePopState = () => {
      if (historyGuardCountRef.current > 0) {
        historyGuardCountRef.current -= 1;
      }
      if (historyGuardCountRef.current < 2) {
        pushHistoryEntry();
      }

      // 1. Si está en el zoom, cierra el zoom y vuelve al detalle (SIN preguntar)
      if (isImageZoomOpen) {
        setIsImageZoomOpen(false);
        return;
      }
      // 2. Si el modal de confirmación de salida ya está abierto, lo cierra y permanece en el catálogo
      if (showExitModal) {
        setShowExitModal(false);
        return;
      }
      // 3. Si está en la vista detallada, cierra la vista detallada y vuelve al catálogo (SIN preguntar)
      if (selectedProduct) {
        setSelectedProduct(null);
        return;
      }
      // 4. Si está en una promoción, cierra la promoción (SIN preguntar)
      if (selectedPromo) {
        setSelectedPromo(null);
        return;
      }
      // 5. Si está en un modal de información o ayuda (sub-vista), lo cierra y regresa a la pantalla principal (NO al menú de opciones)
      if (activeInfoModal) {
        setActiveInfoModal(null);
        setOpenedFromMenu(false);
        return;
      }
      // 6. Si el menú hamburguesa está abierto, lo cierra (SIN preguntar)
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return;
      }
      // 7. Si el menú de ordenamiento o cuadrícula está abierto, lo cierra (SIN preguntar)
      if (isSortOpen || isGridOpen) {
        setIsSortOpen(false);
        setIsGridOpen(false);
        return;
      }

      // 8. Desapilar estados del catálogo en orden LIFO (favoritos, búsqueda, categoría, filtro)
      while (navStackRef.current.length > 0) {
        const lastView = navStackRef.current.pop();
        if (lastView === 'favorites' && showOnlyFavorites) {
          setShowOnlyFavorites(false);
          setOpenedFromMenu(false);
          return;
        }
        if (lastView === 'search' && searchTerm) {
          setSearchTerm('');
          return;
        }
        if (lastView === 'category' && selectedCategory !== 'TODOS') {
          setSelectedCategory('TODOS');
          return;
        }
        if (lastView === 'sort' && sortOption !== 'default') {
          setSortOption('default');
          return;
        }
      }

      // 9. Respaldo por si algún estado secundario sigue activo
      if (showOnlyFavorites) {
        setShowOnlyFavorites(false);
        setOpenedFromMenu(false);
        return;
      }
      if (searchTerm) {
        setSearchTerm('');
        return;
      }
      if (selectedCategory !== 'TODOS') {
        setSelectedCategory('TODOS');
        return;
      }
      if (sortOption !== 'default') {
        setSortOption('default');
        return;
      }

      // 10. Si está en la pantalla principal del catálogo, pregunta si desea salir
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isImageZoomOpen,
    selectedProduct,
    selectedPromo,
    activeInfoModal,
    isMenuOpen,
    isSortOpen,
    isGridOpen,
    showExitModal,
    showOnlyFavorites,
    searchTerm,
    selectedCategory,
    sortOption
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setIsGridOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const gridOptions = [
    {
      id: '1x1' as const,
      label: '1 Columna (Grande)',
      icon: (
        <svg
          className="w-4 h-4 text-stone-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
        </svg>
      )
    },
    {
      id: '2x2' as const,
      label: '2 Columnas (Estándar)',
      icon: (
        <svg
          className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="8" height="18" rx="1.5" />
          <rect x="13" y="3" width="8" height="18" rx="1.5" />
        </svg>
      )
    },
    {
      id: '3x3' as const,
      label: '3 Columnas (Compacto)',
      icon: (
        <svg
          className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="5" height="18" rx="1" />
          <rect x="9.5" y="3" width="5" height="18" rx="1" />
          <rect x="16" y="3" width="5" height="18" rx="1" />
        </svg>
      )
    }
  ];

  const sortOptions = [
    {
      id: 'default' as const,
      label: 'Orden por defecto (Más recientes)',
      icon: <Clock className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" />
    },
    {
      id: 'az' as const,
      label: 'De la A a la Z',
      icon: <ArrowDownAZ className="w-4 h-4 text-indigo-500 shrink-0" />
    },
    {
      id: 'za' as const,
      label: 'De la Z a la A',
      icon: <ArrowUpZA className="w-4 h-4 text-purple-500 shrink-0" />
    },
    {
      id: 'price_asc' as const,
      label: 'Precio: de Menor a Mayor',
      icon: (
        <svg
          className="w-4 h-4 text-emerald-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 18V6" />
          <path d="m4 10 4-4 4 4" />
          <path d="M17 9a2 2 0 0 0-2-2h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2" />
          <path d="M16 5v14" />
        </svg>
      )
    },
    {
      id: 'price_desc' as const,
      label: 'Precio: de Mayor a Menor',
      icon: (
        <svg
          className="w-4 h-4 text-amber-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 6v12" />
          <path d="m4 14 4 4 4-4" />
          <path d="M17 9a2 2 0 0 0-2-2h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2" />
          <path d="M16 5v14" />
        </svg>
      )
    },
    {
      id: 'popular' as const,
      label: 'Más Vistos (Popularidad)',
      icon: <Flame className="flame-icon-solid w-4 h-4 text-orange-500 fill-orange-500 shrink-0" style={{ color: '#f97316', fill: '#f97316', stroke: '#f97316' }} />
    }
  ];

  const design = project.design;
  const primaryColor = design?.primaryColor || '#8c6d58';
  const secondaryColor = design?.secondaryColor || '#2b3a32';
  const fontFamily = design?.fontFamily || 'serif';
  const subtitle = design?.subtitle?.trim() || '';
  const logoImage = design?.logoImage?.trim() || '';
  const bannerImage = design?.bannerImage?.trim() || '';

  const fontClass =
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // Products sorted
  const sortedProducts = useMemo(() => {
    return sortProductsNewestFirst(project.products || []);
  }, [project.products]);

  const sortedPromos = useMemo(() => {
    return sortPromosNewestFirst(customBlocks);
  }, [customBlocks]);

  const promoSliderRef = useRef<HTMLDivElement>(null);

  // Auto-scroll de promociones cada 5 segundos
  useEffect(() => {
    if (sortedPromos.length <= 1) return;

    const interval = setInterval(() => {
      if (!promoSliderRef.current) return;
      const el = promoSliderRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = el.clientWidth * 0.85;
      if (el.scrollLeft >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sortedPromos.length]);

  // TAREA 1: High-speed Parallel Counter Fetching (Concurrency max 6, no sequential pause)
  const isFetchingRef = useRef(false);

  const updateAllCountersParallel = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const ids = sortedProducts.map((p) => p.id);
      await fetchAllProductViewsParallel(ids, (id, views) => {
        setProductViews((prev) => ({ ...prev, [id]: views }));
      });
      await flushPendingHits();
    } catch (err) {
      console.warn('Counter fetch error:', err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    updateAllCountersParallel();

    // Background sync every 12 seconds
    const interval = setInterval(() => {
      updateAllCountersParallel();
    }, 12000);

    return () => clearInterval(interval);
  }, [sortedProducts]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleProductClick = async (product: CatalogProduct) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setIsImageZoomOpen(false);
    setZoomScale(1);
    setTimeout(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    }, 40);

    // Increment views immediately in UI & API
    setProductViews((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));

    try {
      const newCount = await incrementProductViews(product.id);
      if (newCount !== null) {
        setProductViews((prev) => ({ ...prev, [product.id]: newCount }));
      }
    } catch (e) {
      // offline queue handles this
    }
  };

  // Productos relacionados calculados mediante puntuación ponderada:
  // Puntuación = (0.7 * coincidencia_categoría) + (0.3 * coincidencia_etiquetas)
  // Desempate por popularidad (más vistas primero)
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];

    const normCatA = (selectedProduct.category || '').trim().toLowerCase();
    const tagsA = (selectedProduct.tags || [])
      .map((t) => t.trim().toLowerCase().replace(/^#+/, ''))
      .filter(Boolean);

    const scored = project.products
      .filter((candidate) => candidate.id !== selectedProduct.id)
      .map((candidate) => {
        // Coincidencia de categoría (1 si es la misma categoría, 0 si no)
        const normCatB = (candidate.category || '').trim().toLowerCase();
        const categoryMatch = normCatA && normCatB && normCatA === normCatB ? 1 : 0;

        // Coincidencia de etiquetas (proporción de etiquetas de A en común con candidate)
        const tagsB = (candidate.tags || [])
          .map((t) => t.trim().toLowerCase().replace(/^#+/, ''))
          .filter(Boolean);

        let tagMatch = 0;
        if (tagsA.length > 0) {
          const commonCount = tagsA.filter((t) => tagsB.includes(t)).length;
          tagMatch = commonCount / tagsA.length;
        }

        // Puntuación ponderada: 70% categoría + 30% etiquetas
        const score = 0.7 * categoryMatch + 0.3 * tagMatch;
        const views = productViews[candidate.id] ?? candidate.views ?? 0;

        return {
          product: candidate,
          score,
          views
        };
      })
      // Solo productos con relación (puntuación > 0)
      .filter((item) => item.score > 0);

    // Ordenar de mayor a menor puntuación; en empate, por popularidad (más vistas)
    scored.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.0001) {
        return b.score - a.score;
      }
      return b.views - a.views;
    });

    // Mostrar SOLO los 3 productos con mayor puntuación
    return scored.slice(0, 3).map((item) => item.product);
  }, [selectedProduct, project.products, productViews]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let list = sortedProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.material && p.material.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory;
      const matchesFavorites = !showOnlyFavorites || favorites.includes(p.id);

      return matchesSearch && matchesCategory && matchesFavorites;
    });

    if (sortOption === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (sortOption === 'za') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
    } else if (sortOption === 'price_asc') {
      list = [...list].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortOption === 'price_desc') {
      list = [...list].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortOption === 'popular') {
      list = [...list].sort((a, b) => {
        const countA = productViews[a.id] ?? a.views ?? 0;
        const countB = productViews[b.id] ?? b.views ?? 0;
        return countB - countA;
      });
    }

    return list;
  }, [sortedProducts, searchTerm, selectedCategory, showOnlyFavorites, favorites, sortOption, productViews]);

  // Context-specific empty state message and icon
  const emptyStateInfo = useMemo(() => {
    if (sortedProducts.length === 0) {
      return {
        message: 'El catálogo está vacío',
        icon: 'package' as const,
      };
    }
    if (showOnlyFavorites) {
      return {
        message: 'No se encontraron productos seleccionados como favoritos',
        icon: 'heart' as const,
      };
    }
    const hasSearch = searchTerm.trim().length > 0;
    const hasCategory = selectedCategory !== 'TODOS';

    if (hasSearch && hasCategory) {
      return {
        message: 'No hay productos que coincidan con los filtros aplicados',
        icon: 'filter' as const,
      };
    }
    if (hasSearch) {
      return {
        message: 'No se encontraron productos para tu búsqueda',
        icon: 'search' as const,
      };
    }
    if (hasCategory) {
      return {
        message: 'No hay productos en esta categoría',
        icon: 'category' as const,
      };
    }
    return {
      message: 'No hay productos que coincidan con los filtros aplicados',
      icon: 'filter' as const,
    };
  }, [sortedProducts.length, showOnlyFavorites, searchTerm, selectedCategory]);

  // Highest view count across all products in the catalog
  const maxViews = useMemo(() => {
    let max = 0;
    for (const p of sortedProducts) {
      const v = productViews[p.id] ?? p.views ?? 0;
      if (v > max) max = v;
    }
    return max;
  }, [sortedProducts, productViews]);

  // WhatsApp & Real Image Attachment helpers
  const productFileCacheRef = useRef<Record<string, File>>({});
  const preloadedImagesRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    sortedProducts.forEach((p) => {
      const firstImg = p.images?.[0]?.trim();
      if (firstImg && !preloadedImagesRef.current[firstImg]) {
        const img = new Image();
        if (!firstImg.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        img.decoding = 'async';
        img.src = firstImg;
        preloadedImagesRef.current[firstImg] = img;
      }
    });
  }, [sortedProducts]);

  const getPublicCatalogUrl = () => {
    const href = window.location.href.split('#')[0];
    const lower = href.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return href;
    }
    if (project.contact?.website && project.contact.website.trim().length > 0) {
      const web = project.contact.website.trim();
      if (!web.toLowerCase().startsWith('http://') && !web.toLowerCase().startsWith('https://')) {
        return `https://${web}`;
      }
      return web;
    }
    return '';
  };

  const makeSafeFileName = (name: string, ext: string) => {
    const clean = (name || 'producto')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${clean || 'producto'}${ext}`;
  };

  const dataUrlToFileSync = (dataUrl: string, productName: string): File | null => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUrl.substring(0, commaIdx).toLowerCase();
    const body = dataUrl.substring(commaIdx + 1);
    if (!header.includes(';base64')) return null;

    let mime = 'image/jpeg';
    let ext = '.jpg';
    if (header.startsWith('data:image/png')) {
      mime = 'image/png';
      ext = '.png';
    } else if (header.startsWith('data:image/jpeg') || header.startsWith('data:image/jpg')) {
      mime = 'image/jpeg';
      ext = '.jpg';
    } else {
      return null;
    }

    try {
      const bstr = atob(body);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new File([u8arr], makeSafeFileName(productName, ext), {
        type: mime,
        lastModified: Date.now()
      });
    } catch {
      return null;
    }
  };

  const imageElementToJpegFileSync = (imgEl: HTMLImageElement, productName: string): File | null => {
    if (!imgEl || !imgEl.complete || !imgEl.naturalWidth || !imgEl.naturalHeight) return null;
    try {
      let w = imgEl.naturalWidth || 800;
      let h = imgEl.naturalHeight || 600;
      const maxDim = 1200;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(imgEl, 0, 0, w, h);
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      return dataUrlToFileSync(jpegDataUrl, productName);
    } catch {
      return null;
    }
  };

  const getProductImageFileSync = (product: CatalogProduct): File | null => {
    if (productFileCacheRef.current[product.id]) {
      return productFileCacheRef.current[product.id];
    }
    const primarySrc = product.images?.[0]?.trim();
    if (!primarySrc) return null;

    const directFile = dataUrlToFileSync(primarySrc, product.name);
    if (directFile) {
      productFileCacheRef.current[product.id] = directFile;
      return directFile;
    }

    const cachedImg = preloadedImagesRef.current[primarySrc];
    if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
      const fromCache = imageElementToJpegFileSync(cachedImg, product.name);
      if (fromCache) {
        productFileCacheRef.current[product.id] = fromCache;
        return fromCache;
      }
    }

    const domImgs = document.querySelectorAll('img');
    for (let i = 0; i < domImgs.length; i++) {
      const el = domImgs[i];
      if ((el.getAttribute('src') === primarySrc || el.src === primarySrc) && el.complete && el.naturalWidth > 0) {
        const fromDom = imageElementToJpegFileSync(el, product.name);
        if (fromDom) {
          productFileCacheRef.current[product.id] = fromDom;
          return fromDom;
        }
      }
    }

    return null;
  };

  const getProductImageFileAsync = (product: CatalogProduct): Promise<File | null> => {
    const syncFile = getProductImageFileSync(product);
    if (syncFile) return Promise.resolve(syncFile);

    const primarySrc = product.images?.[0]?.trim();
    if (!primarySrc) return Promise.resolve(null);

    return new Promise((resolve) => {
      const img = new Image();
      if (!primarySrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        preloadedImagesRef.current[primarySrc] = img;
        const file = imageElementToJpegFileSync(img, product.name);
        if (file) {
          productFileCacheRef.current[product.id] = file;
          resolve(file);
          return;
        }
        resolve(null);
      };
      img.onerror = () => {
        fetch(primarySrc)
          .then((r) => r.blob())
          .then((blob) => {
            const ext = blob.type === 'image/png' ? '.png' : '.jpg';
            const mime = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const f = new File([blob], makeSafeFileName(product.name, ext), {
              type: mime,
              lastModified: Date.now()
            });
            productFileCacheRef.current[product.id] = f;
            resolve(f);
          })
          .catch(() => resolve(null));
      };
      img.src = primarySrc;
    });
  };

  const buildProductTextMessage = (templateStr: string, product: CatalogProduct, isConsult: boolean): string => {
    const catalogUrl = getPublicCatalogUrl();
    const priceStr = isConsult
      ? `Precio: $${product.price} ${product.currency || 'USD'}`
      : `$${product.price} ${product.currency || 'USD'}`;

    const lines = (templateStr || '').split('\n');
    const processedLines: string[] = [];

    for (const line of lines) {
      if (line.includes('{imagen}')) continue;
      if (line.includes('{url}') && !catalogUrl) continue;

      const replaced = line
        .split('{nombre}').join(product.name || '')
        .split('{categoria}').join(product.category || 'General')
        .split('{precio}').join(priceStr)
        .split('{descripcion}').join(product.description || '')
        .split('{url}').join(catalogUrl);

      if (replaced.includes('content://') || replaced.includes('file://')) continue;
      processedLines.push(replaced);
    }

    const finalLines: string[] = [];
    let blankCount = 0;
    for (const l of processedLines) {
      if (l.trim() === '') {
        blankCount++;
        if (blankCount <= 1) finalLines.push('');
      } else {
        blankCount = 0;
        finalLines.push(l);
      }
    }
    return finalLines.join('\n').trim();
  };

  const openWhatsAppFallback = (waUrl: string) => {
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 150);
  };

  const shareOrConsultProductWithImage = (product: CatalogProduct, msgText: string, fallbackWaUrl: string) => {
    const syncFile = getProductImageFileSync(product);

    if (syncFile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      let canShareFiles = true;
      if (typeof navigator.canShare === 'function') {
        try {
          canShareFiles = navigator.canShare({ files: [syncFile] });
        } catch {
          canShareFiles = true;
        }
      }
      if (canShareFiles) {
        navigator
          .share({
            files: [syncFile],
            title: product.name || 'Producto',
            text: msgText
          })
          .catch((err) => {
            if (err && err.name === 'AbortError') return;
            navigator.share({ files: [syncFile], text: msgText }).catch((err2) => {
              if (err2 && err2.name === 'AbortError') return;
              openWhatsAppFallback(fallbackWaUrl);
            });
          });
        return;
      }
    }

    if (product.images?.length > 0 && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      getProductImageFileAsync(product)
        .then((asyncFile) => {
          if (asyncFile) {
            let canShareAsync = true;
            if (typeof navigator.canShare === 'function') {
              try {
                canShareAsync = navigator.canShare({ files: [asyncFile] });
              } catch {
                canShareAsync = true;
              }
            }
            if (canShareAsync) {
              return navigator
                .share({
                  files: [asyncFile],
                  title: product.name || 'Producto',
                  text: msgText
                })
                .catch((err) => {
                  if (err && err.name === 'AbortError') return;
                  return navigator.share({ files: [asyncFile], text: msgText });
                });
            }
          }
          openWhatsAppFallback(fallbackWaUrl);
        })
        .catch((err) => {
          if (err && err.name === 'AbortError') return;
          openWhatsAppFallback(fallbackWaUrl);
        });
      return;
    }

    openWhatsAppFallback(fallbackWaUrl);
  };

  const handleShareCatalog = () => {
    const catalogUrl = getPublicCatalogUrl();
    const template = project.messages?.shareCatalog || 'Catálogo {nombre_catalogo}: {url}';
    const msg = template
      .split('{nombre_catalogo}').join(project.name)
      .split('{url}').join(catalogUrl);
    openWhatsAppFallback(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const handleShareProduct = (product: CatalogProduct, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const rawTemplate = project.messages?.shareProduct || '';
    const isLegacy = !rawTemplate || rawTemplate.includes('Te comparto {nombre}');
    const template = isLegacy
      ? '¡Hola! Mira este producto de nuestro catálogo:\n\n📦 *Producto:* {nombre}\n🏷️ *Categoría:* {categoria}\n\n🌐 *Catálogo:* {url}'
      : rawTemplate;

    const msg = buildProductTextMessage(template, product, false);
    const fallbackWaUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    shareOrConsultProductWithImage(product, msg, fallbackWaUrl);
  };

  const handleConsultProduct = (product: CatalogProduct, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const template =
      project.messages?.consultProduct ||
      'Hola, estoy interesado en consultar sobre el siguiente producto de su catálogo:\n\n*Producto:* {nombre}\n*Categoría:* {categoria}\n{precio}\n\n🌐 *Catálogo:* {url}\n\n¿Podría brindarme más detalles?';

    const msg = buildProductTextMessage(template, product, true);
    const phone = project.contact?.phone ? project.contact.phone.replace(/[^0-9]/g, '') : '';
    const fallbackWaUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    shareOrConsultProductWithImage(product, msg, fallbackWaUrl);
  };

  // TAREA 2: Confirm Exit Action
  const handleExitConfirm = () => {
    setShowExitModal(false);
    try {
      window.close();
    } catch (e) {}
    // If window.close() is blocked by browser, redirect to about:blank or reload
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  };

  return (
    <div className={`catalog-page-bg min-h-screen transition-colors duration-200 ${fontClass} relative flex flex-col ${theme === 'dark' ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-100/70 text-stone-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
        {/* Brand & Banner Area */}
        <div className={`relative overflow-hidden transition-all ${bannerImage ? 'py-5 sm:py-7 px-4 sm:px-6' : 'py-3.5 px-4 sm:px-6'}`}>
          {/* Banner de Fondo si existe */}
          {bannerImage ? (
            <>
              <img
                src={bannerImage}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-all ${
                  logoImage
                    ? 'blur-sm brightness-70 scale-105'
                    : 'brightness-90'
                }`}
              />
              {/* Overlay para legibilidad */}
              <div
                className={`absolute inset-0 transition-colors ${
                  logoImage
                    ? 'bg-black/35 backdrop-blur-[2px]'
                    : 'bg-gradient-to-r from-black/60 via-black/30 to-black/15'
                }`}
              />
            </>
          ) : null}

          {/* Foreground content: Logo + Title/Subtitle + Actions */}
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">
            {/* Brand: Logo and Title/Subtitle */}
            <div className="flex items-center gap-3.5 min-w-0">
              {logoImage ? (
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center transition-all ${
                    bannerImage
                      ? 'bg-white/95 border-2 border-white/85 shadow-lg'
                      : 'bg-stone-100 border border-stone-200/90 shadow-2xs'
                  }`}
                >
                  <img
                    src={logoImage}
                    alt={project.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              ) : null}

              <div className="min-w-0">
                {project.name ? (
                  <h1
                    className={`text-lg sm:text-2xl font-bold tracking-tight truncate leading-tight transition-colors ${
                      bannerImage
                        ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]'
                        : 'text-stone-900'
                    }`}
                  >
                    {project.name}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p
                    className={`text-xs sm:text-sm truncate leading-normal mt-0.5 transition-colors ${
                      bannerImage
                        ? 'text-stone-100/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'
                        : 'text-stone-600 dark:text-stone-300 font-medium'
                    }`}
                  >
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenAdmin && (
                <button
                  type="button"
                  id="btn-nav-admin"
                  onClick={onOpenAdmin}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    bannerImage
                      ? 'bg-white/90 hover:bg-white text-stone-800 shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Gestor
                </button>
              )}

              {/* AJUSTE 4: Botón Modo Claro / Oscuro (Sol / Luna) al lado del menú hamburguesa */}
              <button
                type="button"
                id="btn-theme-toggle"
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  bannerImage
                    ? 'bg-white/85 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-200/50 dark:border-stone-700/60'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={theme === 'dark' ? 'Modo oscuro activado (clic para cambiar a claro)' : 'Modo claro activado (clic para cambiar a oscuro)'}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Moon className="w-6 h-6 text-amber-300 fill-amber-300/20" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </button>

              <button
                type="button"
                id="btn-header-menu"
                onClick={() => setIsMenuOpen(true)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  bannerImage
                    ? 'bg-white/85 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-200/50 dark:border-stone-700/60'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                aria-label="Abrir Menú"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Categories bar - DEBAJO DEL BANNER */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 ${bannerImage ? 'border-t border-stone-200/70 bg-white/95' : 'pt-1 pb-3'}`}>
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            {/* Search, Filter and Grid button container */}
            <div className="flex items-center gap-2 flex-1 relative z-50" style={{ position: 'relative', zIndex: 50 }}>
              {/* 1. [ Buscador ] */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-stone-500 dark:text-stone-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="catalog-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 bg-stone-50/90 border border-stone-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 text-stone-900 dark:text-stone-100"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 2. [ Filtros ] */}
              <div className="relative shrink-0 z-50" ref={sortRef}>
                <button
                  type="button"
                  id="btn-catalog-sort"
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsGridOpen(false);
                  }}
                  className={`p-2 sm:px-3 sm:py-2 border rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSortOpen || sortOption !== 'default'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50/90 border-stone-200/90 hover:bg-stone-100 text-stone-700 dark:text-stone-200'
                  }`}
                  title="Ordenar catálogo"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-semibold">Ordenar</span>
                </button>

                {/* Menú de ordenación con íconos a la izquierda */}
                {isSortOpen && (
                  <div
                    className="catalog-dropdown-menu absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl py-1.5 z-[100] overflow-hidden"
                    style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', zIndex: 999 }}
                  >
                    <div className="catalog-dropdown-header px-3.5 py-2 text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/90">
                      Ordenar por
                    </div>
                    {sortOptions.map((opt) => {
                      const isSelected = sortOption === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortOption(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`catalog-dropdown-item w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold'
                              : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                          }`}
                        >
                          <span className="w-5 h-5 flex items-center justify-center shrink-0">
                            {opt.icon}
                          </span>
                          <span className="flex-1 truncate">{opt.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. [ Cuadrículas ] */}
              <div className="relative shrink-0 z-50" ref={gridRef}>
                <button
                  type="button"
                  id="btn-catalog-grid"
                  onClick={() => {
                    setIsGridOpen(!isGridOpen);
                    setIsSortOpen(false);
                  }}
                  className={`p-2 sm:px-3 sm:py-2 border rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    isGridOpen || activeGrid !== (design?.layoutGrid || '2x2')
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50/90 border-stone-200/90 hover:bg-stone-100 text-stone-700 dark:text-stone-200'
                  }`}
                  title="Cambiar cuadrícula (1, 2, 3 columnas)"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline text-xs font-semibold">Cuadrícula</span>
                </button>

                {/* Menú de cambio de cuadrícula */}
                {isGridOpen && (
                  <div
                    className="catalog-dropdown-menu absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl py-1.5 z-[100] overflow-hidden"
                    style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', zIndex: 999 }}
                  >
                    <div className="catalog-dropdown-header px-3.5 py-2 text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/90">
                      Cuadrícula
                    </div>
                    {gridOptions.map((opt) => {
                      const isSelected = activeGrid === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setActiveGrid(opt.id);
                            setIsGridOpen(false);
                          }}
                          className={`catalog-dropdown-item w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold'
                              : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                          }`}
                        >
                          <span className="w-5 h-5 flex items-center justify-center shrink-0">
                            {opt.icon}
                          </span>
                          <span className="flex-1 truncate">{opt.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Categories pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none relative z-10" style={{ position: 'relative', zIndex: 10 }}>
              {(project.categories || ['TODOS']).map((cat) => {
                const isActive = selectedCategory === cat && !showOnlyFavorites;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowOnlyFavorites(false);
                      setOpenedFromMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'cat-pill-active text-white shadow-xs border-transparent'
                        : 'cat-pill-inactive bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50'
                    }`}
                    style={
                      isActive
                        ? theme === 'dark'
                          ? { backgroundColor: '#211F1E', color: '#D49B72', borderColor: '#D49B72' }
                          : { backgroundColor: primaryColor }
                        : theme === 'dark'
                        ? { backgroundColor: '#1C1A19', color: '#827B76', borderColor: '#302D2B' }
                        : undefined
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-6 flex-1 w-full">
        {/* AJUSTE 1: En la lista de favoritos, orden visual: [←] [Productos favoritos] [❤️] */}
        {showOnlyFavorites && (
          <div className="mb-4 flex items-center gap-3.5 bg-white dark:bg-stone-900 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setShowOnlyFavorites(false);
                setOpenedFromMenu(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400"
              title="Regresar al Inicio"
              aria-label="Regresar al Inicio"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                Productos favoritos
              </h2>
              <Heart className="fav-icon-heart fav-is-active w-5 h-5 shrink-0" fill="#ef4444" />
            </div>
          </div>
        )}

        {/* Promos banners if available (Lista horizontal con reproducción automática) - OCULTAS EN FAVORITOS */}
        {!showOnlyFavorites && sortedPromos.length > 0 && (
          <div className="relative mb-3.5 sm:mb-4 overflow-hidden">
            <div
              ref={promoSliderRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {sortedPromos.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => setSelectedPromo(promo)}
                  className={`bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer hover:border-stone-300 hover:shadow-md transition-all active:scale-[0.99] ${
                    sortedPromos.length === 1
                      ? 'w-full'
                      : 'w-[85%] sm:w-[460px] md:w-[500px] shrink-0 snap-start'
                  }`}
                  title="Ver detalle de la promoción"
                >
                  {promo.image && (
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain border border-stone-100 bg-stone-50 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {promo.badge && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold uppercase">
                          {promo.badge}
                        </span>
                      )}
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                        {promo.title}
                      </h3>
                    </div>
                    {promo.content && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {promo.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Grid based on layoutGrid setting */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/70 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center">
              {emptyStateInfo.icon === 'heart' && <Heart className="fav-icon-heart fav-is-empty w-6 h-6 text-stone-900 dark:text-white" />}
              {emptyStateInfo.icon === 'search' && <Search className="w-6 h-6 text-stone-400" />}
              {emptyStateInfo.icon === 'category' && <FolderOpen className="w-6 h-6 text-stone-400" />}
              {emptyStateInfo.icon === 'filter' && <SlidersHorizontal className="w-6 h-6 text-stone-400" />}
              {emptyStateInfo.icon === 'package' && <PackageOpen className="w-6 h-6 text-stone-400" />}
            </div>
            <p className="text-stone-600 text-sm font-medium">
              {emptyStateInfo.message}
            </p>
            {(searchTerm || showOnlyFavorites || selectedCategory !== 'TODOS') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('TODOS');
                  setShowOnlyFavorites(false);
                  setOpenedFromMenu(false);
                }}
                className="mt-4 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Regresar al Inicio
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid ${
              activeGrid === '1x1'
                ? 'grid-cols-1 gap-4 sm:gap-6 max-w-3xl mx-auto w-full'
                : activeGrid === '3x3'
                ? 'grid-cols-3 gap-2 sm:gap-3 md:gap-5'
                : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6'
            }`}
          >
            {filteredProducts.map((p) => {
              const isFav = favorites.includes(p.id);
              const views = productViews[p.id] || 0;
              const isTopViewed = maxViews > 0 && views === maxViews;

              return (
                <div
                  key={p.id}
                  id={`product-card-${p.id}`}
                  onClick={() => handleProductClick(p)}
                  className="product-card bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer"
                >
                  {/* Image container */}
                  <div className="relative w-full aspect-card bg-transparent overflow-hidden shrink-0">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-contain bg-transparent group-hover:scale-103 transition-transform duration-300"
                    />

                    {/* Badge views counter */}
                    <div className="btn-views-card absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/80 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 shadow-sm z-10 transition-colors">
                      {isTopViewed ? (
                        <Flame className="flame-icon-solid w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" style={{ color: '#f97316', fill: '#f97316', stroke: '#f97316' }} />
                      ) : (
                        <Eye className="icon-eye-neutral w-3.5 h-3.5 text-stone-900 dark:text-white shrink-0" />
                      )}
                      <span className="font-bold text-stone-700 dark:text-stone-200">{views}</span>
                    </div>

                    {/* Favorite button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className="btn-favorite-card absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm rounded-lg sm:rounded-xl text-stone-900 dark:text-white border border-stone-200/80 dark:border-stone-700/80 transition-colors shadow-sm cursor-pointer z-10"
                      title="Guardar favorito"
                    >
                      <Heart
                        className={`fav-icon-heart ${isFav ? 'fav-is-active scale-110' : 'fav-is-empty'} w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-900 dark:text-white`}
                      />
                    </button>
                  </div>

                  {/* Body */}
                  <div className={`${activeGrid === '3x3' ? 'p-2 sm:p-3 md:p-4' : activeGrid === '2x2' ? 'p-2.5 sm:p-3.5 md:p-4' : 'p-4 sm:p-5'} flex-1 flex flex-col justify-between`}>
                    <div>
                      {/* AJUSTE 2: NOMBRE del producto primero */}
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-base leading-snug line-clamp-1 mb-1">
                        {p.name}
                      </h3>

                      {/* AJUSTE 2: CATEGORÍA después en texto/badge más pequeño */}
                      {p.category && (
                        <div className="mb-1">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider truncate block">
                            {p.category}
                          </span>
                        </div>
                      )}

                      {/* Descripción visible ÚNICAMENTE en 1 columna */}
                      {activeGrid === '1x1' && p.description && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-3">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                        ${p.price} <span className="text-[10px] sm:text-xs font-medium text-stone-600 dark:text-stone-300">{p.currency || 'USD'}</span>
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleShareProduct(p, e)}
                          className="btn-share-card p-1 sm:p-1.5 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white rounded-lg sm:rounded-xl border border-stone-200/80 dark:border-stone-700/80 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
                          title="Compartir por WhatsApp"
                        >
                          <Share2 className="icon-share-neutral w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-900 dark:text-white" />
                        </button>
                        {/* Botón Detalles visible ÚNICAMENTE en 1 columna, OCULTO en 2 y 3 columnas */}
                        {activeGrid === '1x1' && (
                          <span
                            className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white rounded-lg sm:rounded-xl shadow-2xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Detalles
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="catalog-footer w-full shrink-0 mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 pt-6 pb-12 sm:pb-8 px-4 text-center text-xs font-medium text-stone-700 dark:text-stone-300">
        <div className="max-w-7xl mx-auto px-2 leading-relaxed break-words whitespace-normal">
          <p className="leading-relaxed break-words whitespace-normal">
            {design?.footerText || `© ${new Date().getFullYear()} ${project.name}. Catálogo Digital.`}
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (() => {
        const modalViews = productViews[selectedProduct.id] ?? selectedProduct.views ?? 1;
        const isModalTopViewed = maxViews > 0 && modalViews === maxViews;
        const isFav = favorites.includes(selectedProduct.id);
        const currentImg = selectedProduct.images[selectedImageIndex] || selectedProduct.images[0];

        return (
          <div
            id="product-detail-modal-overlay"
            style={{ overscrollBehavior: 'contain' }}
            className="modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              id="product-detail-modal-card"
              style={{ overscrollBehavior: 'contain' }}
              className="modal-overscroll-contain overscroll-contain bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-stone-200 dark:border-stone-800 animate-scaleUp text-stone-900 dark:text-stone-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. ENCABEZADO: Botón cerrar/regresar adaptable con borde gris claro y flecha hacia la izquierda */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  id="btn-close-product-detail"
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400"
                  title="Regresar / Cerrar"
                  aria-label="Regresar o cerrar modal"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  Detalles del producto
                </span>
                <div className="w-10" />
              </div>

              {/* Scrollable body */}
              <div
                ref={modalBodyRef}
                style={{ overscrollBehavior: 'contain' }}
                className="modal-overscroll-contain overscroll-contain p-4 sm:p-6 overflow-y-auto space-y-5"
              >
                {/* 2. IMAGEN PRINCIPAL DEL PRODUCTO */}
                <div className="space-y-3">
                  <div
                    id="modal-main-image-zoom-trigger"
                    onClick={() => {
                      setIsImageZoomOpen(true);
                      setZoomScale(1);
                    }}
                    style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', minHeight: '220px' }}
                    className="aspect-modal-img relative w-full aspect-16/10 bg-[#fafaf9] dark:bg-[#1c1917] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 cursor-zoom-in group flex items-center justify-center select-none"
                    title="Hacer clic para ampliar imagen"
                  >
                    {(selectedProduct.images.length > 0 ? selectedProduct.images : ['']).map((imgSrc, idx) => {
                      const isCurrent = idx === selectedImageIndex;
                      return (
                        <img
                          key={idx}
                          src={imgSrc}
                          alt={selectedProduct.name}
                          className="modal-product-slide-img w-full h-full object-contain bg-transparent group-hover:scale-103 pointer-events-none"
                          style={{
                            opacity: isCurrent ? 1 : 0,
                            visibility: isCurrent ? 'visible' : 'hidden',
                            zIndex: isCurrent ? 2 : 1,
                          }}
                        />
                      );
                    })}

                    {/* Flechas de navegación rápida si hay varias imágenes */}
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? selectedProduct.images.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/85 dark:bg-stone-900/85 backdrop-blur-sm rounded-full shadow-md text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer z-10"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) =>
                              prev === selectedProduct.images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/85 dark:bg-stone-900/85 backdrop-blur-sm rounded-full shadow-md text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer z-10"
                          aria-label="Imagen siguiente"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* 3. PRODUCTOS SIMILARES (si tiene más de 1 imagen) */}
                  {selectedProduct.images.length > 1 && (
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                          Productos Similares
                        </span>
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                        {selectedProduct.images.map((img, idx) => {
                          const isSelected = selectedImageIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all p-1 bg-stone-50 dark:bg-stone-800/80 cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'border-2 border-amber-600 dark:border-amber-500 ring-2 ring-amber-600/30 dark:ring-amber-500/30 scale-102'
                                  : 'border border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:border-stone-400'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Muestra ${idx + 1}`}
                                className="w-full h-full object-contain bg-transparent"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. INFORMACIÓN DEL PRODUCTO */}
                <div className="space-y-4">
                  {/* AJUSTE 1: 1. Nombre del producto PRIMERO y CENTRADO (grande, destacado) */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 leading-tight text-center">
                    {selectedProduct.name}
                  </h2>

                  {/* AJUSTE 2: 2. Categoría (badge resaltado) y 3. Etiquetas (debajo de la categoría) */}
                  <div className="space-y-2">
                    {selectedProduct.category && (
                      <div>
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#634832] dark:bg-[#7d5c41] text-white shadow-sm border border-[#4d3625]/20">
                          {selectedProduct.category}
                        </span>
                      </div>
                    )}
                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedProduct.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                          >
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AJUSTE 1: Íconos sobrios y elegantes (Vistas NEUTRO o LLAMA NARANJA, Favoritos CONTORNO NEUTRO + RELLENO ROJO si está guardado, Compartir NEUTRO) */}
                  <div className="flex items-center gap-2 sm:gap-3 py-2 border-y border-stone-100 dark:border-stone-800">
                    {/* Botón de vistas: Ícono de llama naranja rellena si es top, o neutro si no */}
                    <div
                      className="flex-none flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 transition-colors whitespace-nowrap"
                    >
                      {isModalTopViewed ? (
                        <Flame className="flame-icon-solid w-4 h-4 text-orange-500 fill-orange-500 shrink-0" style={{ color: '#f97316', fill: '#f97316', stroke: '#f97316' }} />
                      ) : (
                        <Eye className="icon-eye-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0" />
                      )}
                      <span>{modalViews} {modalViews === 1 ? 'vista' : 'vistas'}</span>
                    </div>

                    {/* Botón Favoritos (❤️): Contorno neutro, relleno ROJO solo si es favorito */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2 sm:px-3 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer"
                      title="Guardar producto en favoritos"
                    >
                      <Heart
                        className={`fav-icon-heart ${
                          isFav ? 'fav-is-active scale-110' : 'fav-is-empty'
                        } w-4 h-4 shrink-0 text-stone-900 dark:text-white transition-transform`}
                        fill={isFav ? '#ef4444' : 'none'}
                      />
                      <span className="truncate">{isFav ? 'Guardado' : 'Guardar'}</span>
                    </button>

                    {/* Botón Compartir: Ícono neutro */}
                    <button
                      type="button"
                      onClick={() => handleShareProduct(selectedProduct)}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2 sm:px-3 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer whitespace-nowrap"
                      title="Compartir enlace del producto"
                    >
                      <Share2 className="icon-share-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0" />
                      <span className="whitespace-nowrap">Compartir</span>
                    </button>
                  </div>

                  {/* Descripción completa */}
                  {selectedProduct.description && (
                    <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {selectedProduct.description}
                    </p>
                  )}

                  {/* AJUSTE 5: Medidas, Materiales, Pedido Mínimo y SKU en UNA SOLA LÍNEA HORIZONTAL */}
                  {(selectedProduct.sku || selectedProduct.dimensions || selectedProduct.material || (selectedProduct.moq && selectedProduct.moq > 0)) && (
                    <div className="p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {selectedProduct.sku && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-base select-none">🏷️</span>
                            <span className="text-stone-600 dark:text-stone-300 font-medium">SKU:</span>
                            <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{selectedProduct.sku}</span>
                          </span>
                        )}

                        {selectedProduct.sku && (selectedProduct.dimensions || selectedProduct.material || (selectedProduct.moq && selectedProduct.moq > 0)) && (
                          <span className="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>
                        )}

                        {selectedProduct.dimensions && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-base select-none">📐</span>
                            <span className="text-stone-600 dark:text-stone-300 font-medium">Medidas:</span>
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedProduct.dimensions}</span>
                          </span>
                        )}

                        {selectedProduct.dimensions && selectedProduct.material && (
                          <span className="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>
                        )}

                        {selectedProduct.material && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-base select-none">🪵</span>
                            <span className="text-stone-600 dark:text-stone-300 font-medium">Materiales:</span>
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedProduct.material}</span>
                          </span>
                        )}

                        {((selectedProduct.dimensions || selectedProduct.material) && selectedProduct.moq && selectedProduct.moq > 0) && (
                          <span className="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>
                        )}

                        {selectedProduct.moq && selectedProduct.moq > 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-base select-none">📦</span>
                            <span className="text-stone-600 dark:text-stone-300 font-medium">Pedido Mínimo:</span>
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedProduct.moq} unidades</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Precio FOB destacado */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800 dark:text-amber-400 block">
                        Precio FOB
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50">
                        ${selectedProduct.price}{' '}
                        <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                          {selectedProduct.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón Consultar por WhatsApp */}
                  <div>
                    <button
                      type="button"
                      id="btn-whatsapp-consult"
                      onClick={() => handleConsultProduct(selectedProduct)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <Phone className="w-5 h-5 fill-white" />
                      <span>Consultar por WhatsApp</span>
                    </button>
                  </div>

                  {/* 5. PRODUCTOS RELACIONADOS (AJUSTE 6: sin el enunciado de '3 sugerencias') */}
                  {relatedProducts.length > 0 && (
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">
                        Productos relacionados
                      </h3>
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        {relatedProducts.map((rel) => (
                          <div
                            key={rel.id}
                            onClick={() => handleProductClick(rel)}
                            className="group/rel flex flex-col bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl p-2 border border-stone-200/80 dark:border-stone-700/80 transition-all cursor-pointer hover:shadow-sm"
                          >
                            <div className="w-full aspect-square bg-transparent rounded-lg overflow-hidden mb-1.5 flex items-center justify-center p-1">
                              <img
                                src={rel.images[0]}
                                alt={rel.name}
                                className="w-full h-full object-contain group-hover/rel:scale-105 transition-transform"
                              />
                            </div>
                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1 mb-0.5">
                              {rel.name}
                            </p>
                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              ${rel.price}{' '}
                              <span className="text-[9px] font-medium text-stone-600 dark:text-stone-300">
                                {rel.currency || 'USD'}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE ZOOM / PANTALLA COMPLETA EN LA IMAGEN (ADAPTABLE AL MODO CLARO U OSCURO) */}
      {isImageZoomOpen && selectedProduct && (() => {
        const currentImg = selectedProduct.images[selectedImageIndex] || selectedProduct.images[0];

        return (
          <div
            id="image-zoom-modal-overlay"
            className="modal-overscroll-contain overscroll-contain fixed inset-0 z-[100] bg-stone-100/98 dark:bg-stone-950/98 text-stone-900 dark:text-stone-100 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 animate-fadeIn"
            style={{ zIndex: 100, overscrollBehavior: 'contain' }}
            onClick={() => setIsImageZoomOpen(false)}
          >
            {/* Header del Zoom: botón cerrar idéntico arriba a la izquierda */}
            <div
              className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-close-zoom"
                  onClick={() => setIsImageZoomOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400"
                  title="Cerrar zoom"
                  aria-label="Cerrar zoom"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <span className="text-xs text-stone-600 dark:text-stone-300 font-medium hidden sm:inline truncate max-w-xs ml-1">
                  {selectedProduct.name}
                </span>
              </div>

              {/* Controles de Zoom */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                  disabled={zoomScale <= 1}
                  className="p-1.5 sm:px-2.5 sm:py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-40 text-stone-800 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Reducir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-semibold px-1 min-w-12 text-center text-stone-800 dark:text-white">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
                  disabled={zoomScale >= 3}
                  className="p-1.5 sm:px-2.5 sm:py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-40 text-stone-800 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomScale > 1 && (
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="text-[11px] px-2 py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
                  >
                    100%
                  </button>
                )}
              </div>
            </div>

            {/* Contenedor central de la imagen con soporte de zoom */}
            <div
              style={{ overscrollBehavior: 'contain' }}
              className="modal-overscroll-contain overscroll-contain flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 cursor-pointer relative"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle zoom entre 1x y 2x al hacer clic
                setZoomScale((z) => (z > 1 ? 1 : 2));
              }}
            >
              <img
                src={currentImg}
                alt={selectedProduct.name}
                className="max-w-full max-h-[75vh] object-contain transition-transform duration-200 select-none drop-shadow-2xl"
                style={{ transform: `scale(${zoomScale})` }}
              />

              {/* Botones Anterior / Siguiente en Zoom si tiene múltiples imágenes */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer backdrop-blur-md"
                    aria-label="Anterior imagen"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) =>
                        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer backdrop-blur-md"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer del Zoom: Fila de miniaturas si hay más de 1 imagen */}
            {selectedProduct.images.length > 1 && (
              <div
                className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto pb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all p-1 bg-white/5 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-2 border-amber-500 ring-2 ring-amber-500/40 scale-105'
                        : 'border border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-transparent" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Slide-out Menu Drawer */}
      {isMenuOpen && (
        <div
          id="drawer-overlay"
          style={{ overscrollBehavior: 'contain' }}
          className="modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            id="drawer-panel"
            style={{ overscrollBehavior: 'contain' }}
            className="modal-overscroll-contain overscroll-contain w-80 max-w-full bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                <div className="flex items-center gap-2.5">
                  {logoImage ? (
                    <img src={logoImage} alt="" className="w-8 h-8 rounded-lg object-contain border border-stone-200" />
                  ) : null}
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base truncate">{project.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800 dark:text-stone-300 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {(project.menuOptions || []).filter((opt) => opt.visible).map((opt) => {
                  const customColorStyle =
                    opt.color && opt.color !== 'neutral'
                      ? { color: opt.color }
                      : undefined;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (opt.id === 'all_products') {
                          setOpenedFromMenu(false);
                          setSearchTerm('');
                          setSelectedCategory('TODOS');
                          setShowOnlyFavorites(false);
                        } else if (opt.id === 'favorites') {
                          setOpenedFromMenu(true);
                          setShowOnlyFavorites(true);
                        } else if (opt.id === 'share') {
                          handleShareCatalog();
                        } else if (opt.id === 'whatsapp') {
                          const phone = project.contact?.phone
                            ? project.contact.phone.replace(/[^0-9]/g, '')
                            : '';
                          const rawMsg =
                            opt.content !== undefined && opt.content !== ''
                              ? opt.content
                              : project.messages?.contactWhatsapp ||
                                'Hola, me interesa ver más detalles de tu catálogo.';
                          const catalogUrl = getPublicCatalogUrl();
                          const msg = rawMsg
                            .split('{nombre_catalogo}').join(project.name || '')
                            .split('{empresa}').join(project.contact?.company || project.name || '')
                            .split('{url}').join(catalogUrl)
                            .trim();
                          openWhatsAppFallback(
                            phone
                              ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                              : `https://wa.me/?text=${encodeURIComponent(msg)}`
                          );
                        } else if (opt.id === 'company') {
                          setOpenedFromMenu(true);
                          setActiveInfoModal('company');
                        } else if (opt.id === 'about') {
                          setOpenedFromMenu(true);
                          setActiveInfoModal('about');
                        } else if (opt.id === 'how_it_works') {
                          setOpenedFromMenu(true);
                          setActiveInfoModal('how_it_works');
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      {(opt.id === 'favorites' || opt.iconName === 'Heart') && (
                        <Heart
                          className="fav-icon-heart fav-is-active w-4 h-4 text-stone-900 dark:text-white shrink-0"
                          fill="#ef4444"
                        />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Share2' && (
                        <Share2 className="icon-share-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0" />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'ShoppingBag' && (
                        <ShoppingBag className="w-4 h-4 text-stone-900 dark:text-white shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Package' && (
                        <Package className="w-4 h-4 text-stone-900 dark:text-white shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'LayoutGrid' && (
                        <LayoutGrid className="w-4 h-4 text-stone-900 dark:text-white shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Tag' && (
                        <Tag className="w-4 h-4 text-stone-900 dark:text-white shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Phone' && (
                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'MessageCircle' && (
                        <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Building' && (
                        <Building className="w-4 h-4 text-amber-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Info' && (
                        <Info className="w-4 h-4 text-indigo-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'HelpCircle' && (
                        <HelpCircle className="w-4 h-4 text-violet-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Sparkles' && (
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Star' && (
                        <Star className="w-4 h-4 text-amber-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Globe' && (
                        <Globe className="w-4 h-4 text-sky-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'Mail' && (
                        <Mail className="w-4 h-4 text-indigo-500 shrink-0" style={customColorStyle} />
                      )}
                      {opt.id !== 'favorites' && opt.iconName === 'MapPin' && (
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" style={customColorStyle} />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}

                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left border-t border-stone-100 mt-2 pt-3 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-stone-600" />
                    <span>Panel de Administración</span>
                  </button>
                )}

                {/* TAREA 2: Opción Salir en el Menú */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowExitModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir del Catálogo</span>
                </button>
              </div>
            </div>

            <div className="drawer-footer-company pt-4 border-t border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 text-center">
              {project.contact?.company || project.name}
            </div>
          </div>
        </div>
      )}

      {/* Info Modals (Company, About, How it works): SOLO botón X para cerrar y regresar a la pantalla principal */}
      {activeInfoModal && (
        <div
          id="standalone-info-modal"
          style={{ overscrollBehavior: 'contain' }}
          className="modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setActiveInfoModal(null);
            setOpenedFromMenu(false);
          }}
        >
          <div
            style={{ overscrollBehavior: 'contain' }}
            className="modal-overscroll-contain overscroll-contain bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-stone-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {activeInfoModal === 'how_it_works' ? (
              <>
                <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/50">
                      <HelpCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">
                        {(project.menuOptions || []).find((o) => o.id === 'how_it_works')?.label || '¿Cómo funciona?'}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mt-0.5">
                        {(project.menuOptions || []).find((o) => o.id === 'how_it_works')?.content || '¿Cómo usar este catálogo?'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfoModal(null);
                      setOpenedFromMenu(false);
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto pt-3.5 pb-1 space-y-2.5 flex-1 pr-1">
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    Sigue estos sencillos pasos para sacarle el máximo provecho a nuestra plataforma de exhibición digital:
                  </p>

                  {((project.menuOptions || []).find((o) => o.id === 'how_it_works')?.steps || [
                    { title: 'Explora sin compromiso', desc: 'Este es un catálogo 100% de exhibición.' },
                    { title: 'Contacta si te gusta', desc: '¿Viste algo que te encantó? Puedes contactarnos y pedir más detalles.' },
                    { title: 'Encuentra lo que buscas', desc: 'Usa el buscador por nombre, categoría o material para ir directo al grano.' },
                    { title: 'Guarda tus favoritos', desc: 'Haz clic en el corazón ❤️ para marcar tus piezas preferidas y encontrarlas fácilmente después.' },
                    { title: 'Comparte con quien quieras', desc: '¿Tienes un amigo al que le encantaría esto? Compártelo directamente por WhatsApp con un solo toque.' }
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-stone-50/80 rounded-xl border border-stone-200/60">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{step.title}</h4>
                        <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4 shrink-0">
                  <h3 className="font-bold text-stone-900 text-base">
                    {activeInfoModal === 'company' &&
                      ((project.menuOptions || []).find((o) => o.id === 'company')?.label || 'Información de la Empresa')}
                    {activeInfoModal === 'about' &&
                      ((project.menuOptions || []).find((o) => o.id === 'about')?.label || 'Información del Catálogo')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfoModal(null);
                      setOpenedFromMenu(false);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1">
                  {activeInfoModal === 'company' && (
                    <div className="space-y-3 text-xs text-stone-600">
                      {project.contact?.company && (
                        <p><strong className="text-stone-800">Empresa:</strong> {project.contact.company}</p>
                      )}
                      {project.contact?.name && (
                        <p><strong className="text-stone-800">Contacto:</strong> {project.contact.name}</p>
                      )}
                      {project.contact?.phone && (
                        <p><strong className="text-stone-800">Teléfono:</strong> {project.contact.phone}</p>
                      )}
                      {project.contact?.email && (
                        <p><strong className="text-stone-800">Correo:</strong> {project.contact.email}</p>
                      )}
                      {project.contact?.address && (
                        <p><strong className="text-stone-800">Ubicación:</strong> {project.contact.address}</p>
                      )}
                      {project.contact?.website && (
                        <p><strong className="text-stone-800">Web:</strong> {project.contact.website}</p>
                      )}
                      {(project.menuOptions || []).find((o) => o.id === 'company')?.content && (
                        <p className="pt-2 border-t border-stone-100 whitespace-pre-line">
                          {(project.menuOptions || []).find((o) => o.id === 'company')?.content}
                        </p>
                      )}
                    </div>
                  )}

                  {activeInfoModal === 'about' && (
                    <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                      {project.description ||
                        (project.menuOptions || []).find((o) => o.id === 'about')?.content ||
                        'Catálogo de exhibición de productos de alta calidad.'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AJUSTE 2: Modal con Vista Detallada de la Promoción */}
      {selectedPromo && (
        <div
          id="promo-detail-modal"
          style={{ overscrollBehavior: 'contain' }}
          className="modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPromo(null)}
        >
          <div
            style={{ overscrollBehavior: 'contain' }}
            className="modal-overscroll-contain overscroll-contain bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-stone-100 max-h-[90vh] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera con Badge y botón de cerrar */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPromo.badge ? (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-bold uppercase tracking-wider">
                    {selectedPromo.badge}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-md text-xs font-bold uppercase tracking-wider">
                    Promoción Especial
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPromo(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto py-4 flex-1 space-y-4 pr-1">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                {selectedPromo.title}
              </h2>

              {selectedPromo.image && (
                <div className="w-full rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/60 flex items-center justify-center max-h-72">
                  <img
                    src={selectedPromo.image}
                    alt={selectedPromo.title}
                    className="w-full max-h-72 object-contain"
                  />
                </div>
              )}

              {selectedPromo.content && (
                <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {selectedPromo.content}
                </div>
              )}
            </div>

            {/* Pie con botón Cerrar */}
            <div className="pt-3 border-t border-stone-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPromo(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAREA 2: Modal Personalizado de Confirmación de Salida con Blur y Textos Exactos */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={handleExitConfirm}
        primaryColor={primaryColor}
        fontFamily={fontFamily}
      />

      {/* Botón flotante para subir al inicio */}
      <button
        type="button"
        id="btn-scroll-top"
        onClick={scrollToTop}
        className={`fixed ${
          onOpenAdmin ? 'bottom-16 right-4 sm:bottom-18 sm:right-5' : 'bottom-5 right-5 sm:bottom-6 sm:right-6'
        } z-40 w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white rounded-full shadow-md border border-stone-300 dark:border-stone-600 hover:border-stone-400 backdrop-blur-sm transition-all duration-300 cursor-pointer flex items-center justify-center ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="Subir al inicio"
        aria-label="Subir al inicio"
      >
        <ArrowUp className="w-5 h-5 text-stone-800 dark:text-white" />
      </button>
    </div>
  );
}
