import { CatalogProject, CustomBlock } from './types';
import { STANDALONE_CSS } from './standalone-css';

export function generateStandaloneCatalogHTML(
  project: CatalogProject,
  customBlocks: CustomBlock[] = []
): string {
  const design = project.design || {
    primaryColor: '#8c6d58',
    secondaryColor: '#2b3a32',
    fontFamily: 'serif',
    layoutGrid: '2x2',
    footerText: '',
    subtitle: '',
    logoImage: ''
  };

  const projectDataJson = JSON.stringify({
    project,
    customBlocks
  }).replace(/<\/script>/gi, '<\\/script>');

  const primaryColor = design.primaryColor || '#8c6d58';
  const fontFamily = design.fontFamily || 'serif';
  const fontClass =
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHTML(project.name)}</title>
  <script>
    (function() {
      try {
        var t = localStorage.getItem('cat_theme_${project.id}') || localStorage.getItem('cat_theme');
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  </script>
  <style>
    ${STANDALONE_CSS}
    .font-serif { font-family: "Playfair Display", Georgia, serif; }
    .font-sans { font-family: system-ui, -apple-system, sans-serif; }
    .font-mono { font-family: ui-monospace, monospace; }
  </style>
</head>
<body class="catalog-page-bg bg-stone-100 text-stone-900 ${fontClass} min-h-screen flex flex-col antialiased selection:bg-amber-200">
  <div id="catalog-app" class="flex-1 flex flex-col min-h-screen"></div>

  <!-- Botón flotante para subir al inicio (Adaptable al tema) -->
  <button
    type="button"
    id="btn-scroll-to-top"
    onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
    class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white rounded-full shadow-md border border-stone-300 dark:border-stone-600 hover:border-stone-400 backdrop-blur-sm transition-all duration-300 cursor-pointer flex items-center justify-center opacity-0 translate-y-4 pointer-events-none"
    title="Subir al inicio"
    aria-label="Subir al inicio"
  >
    <svg class="w-5 h-5 text-stone-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  </button>

  <!-- EMBEDDED DATA -->
  <script id="catalog-project-data" type="application/json">
    ${projectDataJson}
  </script>

  <!-- STANDALONE RUNTIME -->
  <script>
    (function() {
      var rawData = document.getElementById('catalog-project-data').textContent;
      var dataObj = JSON.parse(rawData);
      var project = dataObj.project;
      var customBlocks = dataObj.customBlocks || [];
      var products = project.products || [];
      var categories = project.categories || ['TODOS'];
      var design = project.design || {};
      var primaryColor = design.primaryColor || '#8c6d58';
      var subtitle = (design.subtitle || '').trim();
      var logoImage = (design.logoImage || '').trim();

      var currentCategory = 'TODOS';
      var searchQuery = '';
      var currentSort = 'default';
      var isSortMenuOpen = false;
      // AJUSTE 1: Vista por defecto SIEMPRE en 2 columnas al abrir
      var currentGrid = '2x2';
      var isGridMenuOpen = false;
      var showOnlyFavorites = false;
      var favorites = JSON.parse(localStorage.getItem('cat_favs_' + project.id) || '[]');
      var productViews = {};
      var selectedProduct = null;
      var currentImgIndex = 0;
      window.currentImgIndex = 0;
      var isMenuOpen = false;
      var openedFromMenu = false;
      var isExitModalOpen = false;

      // AJUSTE 4: Gestión de Modo Claro / Oscuro con persistencia en localStorage
      var currentTheme = localStorage.getItem('cat_theme_' + project.id) || localStorage.getItem('cat_theme') || 'light';
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      window.toggleTheme = function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('cat_theme_' + project.id, currentTheme);
        localStorage.setItem('cat_theme', currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        render();
        if (document.getElementById('drawer-overlay')) {
          window.openMainMenu();
        }
      };

      var defaultMenuOpts = [
        { id: 'favorites', label: 'Productos Favoritos', iconName: 'Heart', color: 'neutral', visible: true },
        { id: 'share', label: 'Compartir catálogo', iconName: 'Share2', color: 'neutral', visible: true },
        { id: 'whatsapp', label: 'Contactar por WhatsApp', iconName: 'Phone', color: '#10b981', visible: true, content: 'Hola, me interesa ver más detalles de tu catálogo.' },
        { id: 'company', label: 'Información de la empresa', iconName: 'Building', color: '#f59e0b', visible: true },
        { id: 'about', label: 'Información del Catálogo', iconName: 'Info', color: '#6366f1', visible: true },
        { id: 'how_it_works', label: '¿Cómo funciona?', iconName: 'HelpCircle', color: '#8b5cf6', visible: true }
      ];

      var menuOpts = (project.menuOptions && project.menuOptions.length > 0)
        ? project.menuOptions.filter(function(o) { return o.visible !== false; }).map(function(o) {
            var def = defaultMenuOpts.find(function(d) { return d.id === o.id; }) || {};
            var itemContent = (o.content !== undefined && o.content !== '') ? o.content : def.content;
            if (o.id === 'whatsapp' && project.messages && project.messages.contactWhatsapp) {
              itemContent = project.messages.contactWhatsapp;
            }
            return {
              id: o.id || def.id,
              label: o.label || def.label || '',
              iconName: o.iconName || def.iconName || 'Info',
              color: o.color || def.color || ((o.id === 'favorites' || o.id === 'share') ? 'neutral' : ''),
              visible: o.visible !== false,
              content: itemContent,
              steps: o.steps
            };
          })
        : defaultMenuOpts.map(function(d) {
            if (d.id === 'whatsapp' && project.messages && project.messages.contactWhatsapp) {
              return {
                id: d.id,
                label: d.label,
                iconName: d.iconName,
                color: d.color,
                visible: d.visible,
                content: project.messages.contactWhatsapp,
                steps: d.steps
              };
            }
            return d;
          });

      var gridOptionsData = [
        {
          id: '1x1',
          label: '1 Columna (Grande)',
          icon: '<svg class="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/></svg>'
        },
        {
          id: '2x2',
          label: '2 Columnas (Estándar)',
          icon: '<svg class="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="18" rx="1.5"/><rect x="13" y="3" width="8" height="18" rx="1.5"/></svg>'
        },
        {
          id: '3x3',
          label: '3 Columnas (Compacto)',
          icon: '<svg class="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="9.5" y="3" width="5" height="18" rx="1"/><rect x="16" y="3" width="5" height="18" rx="1"/></svg>'
        }
      ];

      var sortOptionsData = [
        {
          id: 'default',
          label: 'Orden por defecto (Más recientes)',
          icon: '<svg class="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          id: 'az',
          label: 'De la A a la Z',
          icon: '<svg class="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M20 8h-5"/><path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/><path d="M15 14h5l-5 6h5"/></svg>'
        },
        {
          id: 'za',
          label: 'De la Z a la A',
          icon: '<svg class="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M15 4h5l-5 6h5"/><path d="M20 18h-5"/><path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20"/></svg>'
        },
        {
          id: 'price_asc',
          label: 'Precio: de Menor a Mayor',
          icon: '<svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18V6"/><path d="m4 10 4-4 4 4"/><path d="M17 9a2 2 0 0 0-2-2h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2"/><path d="M16 5v14"/></svg>'
        },
        {
          id: 'price_desc',
          label: 'Precio: de Mayor a Menor',
          icon: '<svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v12"/><path d="m4 14 4 4 4-4"/><path d="M17 9a2 2 0 0 0-2-2h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2"/><path d="M16 5v14"/></svg>'
        },
        {
          id: 'popular',
          label: 'Más Vistos (Popularidad)',
          icon: '<svg class="flame-icon-solid w-4 h-4 text-orange-500 fill-orange-500 shrink-0" style="color: #f97316; fill: #f97316;" fill="#f97316" stroke="#f97316" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        }
      ];

      var GLOBAL_COUNTER_NAMESPACE = 'catalogo-madera-laser';
      var ABACUS_BASE_URL = 'https://abacus.jasoncameron.dev';
      var MAX_CONCURRENCY = 6;
      var REQUEST_TIMEOUT_MS = 5000;

      function cleanKey(id) {
        return (id || 'general').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      }

      // Parallel Abacus Views Fetching (TAREA 1: Concurrency 6, no pauses, 5s timeout, backoff)
      function fetchWithTimeout(url, timeoutMs) {
        if (typeof fetch === 'undefined') return Promise.reject(new Error('Fetch not available'));
        if (typeof AbortController !== 'undefined') {
          var controller = new AbortController();
          var timer = setTimeout(function() {
            try { controller.abort(); } catch(e) {}
          }, timeoutMs || REQUEST_TIMEOUT_MS);
          return fetch(url, { credentials: 'omit', signal: controller.signal })
            .finally(function() { clearTimeout(timer); });
        }
        return fetch(url, { credentials: 'omit' });
      }

      function fetchWithBackoff(url, retries) {
        retries = retries || 2;
        var attempt = 0;
        var delay = 1000;
        function tryFetch() {
          return fetchWithTimeout(url, 5000).catch(function(err) {
            if (attempt < retries) {
              attempt++;
              return new Promise(function(resolve) { setTimeout(resolve, delay); })
                .then(function() {
                  delay *= 2;
                  return tryFetch();
                });
            }
            throw err;
          });
        }
        return tryFetch();
      }

      function fetchAllProductViewsParallel() {
        var ids = products.map(function(p) { return p.id; });
        var index = 0;

        function worker() {
          if (index >= ids.length) return Promise.resolve();
          var id = ids[index++];
          var key = cleanKey(id);
          var url = ABACUS_BASE_URL + '/get/' + encodeURIComponent(GLOBAL_COUNTER_NAMESPACE) + '/' + encodeURIComponent(key);

          return fetchWithBackoff(url, 2)
            .then(function(res) {
              if (res.ok) return res.json();
              return null;
            })
            .then(function(data) {
              if (data && typeof data.value === 'number') {
                productViews[id] = data.value;
                updateViewsDOM(id, data.value);
              }
            })
            .catch(function() {})
            .then(worker);
        }

        var pool = [];
        var limit = Math.min(MAX_CONCURRENCY, ids.length);
        for (var i = 0; i < limit; i++) {
          pool.push(worker());
        }
        return Promise.all(pool).then(function() {
          updateFlameBadges();
        });
      }

      var eyeSvg = '<svg class="icon-eye-neutral w-3.5 h-3.5 text-stone-900 dark:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>';
      var eyeSvgDetail = '<svg class="icon-eye-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      var flameSvg = '<svg class="flame-icon-solid w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" style="color: #f97316; fill: #f97316;" fill="#f97316" stroke="#f97316" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
      var flameSvgDetail = '<svg class="flame-icon-solid w-4 h-4 text-orange-500 fill-orange-500 shrink-0" style="color: #f97316; fill: #f97316;" fill="#f97316" stroke="#f97316" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';

      function updateFlameBadges() {
        var maxViews = 0;
        products.forEach(function(item) {
          var v = productViews[item.id] || item.views || item.viewsCount || 0;
          if (v > maxViews) maxViews = v;
        });

        products.forEach(function(item) {
          var v = productViews[item.id] || item.views || item.viewsCount || 0;
          var isTop = maxViews > 0 && v === maxViews;

          var iconEl = document.getElementById('view-icon-' + item.id);
          if (iconEl) {
            iconEl.innerHTML = isTop ? flameSvg : eyeSvg;
          }
        });
      }

      function incrementViews(productId) {
        var key = cleanKey(productId);
        productViews[productId] = (productViews[productId] || 0) + 1;
        updateViewsDOM(productId, productViews[productId]);

        var url = ABACUS_BASE_URL + '/hit/' + encodeURIComponent(GLOBAL_COUNTER_NAMESPACE) + '/' + encodeURIComponent(key);
        fetchWithBackoff(url, 1)
          .then(function(res) { return res.ok ? res.json() : null; })
          .then(function(data) {
            if (data && typeof data.value === 'number') {
              productViews[productId] = data.value;
              updateViewsDOM(productId, data.value);
            }
          })
          .catch(function() {});
      }

      function updateViewsDOM(id, count) {
        var el = document.getElementById('view-badge-' + id);
        if (el) el.textContent = count;
        var modalEl = document.getElementById('modal-view-count');
        if (modalEl && selectedProduct && selectedProduct.id === id) {
          modalEl.textContent = count + ' vistas';
        }
        updateFlameBadges();
      }

      function saveFavorites() {
        try {
          localStorage.setItem('cat_favs_' + project.id, JSON.stringify(favorites));
        } catch(e) {}
      }

      function updateModalFavDOM(id) {
        var modalEl = document.getElementById('standalone-product-modal');
        if (!modalEl || !selectedProduct || String(selectedProduct.id) !== String(id)) return;
        var isFavNow = favorites.indexOf(id) >= 0;
        var heartSvg = modalEl.querySelector('#modal-fav-heart-svg');
        var heartPath = modalEl.querySelector('#modal-fav-heart-path');
        var favLabel = modalEl.querySelector('#modal-fav-btn-label');
        if (heartSvg) {
          heartSvg.setAttribute('class', 'fav-icon-heart ' + (isFavNow ? 'fav-is-active scale-110' : 'fav-is-empty') + ' w-4 h-4 text-stone-900 dark:text-white shrink-0 transition-transform');
          heartSvg.setAttribute('fill', isFavNow ? '#ef4444' : 'none');
          heartSvg.style.setProperty('fill', isFavNow ? '#ef4444' : 'none', 'important');
        }
        if (heartPath) {
          heartPath.setAttribute('fill', isFavNow ? '#ef4444' : 'none');
          heartPath.style.setProperty('fill', isFavNow ? '#ef4444' : 'none', 'important');
        }
        if (favLabel) {
          favLabel.textContent = isFavNow ? 'Guardado' : 'Guardar';
        }
      }

      function toggleFav(id, e) {
        if (e) e.stopPropagation();
        var idx = favorites.indexOf(id);
        if (idx >= 0) favorites.splice(idx, 1);
        else favorites.push(id);
        saveFavorites();
        render();
        updateModalFavDOM(id);
      }

      // Pila de navegación (stack) y gestión robusta del historial para el botón físico "Atrás" de Android
      var navStack = [];
      var historyGuardCount = 0;
      var historySeq = 0;
      var isExitingApp = false;

      function pushHistoryEntry(tag) {
        if (isExitingApp) return;
        try {
          historySeq++;
          history.pushState({ catalogNav: tag || 'guard', seq: historySeq }, '');
          historyGuardCount++;
        } catch(e) {}
      }

      function ensureHistoryGuard(minDepth) {
        if (isExitingApp) return;
        var target = Math.max(minDepth || 6, navStack.length + 4);
        while (historyGuardCount < target) {
          pushHistoryEntry('guard');
        }
      }

      function removeNavView(viewId) {
        for (var i = navStack.length - 1; i >= 0; i--) {
          if (navStack[i] === viewId) {
            navStack.splice(i, 1);
          }
        }
      }

      function pushNavView(viewId) {
        var alreadyInStack = navStack.indexOf(viewId) >= 0;
        removeNavView(viewId);
        navStack.push(viewId);
        ensureHistoryGuard(navStack.length + 4);
        if (!alreadyInStack) {
          pushHistoryEntry(viewId);
        }
      }

      // Armar entradas de historial en cada gesto real del usuario (requerido por Chrome Android para no saltar estados en popstate)
      ['click', 'touchend', 'pointerup', 'keydown'].forEach(function(evtName) {
        document.addEventListener(evtName, function() {
          if (!isExitingApp) {
            ensureHistoryGuard(6);
          }
        }, { capture: true, passive: true });
      });

      function hasAnyOpenModal() {
        return !!(
          selectedProduct ||
          document.getElementById('standalone-product-modal') ||
          document.getElementById('standalone-image-zoom-modal') ||
          document.getElementById('drawer-overlay') ||
          document.getElementById('promo-detail-modal') ||
          document.getElementById('standalone-info-modal') ||
          document.getElementById('exit-confirm-modal-overlay') ||
          document.getElementById('standalone-exit-modal')
        );
      }

      function syncBodyScrollLock() {
        var locked = hasAnyOpenModal();
        if (locked) {
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
      }

      window.closeExitModal = function() {
        var existing = document.getElementById('exit-confirm-modal-overlay');
        if (existing) existing.remove();
        removeNavView('exit');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      // Modal de confirmación de salida adaptable al tema
      window.openExitModal = function() {
        var existing = document.getElementById('exit-confirm-modal-overlay');
        if (existing) existing.remove();

        pushNavView('exit');

        var div = document.createElement('div');
        div.id = 'exit-confirm-modal-overlay';
        div.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 select-none animate-fadeIn';
        div.style.overscrollBehavior = 'contain';
        div.onclick = function() { window.closeExitModal(); };

        div.innerHTML = [
          '<div id="exit-confirm-modal-card" style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-stone-200/80 dark:border-stone-800 transform transition-all scale-100" onclick="event.stopPropagation()">',
            '<div class="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white shadow-md" style="background-color: ' + primaryColor + '">',
              '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
            '</div>',
            '<h3 class="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">¡Estás saliendo del Catálogo!</h3>',
            '<p class="text-stone-600 dark:text-stone-400 text-sm mb-6 leading-relaxed">¿Estás seguro que deseas salir?</p>',
            '<div class="flex items-center justify-center gap-3">',
              '<button type="button" id="btn-exit-cancel" onclick="closeExitModal()" class="flex-1 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all cursor-pointer active:scale-95">Cancelar</button>',
              '<button type="button" id="btn-exit-confirm" onclick="confirmExit()" class="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95" style="background-color: ' + primaryColor + '">Salir</button>',
            '</div>',
          '</div>'
        ].join('');

        document.body.appendChild(div);
        syncBodyScrollLock();
      };

      window.confirmExit = function() {
        isExitingApp = true;
        var overlay = document.getElementById('exit-confirm-modal-overlay');
        if (overlay) overlay.remove();
        try {
          window.close();
        } catch (e) {}
        try {
          if (historyGuardCount > 0) {
            history.go(-(historyGuardCount + 1));
          }
        } catch (e) {}
        setTimeout(function() {
          window.location.replace('about:blank');
        }, 120);
      };

      // Manejo jerárquico y basado en pila (navStack) del botón físico "Atrás" de Android
      window.handleAndroidBackButton = function() {
        // 1. Si el usuario está en el ZOOM de una imagen: CERRAR el zoom y volver a la vista detallada (SIN preguntar)
        var zoomModal = document.getElementById('standalone-image-zoom-modal');
        if (zoomModal) {
          window.closeImageZoomModal();
          return;
        }

        // 2. Si el modal de confirmación de SALIDA ya está visible: CERRARLO y quedarse en el catálogo
        var exitOverlay = document.getElementById('exit-confirm-modal-overlay') || document.getElementById('standalone-exit-modal');
        if (exitOverlay) {
          window.closeExitModal();
          return;
        }

        // 3. Si el usuario está en la VISTA DETALLADA de un producto: CERRAR la vista detallada y volver al catálogo (o favoritos) (SIN preguntar)
        var prodModal = document.getElementById('standalone-product-modal');
        if (prodModal || selectedProduct) {
          window.closeProductDetailModal();
          return;
        }

        // 4. Si el usuario está en una PROMOCIÓN detallada: CERRAR el modal de promoción (SIN preguntar)
        var promoModal = document.getElementById('promo-detail-modal');
        if (promoModal) {
          window.closePromoDetailModal();
          return;
        }

        // 5. Si hay un modal de INFORMACIÓN abierto (company, about, how_it_works): CERRARLO y regresar a la pantalla principal (NO al menú de opciones)
        var infoModal = document.getElementById('standalone-info-modal');
        if (infoModal) {
          window.closeInfoModal();
          return;
        }

        // 6. Si el MENÚ hamburguesa está abierto: CERRAR el menú (SIN preguntar)
        var drawer = document.getElementById('drawer-overlay');
        if (drawer) {
          window.closeMainMenu();
          return;
        }

        // 7. Si el menú desplegable de ordenamiento o cuadrícula está abierto: CERRARLO (SIN preguntar)
        if (isSortMenuOpen || isGridMenuOpen) {
          isSortMenuOpen = false;
          isGridMenuOpen = false;
          removeNavView('dropdown');
          render();
          return;
        }

        // 8. Desapilar sub-vistas/estados del catálogo en el orden exacto en que fueron abiertos (LIFO)
        while (navStack.length > 0) {
          var lastView = navStack.pop();
          if (lastView === 'favorites' && showOnlyFavorites) {
            showOnlyFavorites = false;
            openedFromMenu = false;
            render();
            return;
          }
          if (lastView === 'search' && searchQuery) {
            searchQuery = '';
            var sInput = document.getElementById('search-input');
            if (sInput) sInput.value = '';
            render();
            return;
          }
          if (lastView === 'category' && currentCategory !== 'TODOS') {
            currentCategory = 'TODOS';
            render();
            return;
          }
          if (lastView === 'sort' && currentSort !== 'default') {
            currentSort = 'default';
            render();
            return;
          }
        }

        // 9. Respaldo por si algún estado secundario del catálogo sigue activo fuera de la pila:
        if (showOnlyFavorites) {
          showOnlyFavorites = false;
          openedFromMenu = false;
          render();
          return;
        }
        if (searchQuery) {
          searchQuery = '';
          var sInp = document.getElementById('search-input');
          if (sInp) sInp.value = '';
          render();
          return;
        }
        if (currentCategory !== 'TODOS') {
          currentCategory = 'TODOS';
          render();
          return;
        }
        if (currentSort !== 'default') {
          currentSort = 'default';
          render();
          return;
        }

        // 10. Si NO hay sub-vistas abiertas y el usuario está en la PANTALLA PRINCIPAL: MOSTRAR confirmación de salida
        if (typeof window.openExitModal === 'function') {
          window.openExitModal();
        }
      };

      // Inicializar estados base en el historial e interceptar popstate
      try {
        pushHistoryEntry('init_1');
        pushHistoryEntry('init_2');
        window.addEventListener('popstate', function(event) {
          if (isExitingApp) return;
          if (historyGuardCount > 0) {
            historyGuardCount--;
          }
          if (historyGuardCount < 2) {
            pushHistoryEntry('fallback');
          }
          window.handleAndroidBackButton();
        });
      } catch(e) {}

      function render() {
        var app = document.getElementById('catalog-app');
        var filtered = products.filter(function(p) {
          var matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.material && p.material.toLowerCase().includes(searchQuery.toLowerCase()));
          var matchCat = currentCategory === 'TODOS' || p.category === currentCategory;
          var matchFav = !showOnlyFavorites || favorites.indexOf(p.id) >= 0;
          return matchSearch && matchCat && matchFav;
        });

        if (currentSort === 'az') {
          filtered.sort(function(a, b) {
            return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
          });
        } else if (currentSort === 'za') {
          filtered.sort(function(a, b) {
            return (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' });
          });
        } else if (currentSort === 'price_asc') {
          filtered.sort(function(a, b) {
            return (Number(a.price) || 0) - (Number(b.price) || 0);
          });
        } else if (currentSort === 'price_desc') {
          filtered.sort(function(a, b) {
            return (Number(b.price) || 0) - (Number(a.price) || 0);
          });
        } else if (currentSort === 'popular') {
          filtered.sort(function(a, b) {
            var countA = productViews[a.id] || a.views || a.viewsCount || 0;
            var countB = productViews[b.id] || b.views || b.viewsCount || 0;
            return countB - countA;
          });
        }

        // Banner y Logo HTML
        var bannerImage = design.bannerImage ? design.bannerImage.trim() : '';
        var hasLogo = !!logoImage;

        var bannerBgHtml = '';
        if (bannerImage) {
          var imgFilterClass = hasLogo ? 'blur-sm brightness-70 scale-105' : 'brightness-90';
          var overlayClass = hasLogo
            ? 'bg-black/35 backdrop-blur-[2px]'
            : 'bg-gradient-to-r from-black/60 via-black/30 to-black/15';
          bannerBgHtml = '<img src="' + bannerImage + '" alt="" class="absolute inset-0 w-full h-full object-cover transition-all ' + imgFilterClass + '" />' +
            '<div class="absolute inset-0 ' + overlayClass + '"></div>';
        }

        var logoHtml = '';
        if (logoImage) {
          var logoContainerClass = bannerImage
            ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-white/95 border-2 border-white/85 shadow-lg'
            : 'w-11 h-11 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/90 shrink-0 shadow-2xs flex items-center justify-center';
          logoHtml = '<div class="' + logoContainerClass + '"><img src="' + logoImage + '" class="w-full h-full object-contain p-0.5" alt="" /></div>';
        }

        var titleHtml = (project.name && project.name.trim())
          ? '<h1 class="text-lg sm:text-2xl font-bold tracking-tight truncate leading-tight transition-colors ' + (bannerImage ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]' : 'text-stone-900') + '">' + escapeHtml(project.name) + '</h1>'
          : '';

        var subtitleHtml = (subtitle && subtitle.trim())
          ? '<p class="text-xs sm:text-sm truncate leading-normal mt-0.5 transition-colors ' + (bannerImage ? 'text-stone-100/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]' : 'text-stone-600 dark:text-stone-300 font-medium') + '">' + escapeHtml(subtitle) + '</p>'
          : '';

        // AJUSTE 3 y 5: Promociones invisibles si están vacías o si estamos en la vista de Productos Favoritos
        var validPromos = (customBlocks || []).filter(function(b) {
          return (b.title && b.title.trim()) || (b.content && b.content.trim()) || (b.image && b.image.trim());
        });
        var promosHtml = '';
        if (!showOnlyFavorites && validPromos.length > 0) {
          var promoCardsHtml = validPromos.map(function(promo) {
            var imgHtml = (promo.image && promo.image.trim())
              ? '<img src="' + promo.image + '" alt="" class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain border border-stone-100 bg-stone-50 shrink-0" />'
              : '';
            var badgeHtml = (promo.badge && promo.badge.trim())
              ? '<span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold uppercase">' + escapeHtml(promo.badge) + '</span>'
              : '';
            var titleHtml = (promo.title && promo.title.trim())
              ? '<h3 class="font-bold text-sm sm:text-base text-stone-900 truncate">' + escapeHtml(promo.title) + '</h3>'
              : '';
            var contentHtml = (promo.content && promo.content.trim())
              ? '<p class="text-xs text-stone-600 line-clamp-2 leading-relaxed">' + escapeHtml(promo.content) + '</p>'
              : '';

            var cardWidthClass = validPromos.length === 1
              ? 'w-full'
              : 'w-[85%] sm:w-[460px] md:w-[500px] shrink-0 snap-start';

            return '<div onclick="openPromoDetail(\\'' + promo.id + '\\')" class="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer hover:border-stone-300 hover:shadow-md transition-all active:scale-[0.99] ' + cardWidthClass + '" title="Ver detalle de la promoción">' +
              imgHtml +
              '<div class="flex-1 min-w-0">' +
                (badgeHtml || titleHtml ? '<div class="flex items-center gap-2 mb-1">' + badgeHtml + titleHtml + '</div>' : '') +
                contentHtml +
              '</div>' +
            '</div>';
          }).join('');

          promosHtml = '<div class="relative mb-3.5 sm:mb-4 overflow-hidden">' +
            '<div id="promos-slider" class="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 scrollbar-none" style="scrollbar-width: none; -ms-overflow-style: none;">' +
              promoCardsHtml +
            '</div>' +
          '</div>';
        }

        var footerRaw = design.footerText !== undefined && design.footerText !== '' ? design.footerText : ('© ' + new Date().getFullYear() + ' ' + project.name + '. Catálogo Digital.');
        var footerHtml = (footerRaw && footerRaw.trim())
          ? '<footer class="catalog-footer w-full shrink-0 mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 pt-6 pb-12 sm:pb-8 px-4 text-center text-xs font-medium text-stone-700 dark:text-stone-300"><div class="max-w-7xl mx-auto px-2 leading-relaxed break-words whitespace-normal"><p class="leading-relaxed break-words whitespace-normal">' + escapeHtml(footerRaw.trim()) + '</p></div></footer>'
          : '';

        var html = [
          '<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">',
            '<div class="relative overflow-hidden transition-all ' + (bannerImage ? 'py-5 sm:py-7 px-4 sm:px-6' : 'py-3.5 px-4 sm:px-6') + '">',
              bannerBgHtml,
              '<div class="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">',
                '<div class="flex items-center gap-3.5 min-w-0">',
                  logoHtml,
                  '<div class="min-w-0">',
                    titleHtml,
                    subtitleHtml,
                  '</div>',
                '</div>',
                '<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">',
                  '<!-- AJUSTE 4: Botón Modo Claro / Oscuro (Sol / Luna) al lado del menú hamburguesa -->',
                  '<button type="button" id="btn-theme-toggle" onclick="toggleTheme()" class="p-2 rounded-xl transition-colors cursor-pointer ' + (bannerImage ? 'bg-white/85 hover:bg-white text-stone-800 shadow-sm' : 'text-stone-700 hover:bg-stone-100') + '" title="' + (currentTheme === 'dark' ? 'Modo oscuro activado (clic para cambiar a claro)' : 'Modo claro activado (clic para cambiar a oscuro)') + '" aria-label="' + (currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro') + '">',
                    (currentTheme === 'dark'
                      ? '<svg class="w-6 h-6 text-amber-300 fill-amber-300/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
                      : '<svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                    ),
                  '</button>',
                  '<button type="button" id="btn-header-menu" onclick="openMainMenu(event)" class="p-2 rounded-xl transition-colors cursor-pointer ' + (bannerImage ? 'bg-white/85 hover:bg-white text-stone-800 shadow-sm' : 'text-stone-700 hover:bg-stone-100') + '" aria-label="Abrir Menú">',
                    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
                  '</button>',
                '</div>',
              '</div>',
            '</div>',

            '<div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 ' + (bannerImage ? 'border-t border-stone-200/70 bg-white/95' : 'pt-1 pb-3') + '">',
              '<div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">',
                '<div class="flex items-center gap-2 flex-1 relative z-50" style="position: relative; z-index: 60;">',
                  '<!-- 1. [ Buscador ] -->',
                  '<div class="relative flex-1 min-w-0">',
                    '<input type="text" id="search-input" value="' + escapeHtml(searchQuery) + '" placeholder="Buscar..." class="w-full text-xs sm:text-sm pl-4 pr-4 py-2 bg-stone-50 border border-stone-200/90 rounded-xl focus:outline-none text-stone-900 dark:text-stone-100" />',
                  '</div>',

                  '<!-- 2. [ Filtros ] -->',
                  '<div class="relative shrink-0 z-50" id="sort-dropdown-container" style="position: relative; z-index: 70;">',
                    '<button type="button" onclick="toggleSortMenu(event)" id="btn-catalog-sort" class="p-2 sm:px-3 sm:py-2 border rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' + (isSortMenuOpen || currentSort !== 'default' ? 'bg-stone-900 text-white border-stone-900 shadow-xs' : 'bg-stone-50/90 border-stone-200/90 hover:bg-stone-100 text-stone-700 dark:text-stone-200') + '" title="Ordenar catálogo">',
                      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>',
                      '<span class="hidden md:inline text-xs font-semibold">Ordenar</span>',
                    '</button>',
                    (isSortMenuOpen ? (
                      '<div class="catalog-dropdown-menu absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl py-1.5 z-[100] overflow-hidden" style="position: absolute; top: 100%; margin-top: 0.5rem; z-index: 999;" onclick="event.stopPropagation()">' +
                        '<div class="catalog-dropdown-header px-3.5 py-2 text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/90">' +
                          'Ordenar por' +
                        '</div>' +
                        sortOptionsData.map(function(opt) {
                          var isSelected = currentSort === opt.id;
                          return '<button type="button" onclick="setCatalogSort(\\'' + opt.id + '\\', event)" class="catalog-dropdown-item w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ' + (isSelected ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60') + '">' +
                            '<span class="w-5 h-5 flex items-center justify-center shrink-0">' + opt.icon + '</span>' +
                            '<span class="flex-1 truncate">' + escapeHtml(opt.label) + '</span>' +
                            (isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-amber-400 shrink-0"></span>' : '') +
                          '</button>';
                        }).join('') +
                      '</div>'
                    ) : '') +
                  '</div>',

                  '<!-- 3. [ Cuadrículas ] -->',
                  '<div class="relative shrink-0 z-50" id="grid-dropdown-container" style="position: relative; z-index: 70;">',
                    '<button type="button" onclick="toggleGridMenu(event)" id="btn-catalog-grid" class="p-2 sm:px-3 sm:py-2 border rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' + (isGridMenuOpen || currentGrid !== (design.layoutGrid || '2x2') ? 'bg-stone-900 text-white border-stone-900 shadow-xs' : 'bg-stone-50/90 border-stone-200/90 hover:bg-stone-100 text-stone-700 dark:text-stone-200') + '" title="Cambiar cuadrícula (1, 2, 3 columnas)">',
                      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
                      '<span class="hidden md:inline text-xs font-semibold">Cuadrícula</span>',
                    '</button>',
                    (isGridMenuOpen ? (
                      '<div class="catalog-dropdown-menu absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl py-1.5 z-[100] overflow-hidden" style="position: absolute; top: 100%; margin-top: 0.5rem; z-index: 999;" onclick="event.stopPropagation()">' +
                        '<div class="catalog-dropdown-header px-3.5 py-2 text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/90">' +
                          'Cuadrícula' +
                        '</div>' +
                        gridOptionsData.map(function(opt) {
                          var isSelected = currentGrid === opt.id;
                          return '<button type="button" onclick="setCatalogGrid(\\'' + opt.id + '\\', event)" class="catalog-dropdown-item w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left ' + (isSelected ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold' : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60') + '">' +
                            '<span class="w-5 h-5 flex items-center justify-center shrink-0">' + opt.icon + '</span>' +
                            '<span class="flex-1 truncate">' + escapeHtml(opt.label) + '</span>' +
                            (isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-amber-400 shrink-0"></span>' : '') +
                          '</button>';
                        }).join('') +
                      '</div>'
                    ) : '') +
                  '</div>',
                '</div>',
                categories.length > 0 ? (
                  '<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none relative z-10" style="position: relative; z-index: 10;">' +
                    categories.map(function(cat) {
                      var isAct = currentCategory === cat && !showOnlyFavorites;
                      var pillStyle = isAct
                        ? (currentTheme === 'dark' ? 'background-color:#211F1E;color:#D49B72;border-color:#D49B72;' : 'background-color:' + primaryColor + ';')
                        : (currentTheme === 'dark' ? 'background-color:#1C1A19;color:#827B76;border-color:#302D2B;' : '');
                      return '<button type="button" onclick="selectCat(\\'' + escapeHtml(cat) + '\\')" class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ' + (isAct ? 'cat-pill-active text-white shadow-xs border-transparent' : 'cat-pill-inactive bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50') + '" style="' + pillStyle + '">' + escapeHtml(cat) + '</button>';
                    }).join('') +
                  '</div>'
                ) : '',
              '</div>',
            '</div>',
          '</header>',

          '<main class="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-6 flex-1 w-full">',
            (showOnlyFavorites ? (
              '<div class="mb-4 flex items-center gap-3.5 bg-white dark:bg-stone-900 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">' +
                '<button type="button" onclick="exitFavoritesSubView()" class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400" title="Regresar al Inicio" aria-label="Regresar al Inicio">' +
                  '<svg class="w-5 h-5 sm:w-6 sm:h-6 text-stone-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
                '</button>' +
                '<div class="flex items-center gap-2">' +
                  '<h2 class="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">Productos favoritos</h2>' +
                  '<svg class="fav-icon-heart fav-is-active w-5 h-5 shrink-0 text-stone-900 dark:text-white" fill="#ef4444" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' +
                '</div>' +
              '</div>'
            ) : ''),
            promosHtml,
            (filtered.length === 0 ? (function() {
              var emptyMsg = '';
              var emptyIconSvg = '';

              if (products.length === 0) {
                emptyMsg = 'El catálogo está vacío';
                emptyIconSvg = '<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>';
              } else if (showOnlyFavorites) {
                emptyMsg = 'No se encontraron productos seleccionados como favoritos';
                emptyIconSvg = '<svg class="fav-icon-heart fav-is-empty w-6 h-6 text-stone-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
              } else {
                var hasSearch = searchQuery && searchQuery.trim().length > 0;
                var hasCat = currentCategory !== 'TODOS';

                if (hasSearch && hasCat) {
                  emptyMsg = 'No hay productos que coincidan con los filtros aplicados';
                  emptyIconSvg = '<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
                } else if (hasSearch) {
                  emptyMsg = 'No se encontraron productos para tu búsqueda';
                  emptyIconSvg = '<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
                } else if (hasCat) {
                  emptyMsg = 'No hay productos en esta categoría';
                  emptyIconSvg = '<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>';
                } else {
                  emptyMsg = 'No hay productos que coincidan con los filtros aplicados';
                  emptyIconSvg = '<svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
                }
              }

              var hasFiltersToReset = (searchQuery && searchQuery.trim().length > 0) || showOnlyFavorites || currentCategory !== 'TODOS';
              var resetBtn = hasFiltersToReset
                ? '<button type="button" onclick="resetAllCatalogFilters()" class="mt-4 px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors">Regresar al Inicio</button>'
                : '';

              return '<div class="text-center py-16 bg-white rounded-2xl border border-stone-200/70 p-8 shadow-xs max-w-lg mx-auto">' +
                '<div class="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center">' +
                  emptyIconSvg +
                '</div>' +
                '<p class="text-stone-600 text-sm font-medium">' + escapeHtml(emptyMsg) + '</p>' +
                resetBtn +
              '</div>';
            })() : (
              '<div class="grid ' + (currentGrid === '1x1' ? 'grid-cols-1 gap-4 sm:gap-6 max-w-3xl mx-auto w-full' : currentGrid === '3x3' ? 'grid-cols-3 gap-2 sm:gap-3 md:gap-5' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6') + '">'
            )),
              (function() {
                var maxViews = 0;
                products.forEach(function(item) {
                  var v = productViews[item.id] || item.views || item.viewsCount || 0;
                  if (v > maxViews) maxViews = v;
                });

                return filtered.map(function(p) {
                  var isFav = favorites.indexOf(p.id) >= 0;
                  var views = productViews[p.id] || 0;
                  var isTop = maxViews > 0 && views === maxViews;
                  var catHtml = (p.category && p.category.trim())
                    ? '<div class="mb-1"><span class="text-[10px] sm:text-[11px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider truncate block">' + escapeHtml(p.category) + '</span></div>'
                    : '';
                  var descHtml = (currentGrid === '1x1' && p.description && p.description.trim())
                    ? '<p class="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-3">' + escapeHtml(p.description) + '</p>'
                    : '';
                  var imgThumb = (p.images && p.images[0] && p.images[0].trim())
                    ? '<img src="' + p.images[0] + '" class="absolute inset-0 w-full h-full object-contain group-hover:scale-103 transition-transform duration-300" alt="" />'
                    : '<div class="absolute inset-0 w-full h-full flex items-center justify-center text-stone-300"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                  var cardPaddingClass = currentGrid === '3x3' ? 'p-2 sm:p-3 md:p-4' : currentGrid === '2x2' ? 'p-2.5 sm:p-3.5 md:p-4' : 'p-4 sm:p-5';

                  return [
                    '<div class="product-card bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group cursor-pointer" onclick="openProductDetail(\\'' + p.id + '\\')">',
                      '<div class="relative w-full aspect-card bg-transparent overflow-hidden shrink-0">',
                        imgThumb,
                        '<div class="btn-views-card absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/80 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 shadow-sm z-10 transition-colors">',
                          '<span id="view-icon-' + p.id + '">' + (isTop ? flameSvg : eyeSvg) + '</span>',
                          '<span id="view-badge-' + p.id + '" class="font-bold text-stone-700 dark:text-stone-200">' + views + '</span>',
                        '</div>',
                        '<button type="button" ontouchstart="event.stopPropagation()" onpointerdown="event.stopPropagation()" onmousedown="event.stopPropagation()" onclick="favClick(\\'' + p.id + '\\', event)" class="btn-favorite-card absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm rounded-lg sm:rounded-xl text-stone-900 dark:text-white border border-stone-200/80 dark:border-stone-700/80 transition-colors shadow-sm cursor-pointer z-10" title="Guardar favorito">',
                          '<svg class="fav-icon-heart ' + (isFav ? 'fav-is-active scale-110' : 'fav-is-empty') + ' w-4 h-4 text-stone-900 dark:text-white" fill="' + (isFav ? '#ef4444' : 'none') + '" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
                        '</button>',
                      '</div>',
                      '<div class="' + cardPaddingClass + ' flex-1 flex flex-col justify-between">',
                        '<div>',
                          '<!-- AJUSTE 2: NOMBRE del producto primero -->',
                          '<h3 class="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-base leading-snug line-clamp-1 mb-1">' + escapeHtml(p.name) + '</h3>',
                          '<!-- AJUSTE 2: CATEGORÍA después -->',
                          catHtml,
                          descHtml,
                        '</div>',
                        '<div class="pt-2 sm:pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1 sm:gap-2">',
                          '<span class="text-xs sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">$' + p.price + ' <span class="text-[10px] sm:text-xs font-medium text-stone-600 dark:text-stone-300">' + (p.currency || 'USD') + '</span></span>',
                          '<div class="flex items-center gap-1 shrink-0">',
                            '<button type="button" ontouchstart="event.stopPropagation()" onpointerdown="event.stopPropagation()" onmousedown="event.stopPropagation()" onclick="shareProductClick(\\'' + p.id + '\\', event)" class="btn-share-card p-1.5 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white rounded-lg sm:rounded-xl border border-stone-200/80 dark:border-stone-700/80 transition-colors shadow-2xs cursor-pointer flex items-center justify-center" title="Compartir por WhatsApp">',
                              '<svg class="icon-share-neutral w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
                            '</button>',
                            (currentGrid === '1x1' ? '<span class="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white rounded-lg sm:rounded-xl shadow-2xs" style="background-color: ' + primaryColor + '">Detalles</span>' : ''),
                          '</div>',
                        '</div>',
                      '</div>',
                    '</div>'
                  ].join('');
                }).join('');
              })(),
            (filtered.length === 0 ? '' : '</div>'),
          '</main>',

          footerHtml
        ].join('');

        app.innerHTML = html;

        // Attach header event listeners
        var searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            if (searchQuery && searchQuery.trim().length > 0) {
              pushNavView('search');
            } else {
              removeNavView('search');
            }
            render();
            var newEl = document.getElementById('search-input');
            if (newEl) {
              newEl.focus();
              newEl.setSelectionRange(newEl.value.length, newEl.value.length);
            }
          });
        }

        var btnFavs = document.getElementById('btn-toggle-favs');
        if (btnFavs) {
          btnFavs.addEventListener('click', function() {
            showOnlyFavorites = !showOnlyFavorites;
            if (showOnlyFavorites) {
              pushNavView('favorites');
            } else {
              removeNavView('favorites');
            }
            render();
          });
        }

        var btnShare = document.getElementById('btn-share-catalog');
        if (btnShare) {
          btnShare.addEventListener('click', function() {
            var msg = '¡Hola! Te comparto nuestro catálogo ' + project.name + ': ' + window.location.href;
            window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
          });
        }

        // Auto-reproducción de promociones horizontales cada 5 segundos
        if (window._promoInterval) {
          clearInterval(window._promoInterval);
        }
        var promoSlider = document.getElementById('promos-slider');
        if (promoSlider && promoSlider.children && promoSlider.children.length > 1) {
          window._promoInterval = setInterval(function() {
            var slider = document.getElementById('promos-slider');
            if (!slider) return;
            var maxScroll = slider.scrollWidth - slider.clientWidth;
            var step = slider.clientWidth * 0.85;
            if (slider.scrollLeft >= maxScroll - 15) {
              slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              slider.scrollTo({ left: slider.scrollLeft + step, behavior: 'smooth' });
            }
          }, 5000);
        }
      }

      window.toggleSortMenu = function(e) {
        if (e) e.stopPropagation();
        isSortMenuOpen = !isSortMenuOpen;
        isGridMenuOpen = false;
        if (isSortMenuOpen) {
          pushNavView('dropdown');
        } else {
          removeNavView('dropdown');
        }
        render();
      };

      window.setCatalogSort = function(sortKey, e) {
        if (e) e.stopPropagation();
        currentSort = sortKey;
        isSortMenuOpen = false;
        removeNavView('dropdown');
        if (sortKey !== 'default') {
          pushNavView('sort');
        } else {
          removeNavView('sort');
        }
        render();
      };

      window.toggleGridMenu = function(e) {
        if (e) e.stopPropagation();
        isGridMenuOpen = !isGridMenuOpen;
        isSortMenuOpen = false;
        if (isGridMenuOpen) {
          pushNavView('dropdown');
        } else {
          removeNavView('dropdown');
        }
        render();
      };

      window.setCatalogGrid = function(gridKey, e) {
        if (e) e.stopPropagation();
        currentGrid = gridKey;
        isGridMenuOpen = false;
        removeNavView('dropdown');
        render();
      };

      document.addEventListener('click', function(e) {
        var needsRender = false;
        if (isSortMenuOpen) {
          var sortContainer = document.getElementById('sort-dropdown-container');
          if (sortContainer && !sortContainer.contains(e.target)) {
            isSortMenuOpen = false;
            needsRender = true;
          }
        }
        if (isGridMenuOpen) {
          var gridContainer = document.getElementById('grid-dropdown-container');
          if (gridContainer && !gridContainer.contains(e.target)) {
            isGridMenuOpen = false;
            needsRender = true;
          }
        }
        if (needsRender) {
          if (!isSortMenuOpen && !isGridMenuOpen) {
            removeNavView('dropdown');
          }
          render();
        }
      });

      function getMenuIconSvg(opt) {
        var iconName = (opt && opt.iconName) || 'Info';
        var optId = (opt && opt.id) || '';
        var customColor = (opt && opt.color && opt.color !== 'neutral') ? opt.color : '';
        var neutralStroke = currentTheme === 'dark' ? '#ffffff' : '#1c1917';
        var effectiveStroke = customColor || neutralStroke;

        if (iconName === 'Heart' || optId === 'favorites') {
          var heartFill = '#ef4444';
          var heartClasses = customColor
            ? 'w-4 h-4 shrink-0'
            : 'fav-icon-heart fav-is-active w-4 h-4 text-stone-900 dark:text-white shrink-0';
          return '<svg class="' + heartClasses + '" style="color: ' + effectiveStroke + '; stroke: ' + effectiveStroke + '; fill: ' + heartFill + ';" fill="' + heartFill + '" stroke="' + effectiveStroke + '" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path style="stroke: ' + effectiveStroke + '; fill: ' + heartFill + ';" fill="' + heartFill + '" stroke="' + effectiveStroke + '" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
        }
        if (iconName === 'Share2' || optId === 'share') {
          var shareClasses = customColor ? 'w-4 h-4 shrink-0' : 'icon-share-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0';
          return '<svg class="' + shareClasses + '" style="color: ' + effectiveStroke + '; stroke: ' + effectiveStroke + '; fill: none;" fill="none" stroke="' + effectiveStroke + '" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>';
        }

        var iconColorStyle = customColor ? ('style="color: ' + customColor + '; stroke: ' + customColor + ';"') : '';
        if (iconName === 'Phone') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-emerald-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
        }
        if (iconName === 'MessageCircle') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-emerald-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
        }
        if (iconName === 'Building') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-amber-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>';
        }
        if (iconName === 'Info') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-indigo-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
        }
        if (iconName === 'HelpCircle') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-violet-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';
        }
        if (iconName === 'Star') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-amber-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        }
        if (iconName === 'Sparkles') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-amber-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>';
        }
        if (iconName === 'ShoppingBag') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-rose-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
        }
        if (iconName === 'Package') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-amber-600') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
        }
        if (iconName === 'Tag') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-emerald-600') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>';
        }
        if (iconName === 'Globe') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-blue-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
        }
        if (iconName === 'Mail') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-indigo-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
        }
        if (iconName === 'MapPin') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-red-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
        }
        if (iconName === 'BookOpen') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-violet-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
        }
        if (iconName === 'Award') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-amber-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
        }
        if (iconName === 'Gift') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-pink-500') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>';
        }
        if (iconName === 'LayoutGrid') {
          return '<svg class="w-4 h-4 ' + (customColor ? '' : 'text-stone-900 dark:text-white') + ' shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>';
        }
        return '<svg class="w-4 h-4 text-stone-500 shrink-0" ' + iconColorStyle + ' fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
      }

      window.openMainMenu = function(e) {
        if (e) e.stopPropagation();
        var existing = document.getElementById('drawer-overlay');
        if (existing) existing.remove();

        pushNavView('menu');

        var logoSmall = logoImage
          ? '<img src="' + logoImage + '" alt="" class="w-8 h-8 rounded-lg object-contain border border-stone-200" />'
          : '';

        var optionsHtml = menuOpts.map(function(opt) {
          var iconSvg = getMenuIconSvg(opt);
          return '<button type="button" onclick="handleMenuOptionClick(\\'' + opt.id + '\\')" class="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors text-left cursor-pointer">' +
            iconSvg +
            '<span>' + escapeHtml(opt.label) + '</span>' +
          '</button>';
        }).join('');

        var div = document.createElement('div');
        div.id = 'drawer-overlay';
        div.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn';
        div.style.overscrollBehavior = 'contain';
        div.onclick = function() { window.closeMainMenu(); };

        div.innerHTML = [
          '<div id="drawer-panel" style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain w-80 max-w-full bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slideInRight" onclick="event.stopPropagation()">',
            '<div>',
              '<div class="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">',
                '<div class="flex items-center gap-2.5">',
                  logoSmall,
                  '<h3 class="font-bold text-stone-900 dark:text-stone-100 text-base truncate">' + escapeHtml(project.name) + '</h3>',
                '</div>',
                '<button type="button" onclick="closeMainMenu()" class="p-1 text-stone-500 hover:text-stone-800 dark:text-stone-300 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer">',
                  '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
                '</button>',
              '</div>',

              '<div class="space-y-1.5">',
                optionsHtml,
                '<button type="button" onclick="closeMainMenu();openExitModal()" class="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-left cursor-pointer">',
                  '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
                  '<span>Salir del Catálogo</span>',
                '</button>',
              '</div>',
            '</div>',

            '<div class="drawer-footer-company pt-4 border-t border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 text-center">' +
              escapeHtml((project.contact && project.contact.company) || project.name) +
            '</div>',
          '</div>'
        ].join('');

        document.body.appendChild(div);
        syncBodyScrollLock();
      };

      window.closeMainMenu = function() {
        var overlay = document.getElementById('drawer-overlay');
        if (overlay) overlay.remove();
        openedFromMenu = false;
        removeNavView('menu');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      window.exitFavoritesSubView = function() {
        showOnlyFavorites = false;
        openedFromMenu = false;
        removeNavView('favorites');
        removeNavView('menu');
        render();
      };

      window.handleMenuOptionClick = function(id) {
        var overlay = document.getElementById('drawer-overlay');
        if (overlay) overlay.remove();
        openedFromMenu = false;
        removeNavView('menu');
        syncBodyScrollLock();

        if (id === 'all_products') {
          openedFromMenu = false;
          removeNavView('menu');
          window.resetAllCatalogFilters();
        } else if (id === 'favorites') {
          showOnlyFavorites = true;
          currentCategory = 'TODOS';
          removeNavView('category');
          pushNavView('favorites');
          render();
        } else if (id === 'share') {
          openedFromMenu = false;
          removeNavView('menu');
          shareCatalog();
        } else if (id === 'whatsapp') {
          openedFromMenu = false;
          removeNavView('menu');
          var phone = (project.contact && project.contact.phone) ? project.contact.phone.replace(/[^0-9]/g, '') : '';
          var opt = menuOpts.find(function(o) { return o.id === 'whatsapp'; });
          var rawMsg = (opt && opt.content) || (project.messages && project.messages.contactWhatsapp) || 'Hola, me interesa ver más detalles de tu catálogo.';
          var catalogUrl = getPublicCatalogUrl();
          var msg = String(rawMsg)
            .split('{nombre_catalogo}').join(project.name || '')
            .split('{empresa}').join((project.contact && project.contact.company) || project.name || '')
            .split('{url}').join(catalogUrl)
            .trim();
          var waUrl = phone ? ('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg)) : ('https://wa.me/?text=' + encodeURIComponent(msg));
          openWhatsAppSmooth(waUrl);
        } else if (id === 'company') {
          openInfoModal('company');
        } else if (id === 'about') {
          openInfoModal('about');
        } else if (id === 'how_it_works') {
          openInfoModal('how_it_works');
        }
      };

      window.closePromoDetailModal = function() {
        var existing = document.getElementById('promo-detail-modal');
        if (existing) existing.remove();
        removeNavView('promo');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      // AJUSTE 2: Vista Detallada de la Promoción en Modal
      window.openPromoDetail = function(promoId) {
        var existing = document.getElementById('promo-detail-modal');
        if (existing) existing.remove();

        var promo = null;
        for (var i = 0; i < customBlocks.length; i++) {
          if (customBlocks[i].id === promoId) {
            promo = customBlocks[i];
            break;
          }
        }
        if (!promo) return;

        pushNavView('promo');

        var div = document.createElement('div');
        div.id = 'promo-detail-modal';
        div.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn';
        div.style.overscrollBehavior = 'contain';
        div.onclick = function() { window.closePromoDetailModal(); };

        var badgeHtml = promo.badge && promo.badge.trim()
          ? '<span class="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-bold uppercase tracking-wider">' + escapeHtml(promo.badge) + '</span>'
          : '<span class="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-md text-xs font-bold uppercase tracking-wider">Promoción Especial</span>';

        var imgHtml = promo.image && promo.image.trim()
          ? '<div class="w-full rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/60 flex items-center justify-center max-h-72 mb-4"><img src="' + promo.image + '" alt="' + escapeHtml(promo.title || '') + '" class="w-full max-h-72 object-contain" /></div>'
          : '';

        var contentHtml = promo.content && promo.content.trim()
          ? '<div class="text-sm text-stone-700 leading-relaxed whitespace-pre-line">' + escapeHtml(promo.content) + '</div>'
          : '';

        div.innerHTML = [
          '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-stone-100 max-h-[90vh] flex flex-col animate-fadeIn" onclick="event.stopPropagation()">',
            '<div class="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 shrink-0">',
              '<div class="flex items-center gap-2 flex-wrap">' + badgeHtml + '</div>',
              '<button type="button" onclick="closePromoDetailModal()" class="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer" aria-label="Cerrar">',
                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
              '</button>',
            '</div>',
            '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain overflow-y-auto py-4 flex-1 space-y-4 pr-1">',
              '<h2 class="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">' + escapeHtml(promo.title || 'Detalle de la Promoción') + '</h2>',
              imgHtml,
              contentHtml,
            '</div>',
            '<div class="pt-3 border-t border-stone-100 flex justify-end shrink-0">',
              '<button type="button" onclick="closePromoDetailModal()" class="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs">Cerrar</button>',
            '</div>',
          '</div>'
        ].join('');

        document.body.appendChild(div);
        syncBodyScrollLock();
      };

      window.closeInfoModal = function() {
        var existing = document.getElementById('standalone-info-modal');
        if (existing) existing.remove();
        openedFromMenu = false;
        removeNavView('info');
        removeNavView('menu');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      window.openInfoModal = function(type) {
        var existing = document.getElementById('standalone-info-modal');
        if (existing) existing.remove();

        pushNavView('info');

        var optItem = menuOpts.find(function(o) { return o.id === type; });

        var div = document.createElement('div');
        div.id = 'standalone-info-modal';
        div.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn';
        div.style.overscrollBehavior = 'contain';
        div.onclick = function() { window.closeInfoModal(); };

        if (type === 'how_it_works') {
          var defaultSteps = [
            {
              title: 'Explora sin compromiso',
              desc: 'Este es un catálogo 100% de exhibición.'
            },
            {
              title: 'Contacta si te gusta',
              desc: '¿Viste algo que te encantó? Puedes contactarnos y pedir más detalles.'
            },
            {
              title: 'Encuentra lo que buscas',
              desc: 'Usa el buscador por nombre, categoría o material para ir directo al grano.'
            },
            {
              title: 'Guarda tus favoritos',
              desc: 'Haz clic en el corazón ❤️ para marcar tus piezas preferidas y encontrarlas fácilmente después.'
            },
            {
              title: 'Comparte con quien quieras',
              desc: '¿Tienes un amigo al que le encantaría esto? Compártelo directamente por WhatsApp con un solo toque.'
            }
          ];

          var rawSteps = (optItem && optItem.steps && Array.isArray(optItem.steps) && optItem.steps.length > 0)
            ? optItem.steps
            : defaultSteps;

          var stepsHtml = rawSteps.map(function(s, idx) {
            return '<div class="flex items-start gap-3 p-3 bg-stone-50/80 rounded-xl border border-stone-200/60">' +
              '<span class="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">' + (idx + 1) + '</span>' +
              '<div class="min-w-0 flex-1">' +
                '<h4 class="font-bold text-stone-900 text-xs sm:text-sm">' + escapeHtml(s.title) + '</h4>' +
                '<p class="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">' + escapeHtml(s.desc) + '</p>' +
              '</div>' +
            '</div>';
          }).join('');

          var howTitle = (optItem && optItem.label) ? optItem.label : '¿Cómo funciona?';
          var howSub = (optItem && optItem.content) ? optItem.content : '¿Cómo usar este catálogo?';

          div.innerHTML = [
            '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-stone-100 max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">',
              '<div class="flex items-center justify-between pb-3.5 border-b border-stone-100 shrink-0">',
                '<div class="flex items-center gap-3">',
                  '<div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/50">',
                    '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                  '</div>',
                  '<div>',
                    '<h3 class="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">' + escapeHtml(howTitle) + '</h3>',
                    '<p class="text-xs text-stone-600 dark:text-stone-300 font-medium mt-0.5">' + escapeHtml(howSub) + '</p>',
                  '</div>',
                '</div>',
                '<button type="button" onclick="closeInfoModal()" class="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer" aria-label="Cerrar">',
                  '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
                '</button>',
              '</div>',
              '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain overflow-y-auto pt-3.5 pb-1 space-y-2.5 flex-1 pr-1">',
                '<p class="text-xs text-stone-600 leading-relaxed mb-3">Sigue estos sencillos pasos para sacarle el máximo provecho a nuestra plataforma de exhibición digital:</p>',
                stepsHtml,
              '</div>',
            '</div>'
          ].join('');

          document.body.appendChild(div);
          syncBodyScrollLock();
          return;
        }

        var title = '';
        var content = '';

        if (type === 'company') {
          title = (optItem && optItem.label) ? optItem.label : 'Información de la Empresa';
          var lines = [];
          if (project.contact && project.contact.company) lines.push('<p><strong class="text-stone-800">Empresa:</strong> ' + escapeHtml(project.contact.company) + '</p>');
          if (project.contact && project.contact.name) lines.push('<p><strong class="text-stone-800">Contacto:</strong> ' + escapeHtml(project.contact.name) + '</p>');
          if (project.contact && project.contact.phone) lines.push('<p><strong class="text-stone-800">Teléfono:</strong> ' + escapeHtml(project.contact.phone) + '</p>');
          if (project.contact && project.contact.email) lines.push('<p><strong class="text-stone-800">Correo:</strong> ' + escapeHtml(project.contact.email) + '</p>');
          if (project.contact && project.contact.address) lines.push('<p><strong class="text-stone-800">Ubicación:</strong> ' + escapeHtml(project.contact.address) + '</p>');
          if (project.contact && project.contact.website) lines.push('<p><strong class="text-stone-800">Web:</strong> ' + escapeHtml(project.contact.website) + '</p>');
          content = '<div class="space-y-3 text-xs text-stone-600">' + (lines.length > 0 ? lines.join('') : '<p>Sin información de contacto registrada.</p>') + '</div>';
        } else if (type === 'about') {
          title = (optItem && optItem.label) ? optItem.label : 'Información del Catálogo';
          content = '<div class="text-xs text-stone-600 leading-relaxed whitespace-pre-line">' + escapeHtml(project.description || 'Catálogo de exhibición de productos de alta calidad.') + '</div>';
        }

        div.innerHTML = [
          '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-100 flex flex-col" onclick="event.stopPropagation()">',
            '<div class="flex items-center justify-between pb-3 border-b border-stone-100 mb-4 shrink-0">',
              '<h3 class="font-bold text-stone-900 text-base">' + escapeHtml(title) + '</h3>',
              '<button type="button" onclick="closeInfoModal()" class="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer" aria-label="Cerrar">',
                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
              '</button>',
            '</div>',
            '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain overflow-y-auto flex-1">' + content + '</div>',
          '</div>'
        ].join('');

        document.body.appendChild(div);
        syncBodyScrollLock();
      };

      function openWhatsAppSmooth(waUrl) {
        var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        var isStandaloneTop = false;
        try {
          isStandaloneTop = (window.self === window.top);
        } catch(e) {
          isStandaloneTop = false;
        }
        if (isMobile && isStandaloneTop) {
          window.location.href = waUrl;
        } else {
          var a = document.createElement('a');
          a.href = waUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
            if (a.parentNode) a.parentNode.removeChild(a);
          }, 100);
        }
      }

      function getPublicCatalogUrl() {
        var href = (window.location && window.location.href) ? String(window.location.href).split('#')[0] : '';
        var lower = href.toLowerCase();
        if (lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0) {
          return href;
        }
        if (project.contact && project.contact.website && String(project.contact.website).trim().length > 0) {
          var web = String(project.contact.website).trim();
          var lowerWeb = web.toLowerCase();
          if (lowerWeb.indexOf('http://') !== 0 && lowerWeb.indexOf('https://') !== 0) {
            return 'https://' + web;
          }
          return web;
        }
        return '';
      }

      function makeSafeFileName(name, ext) {
        var raw = String(name || 'producto').toLowerCase();
        var allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
        var out = '';
        var lastWasDash = false;
        for (var i = 0; i < raw.length; i++) {
          var ch = raw.charAt(i);
          if (ch === 'á') ch = 'a';
          else if (ch === 'é') ch = 'e';
          else if (ch === 'í') ch = 'i';
          else if (ch === 'ó') ch = 'o';
          else if (ch === 'ú' || ch === 'ü') ch = 'u';
          else if (ch === 'ñ') ch = 'n';

          if (allowed.indexOf(ch) >= 0) {
            out += ch;
            lastWasDash = false;
          } else if (!lastWasDash && out.length > 0) {
            out += '-';
            lastWasDash = true;
          }
        }
        if (out.charAt(out.length - 1) === '-') {
          out = out.substring(0, out.length - 1);
        }
        if (!out) out = 'producto';
        return out + (ext || '.jpg');
      }

      var productFileCache = {};

      function dataUrlToFileSync(dataUrl, productName) {
        if (!dataUrl || typeof dataUrl !== 'string') return null;
        if (dataUrl.indexOf('data:image/') !== 0) return null;
        var commaIdx = dataUrl.indexOf(',');
        if (commaIdx === -1) return null;
        var header = dataUrl.substring(0, commaIdx).toLowerCase();
        var body = dataUrl.substring(commaIdx + 1);
        if (header.indexOf(';base64') === -1) return null;

        var mime = 'image/jpeg';
        var ext = '.jpg';
        if (header.indexOf('data:image/png') === 0) {
          mime = 'image/png';
          ext = '.png';
        } else if (header.indexOf('data:image/jpeg') === 0 || header.indexOf('data:image/jpg') === 0) {
          mime = 'image/jpeg';
          ext = '.jpg';
        } else {
          return null;
        }

        try {
          var bstr = atob(body);
          var n = bstr.length;
          var u8arr = new Uint8Array(n);
          for (var i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          var fname = makeSafeFileName(productName, ext);
          return new File([u8arr], fname, { type: mime, lastModified: Date.now() });
        } catch (e) {
          return null;
        }
      }

      function imageElementToJpegFileSync(imgEl, productName) {
        if (!imgEl || !imgEl.complete || !imgEl.naturalWidth || !imgEl.naturalHeight) return null;
        try {
          var w = imgEl.naturalWidth || 800;
          var h = imgEl.naturalHeight || 600;
          var maxDim = 1200;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(imgEl, 0, 0, w, h);
          var jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          return dataUrlToFileSync(jpegDataUrl, productName);
        } catch (e) {
          return null;
        }
      }

      function getProductImageFileSync(p) {
        if (!p) return null;
        if (productFileCache[p.id]) return productFileCache[p.id];
        var imgs = getProductImagesList(p);
        if (!imgs || imgs.length === 0) return null;
        var primarySrc = imgs[0];

        var directFile = dataUrlToFileSync(primarySrc, p.name);
        if (directFile) {
          productFileCache[p.id] = directFile;
          return directFile;
        }

        var cachedImg = preloadedImagesCache[primarySrc];
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          var fromCache = imageElementToJpegFileSync(cachedImg, p.name);
          if (fromCache) {
            productFileCache[p.id] = fromCache;
            return fromCache;
          }
        }

        if (typeof document !== 'undefined' && document.querySelectorAll) {
          var domImgs = document.querySelectorAll('img');
          for (var i = 0; i < domImgs.length; i++) {
            var el = domImgs[i];
            if ((el.getAttribute('src') === primarySrc || el.src === primarySrc) && el.complete && el.naturalWidth > 0) {
              var fromDom = imageElementToJpegFileSync(el, p.name);
              if (fromDom) {
                productFileCache[p.id] = fromDom;
                return fromDom;
              }
            }
          }
        }

        return null;
      }

      function getProductImageFileAsync(p) {
        var syncFile = getProductImageFileSync(p);
        if (syncFile) return Promise.resolve(syncFile);

        var imgs = getProductImagesList(p);
        if (!imgs || imgs.length === 0) return Promise.resolve(null);
        var primarySrc = imgs[0];

        return new Promise(function(resolve) {
          var img = new Image();
          if (primarySrc.indexOf('data:') !== 0) {
            img.crossOrigin = 'anonymous';
          }
          img.onload = function() {
            preloadedImagesCache[primarySrc] = img;
            var file = imageElementToJpegFileSync(img, p.name);
            if (file) {
              productFileCache[p.id] = file;
              resolve(file);
              return;
            }
            resolve(null);
          };
          img.onerror = function() {
            if (typeof fetch !== 'undefined') {
              fetch(primarySrc)
                .then(function(r) { return r.blob(); })
                .then(function(blob) {
                  var ext = blob.type === 'image/png' ? '.png' : '.jpg';
                  var mime = blob.type === 'image/png' ? 'image/png' : 'image/jpeg';
                  var f = new File([blob], makeSafeFileName(p.name, ext), { type: mime, lastModified: Date.now() });
                  productFileCache[p.id] = f;
                  resolve(f);
                })
                .catch(function() { resolve(null); });
            } else {
              resolve(null);
            }
          };
          img.src = primarySrc;
        });
      }

      function buildProductTextMessage(templateStr, p, isConsult) {
        var catalogUrl = getPublicCatalogUrl();
        var priceStr = isConsult
          ? ('Precio: $' + p.price + ' ' + (p.currency || 'USD'))
          : ('$' + p.price + ' ' + (p.currency || 'USD'));

        var lines = String(templateStr || '').split('\\n');
        var processedLines = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('{imagen}') >= 0) {
            continue;
          }
          if (line.indexOf('{url}') >= 0 && !catalogUrl) {
            continue;
          }
          var replaced = line
            .split('{nombre}').join(p.name || '')
            .split('{categoria}').join(p.category || '')
            .split('{precio}').join(priceStr)
            .split('{descripcion}').join(p.description || '')
            .split('{url}').join(catalogUrl);

          if (replaced.indexOf('content://') >= 0 || replaced.indexOf('file://') >= 0) {
            continue;
          }
          processedLines.push(replaced);
        }

        var finalLines = [];
        var blankCount = 0;
        for (var j = 0; j < processedLines.length; j++) {
          if (processedLines[j].trim() === '') {
            blankCount++;
            if (blankCount <= 1) {
              finalLines.push('');
            }
          } else {
            blankCount = 0;
            finalLines.push(processedLines[j]);
          }
        }
        return finalLines.join('\\n').trim();
      }

      function shareOrConsultProductWithImage(p, msgText, fallbackWaUrl) {
        var syncFile = getProductImageFileSync(p);

        if (syncFile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          var canShareFiles = true;
          if (typeof navigator.canShare === 'function') {
            try {
              canShareFiles = navigator.canShare({ files: [syncFile] });
            } catch (e) {
              canShareFiles = true;
            }
          }
          if (canShareFiles) {
            navigator.share({
              files: [syncFile],
              title: p.name || 'Producto',
              text: msgText
            }).catch(function(err) {
              if (err && err.name === 'AbortError') return;
              navigator.share({ files: [syncFile], text: msgText }).catch(function(err2) {
                if (err2 && err2.name === 'AbortError') return;
                openWhatsAppSmooth(fallbackWaUrl);
              });
            });
            return;
          }
        }

        var imgs = getProductImagesList(p);
        if (imgs.length > 0 && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          getProductImageFileAsync(p).then(function(asyncFile) {
            if (asyncFile) {
              var canShareAsync = true;
              if (typeof navigator.canShare === 'function') {
                try {
                  canShareAsync = navigator.canShare({ files: [asyncFile] });
                } catch (e) {
                  canShareAsync = true;
                }
              }
              if (canShareAsync) {
                return navigator.share({
                  files: [asyncFile],
                  title: p.name || 'Producto',
                  text: msgText
                }).catch(function(err) {
                  if (err && err.name === 'AbortError') return;
                  return navigator.share({ files: [asyncFile], text: msgText });
                });
              }
            }
            openWhatsAppSmooth(fallbackWaUrl);
          }).catch(function(err) {
            if (err && err.name === 'AbortError') return;
            openWhatsAppSmooth(fallbackWaUrl);
          });
          return;
        }

        openWhatsAppSmooth(fallbackWaUrl);
      }

      window.shareCatalog = function() {
        var catalogUrl = getPublicCatalogUrl();
        var template = (project.messages && project.messages.shareCatalog) || '¡Hola! Te invito a explorar nuestro catálogo digital interactivo *{nombre_catalogo}*:\\n\\n🌐 *Ver Catálogo:* {url}';
        var lines = String(template).split('\\n');
        var out = [];
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf('{url}') >= 0 && !catalogUrl) continue;
          var line = lines[i]
            .split('{nombre_catalogo}').join(project.name || '')
            .split('{url}').join(catalogUrl);
          if (line.indexOf('content://') >= 0 || line.indexOf('file://') >= 0) continue;
          out.push(line);
        }
        var msg = out.join('\\n').trim();
        openWhatsAppSmooth('https://wa.me/?text=' + encodeURIComponent(msg));
      };

      window.shareProductClick = function(id, e) {
        if (e) {
          e.stopPropagation();
          if (e.preventDefault) e.preventDefault();
        }
        var p = products.find(function(item) { return item.id === id; });
        if (!p) return;

        var rawTemplate = (project.messages && project.messages.shareProduct) || '';
        var isLegacy = !rawTemplate ||
          rawTemplate.indexOf('Te comparto {nombre}') >= 0;

        var template = isLegacy
          ? '¡Hola! Mira este producto de nuestro catálogo:\\n\\n📦 *Producto:* {nombre}\\n🏷️ *Categoría:* {categoria}\\n\\n🌐 *Catálogo:* {url}'
          : rawTemplate;

        var msg = buildProductTextMessage(template, p, false);
        var fallbackWaUrl = 'https://wa.me/?text=' + encodeURIComponent(msg);
        shareOrConsultProductWithImage(p, msg, fallbackWaUrl);
      };

      window.selectCat = function(c) {
        currentCategory = c;
        showOnlyFavorites = false;
        openedFromMenu = false;
        removeNavView('favorites');
        removeNavView('menu');
        if (c && c !== 'TODOS') {
          pushNavView('category');
        } else {
          removeNavView('category');
        }
        render();
      };

      window.resetAllCatalogFilters = function() {
        searchQuery = '';
        currentCategory = 'TODOS';
        showOnlyFavorites = false;
        openedFromMenu = false;
        currentSort = 'default';
        removeNavView('search');
        removeNavView('category');
        removeNavView('favorites');
        removeNavView('menu');
        removeNavView('sort');
        ensureHistoryGuard(6);
        var inp = document.getElementById('search-input');
        if (inp) inp.value = '';
        render();
      };

      window.favClick = function(id, e) {
        toggleFav(id, e);
      };

      window.closeProductDetailModal = function() {
        selectedProduct = null;
        var zoomEl = document.getElementById('standalone-image-zoom-modal');
        if (zoomEl) zoomEl.remove();
        var prodEl = document.getElementById('standalone-product-modal');
        if (prodEl) prodEl.remove();
        removeNavView('zoom');
        removeNavView('detail');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      var preloadedImagesCache = {};
      function getProductImagesList(p) {
        if (!p) return [];
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
          var valid = p.images.filter(function(u) { return u && typeof u === 'string' && u.trim().length > 0; });
          if (valid.length > 0) return valid;
        }
        var single = p.image || p.imageUrl || p.imagen || '';
        if (single && typeof single === 'string' && single.trim().length > 0) {
          return [single.trim()];
        }
        return [];
      }

      function preloadProductImages(imgs) {
        if (!imgs || !Array.isArray(imgs)) return;
        imgs.forEach(function(src) {
          if (src && !preloadedImagesCache[src]) {
            var preloadImg = new Image();
            preloadImg.decoding = 'async';
            preloadImg.src = src;
            preloadedImagesCache[src] = preloadImg;
          }
        });
      }

      window.openProductDetail = function(id) {
        var p = products.find(function(item) { return item.id === id; });
        if (!p) return;
        selectedProduct = p;
        currentImgIndex = 0;
        window.currentImgIndex = 0;
        var pImgs = getProductImagesList(p);
        if (pImgs.length > 0) {
          preloadProductImages(pImgs);
        }
        pushNavView('detail');
        incrementViews(p.id);
        renderProductModal();
      };

      window.setModalImgIndex = function(idx) {
        var pImgs = getProductImagesList(selectedProduct);
        if (!selectedProduct || !pImgs.length) return;
        var total = pImgs.length;
        var normalizedIdx = ((idx % total) + total) % total;
        currentImgIndex = normalizedIdx;
        window.currentImgIndex = normalizedIdx;

        var modalEl = document.getElementById('standalone-product-modal');
        if (!modalEl) {
          renderProductModal();
          return;
        }

        // Update stacked slide images via opacity & visibility (smooth 200ms fade, no DOM removal or src swap)
        var slides = modalEl.querySelectorAll('.modal-product-slide-img');
        if (slides && slides.length > 0) {
          slides.forEach(function(slideEl) {
            var sIdx = Number(slideEl.getAttribute('data-slide-idx'));
            var isCur = sIdx === normalizedIdx;
            slideEl.style.opacity = isCur ? '1' : '0';
            slideEl.style.visibility = isCur ? 'visible' : 'hidden';
            slideEl.style.zIndex = isCur ? '2' : '1';
          });
        }

        // Update thumbnails active styling in-place
        var thumbs = modalEl.querySelectorAll('.modal-thumb-btn');
        if (thumbs && thumbs.length > 0) {
          thumbs.forEach(function(btn) {
            var tIdx = Number(btn.getAttribute('data-thumb-idx'));
            var isSel = tIdx === normalizedIdx;
            btn.className = 'modal-thumb-btn w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all p-1 bg-stone-50 dark:bg-stone-800/80 cursor-pointer flex items-center justify-center ' +
              (isSel
                ? 'border-2 border-amber-600 dark:border-amber-500 ring-2 ring-amber-600/30 dark:ring-amber-500/30 scale-102'
                : 'border border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:border-stone-400');
          });
        }
      };

      window.prevModalImg = function() {
        var pImgs = getProductImagesList(selectedProduct);
        if (!selectedProduct || !pImgs.length) return;
        var nextIdx = currentImgIndex === 0 ? pImgs.length - 1 : currentImgIndex - 1;
        window.setModalImgIndex(nextIdx);
      };

      window.nextModalImg = function() {
        var pImgs = getProductImagesList(selectedProduct);
        if (!selectedProduct || !pImgs.length) return;
        var nextIdx = currentImgIndex === pImgs.length - 1 ? 0 : currentImgIndex + 1;
        window.setModalImgIndex(nextIdx);
      };

      var arrowLeftSvg = '<svg class="w-5 h-5 sm:w-6 sm:h-6 text-stone-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
      var chevronLeftSvg = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>';
      var chevronRightSvg = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
      var chevronLeftSvgDark = '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 dark:text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>';
      var chevronRightSvgDark = '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 dark:text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
      var zoomInSvg = '<svg class="w-4 h-4 text-stone-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
      var zoomOutSvg = '<svg class="w-4 h-4 text-stone-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

      window.closeImageZoomModal = function() {
        var existing = document.getElementById('standalone-image-zoom-modal');
        if (existing) existing.remove();
        removeNavView('zoom');
        ensureHistoryGuard(6);
        syncBodyScrollLock();
      };

      window.openImageZoomModal = function(optIdx) {
        var existing = document.getElementById('standalone-image-zoom-modal');
        if (existing) existing.remove();
        if (!selectedProduct) return;

        pushNavView('zoom');

        var p = selectedProduct;
        var imgs = getProductImagesList(p);
        var curIdx = (typeof optIdx === 'number' && !isNaN(optIdx)) ? optIdx : (typeof currentImgIndex === 'number' ? currentImgIndex : (window.currentImgIndex || 0));
        if (curIdx < 0 || curIdx >= imgs.length) curIdx = 0;
        var zoomLevel = 1;

        // AJUSTE 2: Fondo del zoom adaptable al modo activo (claro u oscuro)
        var zoomOverlay = document.createElement('div');
        zoomOverlay.id = 'standalone-image-zoom-modal';
        zoomOverlay.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-[99999] bg-stone-100/98 dark:bg-stone-950/98 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 animate-fadeIn text-stone-900 dark:text-stone-100';
        zoomOverlay.style.zIndex = '99999';
        zoomOverlay.style.position = 'fixed';
        zoomOverlay.style.top = '0';
        zoomOverlay.style.left = '0';
        zoomOverlay.style.right = '0';
        zoomOverlay.style.bottom = '0';
        zoomOverlay.style.width = '100vw';
        zoomOverlay.style.height = '100vh';
        zoomOverlay.style.overscrollBehavior = 'contain';
        zoomOverlay.onclick = function() { window.closeImageZoomModal(); };

        function refreshZoomDOM() {
          var activeSrc = imgs[curIdx] || '';
          var imgEl = zoomOverlay.querySelector('#zoom-active-img');
          if (imgEl) {
            imgEl.src = activeSrc;
            imgEl.style.transform = 'scale(' + zoomLevel + ')';
            imgEl.style.cursor = zoomLevel > 1 ? 'zoom-out' : 'zoom-in';
          }
          var textEl = zoomOverlay.querySelector('#zoom-scale-text');
          if (textEl) textEl.innerText = Math.round(zoomLevel * 100) + '%';

          var thumbs = zoomOverlay.querySelectorAll('.zoom-thumb-btn');
          thumbs.forEach(function(btn, i) {
            if (i === curIdx) {
              btn.className = 'zoom-thumb-btn w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all p-1 bg-stone-200/70 dark:bg-white/10 cursor-pointer border-2 border-amber-500 ring-2 ring-amber-500/40 scale-105';
            } else {
              btn.className = 'zoom-thumb-btn w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all p-1 bg-stone-100 dark:bg-white/5 cursor-pointer border border-stone-300 dark:border-white/20 opacity-70 hover:opacity-100';
            }
          });
        }

        var navArrowsHtml = imgs.length > 1 ? [
          '<button type="button" id="btn-zoom-prev" class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-900 text-stone-800 dark:text-white rounded-full shadow-md border border-stone-200 dark:border-stone-700 transition-all cursor-pointer backdrop-blur-md z-10 flex items-center justify-center" aria-label="Anterior">' + chevronLeftSvgDark + '</button>',
          '<button type="button" id="btn-zoom-next" class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-900 text-stone-800 dark:text-white rounded-full shadow-md border border-stone-200 dark:border-stone-700 transition-all cursor-pointer backdrop-blur-md z-10 flex items-center justify-center" aria-label="Siguiente">' + chevronRightSvgDark + '</button>'
        ].join('') : '';

        var thumbsHtml = '';
        if (imgs.length > 1) {
          var thumbBtns = imgs.map(function(im, i) {
            var isSel = i === curIdx;
            return '<button type="button" data-idx="' + i + '" class="zoom-thumb-btn w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all p-1 bg-stone-100 dark:bg-white/5 cursor-pointer ' +
              (isSel ? 'border-2 border-amber-500 ring-2 ring-amber-500/40 scale-105' : 'border border-stone-300 dark:border-white/20 opacity-70 hover:opacity-100') + '">' +
              '<img src="' + im + '" class="w-full h-full object-contain bg-transparent" />' +
            '</button>';
          });
          thumbsHtml = '<div class="pt-2 border-t border-stone-200 dark:border-white/10 flex items-center justify-center gap-2 overflow-x-auto pb-1" onclick="event.stopPropagation()">' + thumbBtns.join('') + '</div>';
        }

        zoomOverlay.innerHTML = [
          '<div class="flex items-center justify-between text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-200 dark:border-white/10 px-1 sm:px-2" onclick="event.stopPropagation()">',
            '<div class="flex items-center gap-2">',
              '<button type="button" id="btn-close-zoom" class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400" title="Cerrar zoom" aria-label="Cerrar zoom">' +
                arrowLeftSvg +
              '</button>',
              '<span class="text-xs text-stone-600 dark:text-stone-300 font-medium hidden sm:inline truncate max-w-xs ml-1">' + escapeHtml(p.name) + '</span>',
            '</div>',
            '<div class="flex items-center gap-1.5 sm:gap-2">',
              '<button type="button" id="btn-zoom-out" class="p-1.5 sm:px-2.5 sm:py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center" title="Reducir zoom">' + zoomOutSvg + '</button>',
              '<span id="zoom-scale-text" class="text-xs font-mono font-semibold px-1 min-w-12 text-center text-stone-800 dark:text-white">100%</span>',
              '<button type="button" id="btn-zoom-in" class="p-1.5 sm:px-2.5 sm:py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center" title="Aumentar zoom">' + zoomInSvg + '</button>',
              '<button type="button" id="btn-zoom-reset" class="text-[11px] px-2 py-1 bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer">100%</button>',
            '</div>',
          '</div>',
          '<div id="zoom-img-container" style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 cursor-zoom-in relative select-none" onclick="event.stopPropagation()">',
            '<img id="zoom-active-img" src="' + (imgs[curIdx] || '') + '" alt="' + escapeHtml(p.name) + '" class="max-w-full max-h-[75vh] object-contain transition-transform duration-200 select-none drop-shadow-2xl cursor-zoom-in pointer-events-auto" style="transform: scale(1)" />',
            navArrowsHtml,
          '</div>',
          thumbsHtml
        ].join('');

        document.body.appendChild(zoomOverlay);
        syncBodyScrollLock();

        // Bind events
        var btnClose = zoomOverlay.querySelector('#btn-close-zoom');
        if (btnClose) {
          btnClose.onclick = function(e) {
            if (e) e.stopPropagation();
            window.closeImageZoomModal();
          };
        }

        var btnZoomIn = zoomOverlay.querySelector('#btn-zoom-in');
        if (btnZoomIn) btnZoomIn.onclick = function(e) {
          e.stopPropagation();
          zoomLevel = Math.min(3, +(zoomLevel + 0.5).toFixed(1));
          refreshZoomDOM();
        };

        var btnZoomOut = zoomOverlay.querySelector('#btn-zoom-out');
        if (btnZoomOut) btnZoomOut.onclick = function(e) {
          e.stopPropagation();
          zoomLevel = Math.max(1, +(zoomLevel - 0.5).toFixed(1));
          refreshZoomDOM();
        };

        var btnZoomReset = zoomOverlay.querySelector('#btn-zoom-reset');
        if (btnZoomReset) btnZoomReset.onclick = function(e) {
          e.stopPropagation();
          zoomLevel = 1;
          refreshZoomDOM();
        };

        var imgContainer = zoomOverlay.querySelector('#zoom-img-container');
        if (imgContainer) {
          imgContainer.onclick = function(e) {
            e.stopPropagation();
            zoomLevel = zoomLevel > 1 ? 1 : 2;
            refreshZoomDOM();
          };
        }

        var btnPrev = zoomOverlay.querySelector('#btn-zoom-prev');
        if (btnPrev) btnPrev.onclick = function(e) {
          e.stopPropagation();
          curIdx = curIdx === 0 ? imgs.length - 1 : curIdx - 1;
          window.setModalImgIndex(curIdx);
          refreshZoomDOM();
        };

        var btnNext = zoomOverlay.querySelector('#btn-zoom-next');
        if (btnNext) btnNext.onclick = function(e) {
          e.stopPropagation();
          curIdx = curIdx === imgs.length - 1 ? 0 : curIdx + 1;
          window.setModalImgIndex(curIdx);
          refreshZoomDOM();
        };

        var thumbBtnsEls = zoomOverlay.querySelectorAll('.zoom-thumb-btn');
        thumbBtnsEls.forEach(function(btn) {
          btn.onclick = function(e) {
            e.stopPropagation();
            var targetIdx = Number(btn.getAttribute('data-idx'));
            if (!isNaN(targetIdx)) {
              curIdx = targetIdx;
              window.setModalImgIndex(targetIdx);
              refreshZoomDOM();
            }
          };
        });
      };

      function renderProductModal() {
        var existing = document.getElementById('standalone-product-modal');
        if (!selectedProduct) {
          if (existing) existing.remove();
          syncBodyScrollLock();
          return;
        }
        var existingBody = existing ? existing.querySelector('#standalone-modal-body') : null;
        var prevScrollTop = existingBody ? existingBody.scrollTop : 0;

        var p = selectedProduct;
        var resolvedImgs = getProductImagesList(p);
        var productImgs = resolvedImgs.length > 0 ? resolvedImgs : [''];
        preloadProductImages(productImgs);
        var views = productViews[p.id] || 1;
        var isFav = favorites.indexOf(p.id) >= 0;

        // Top viewed calculation
        var maxViews = 0;
        products.forEach(function(item) {
          var v = productViews[item.id] || item.views || item.viewsCount || 0;
          if (v > maxViews) maxViews = v;
        });
        var isTopViewed = maxViews > 0 && views === maxViews;

        // 1. Encabezado con botón circular oscuro a la izquierda con borde gris claro y flecha hacia la izquierda
        var catHeaderHtml = [
          '<button type="button" id="btn-close-product-detail" onclick="closeProductDetailModal()" class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-white shadow-md transition-all cursor-pointer shrink-0 border border-stone-300 dark:border-stone-600 hover:border-stone-400" title="Regresar / Cerrar" aria-label="Regresar o cerrar modal">' +
            arrowLeftSvg +
          '</button>',
          '<span class="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Detalles del producto</span>',
          '<div class="w-10"></div>'
        ].join('');

        // 2. Imagen Principal (Capas apiladas con opacidad y visibilidad para transición fade suave de 200ms sin flash)
        var slidesHtml = productImgs.map(function(imgSrc, idx) {
          var isCurrent = idx === currentImgIndex;
          return '<img data-slide-idx="' + idx + '" src="' + imgSrc + '" alt="' + escapeHtml(p.name) + '" class="modal-product-slide-img w-full h-full object-contain bg-transparent group-hover:scale-103 pointer-events-none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; opacity: ' + (isCurrent ? '1' : '0') + '; visibility: ' + (isCurrent ? 'visible' : 'hidden') + '; z-index: ' + (isCurrent ? '2' : '1') + ';" />';
        }).join('');

        var navArrowsHtml = (resolvedImgs.length > 1) ? [
          '<button type="button" onclick="event.stopPropagation();prevModalImg()" class="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/85 dark:bg-stone-900/85 backdrop-blur-sm rounded-full shadow-md text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer z-10 flex items-center justify-center" aria-label="Imagen anterior">' + chevronLeftSvgDark + '</button>',
          '<button type="button" onclick="event.stopPropagation();nextModalImg()" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-white/85 dark:bg-stone-900/85 backdrop-blur-sm rounded-full shadow-md text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer z-10 flex items-center justify-center" aria-label="Imagen siguiente">' + chevronRightSvgDark + '</button>'
        ].join('') : '';

        // 3. Fila de miniaturas / Productos Similares (si hay más de una imagen)
        var thumbsRowHtml = '';
        if (resolvedImgs.length > 1) {
          var thumbsHtmlArr = resolvedImgs.map(function(img, idx) {
            var isSel = idx === currentImgIndex;
            return [
              '<button type="button" data-thumb-idx="' + idx + '" onclick="setModalImgIndex(' + idx + ')" class="modal-thumb-btn w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all p-1 bg-stone-50 dark:bg-stone-800/80 cursor-pointer flex items-center justify-center ' +
                (isSel ? 'border-2 border-amber-600 dark:border-amber-500 ring-2 ring-amber-600/30 dark:ring-amber-500/30 scale-102' : 'border border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:border-stone-400') + '">',
                '<img src="' + img + '" alt="Muestra ' + (idx + 1) + '" class="w-full h-full object-contain bg-transparent" />',
              '</button>'
            ].join('');
          });

          thumbsRowHtml = [
            '<div class="space-y-1.5">',
              '<div>',
                '<span class="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Productos Similares</span>',
              '</div>',
              '<div class="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">',
                thumbsHtmlArr.join(''),
              '</div>',
            '</div>'
          ].join('');
        }

        // AJUSTE 3: Categoría con tono marrón oscuro/sobrio elegante y texto blanco
        var badgesHtmlArr = [];
        if (p.category && p.category.trim()) {
          badgesHtmlArr.push('<div><span class="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#634832] dark:bg-[#7d5c41] text-white shadow-sm border border-[#4d3625]/20">' + escapeHtml(p.category) + '</span></div>');
        }
        if (p.tags && Array.isArray(p.tags)) {
          var tagBadges = [];
          p.tags.forEach(function(tag) {
            if (tag && tag.trim()) {
              var cleanTag = tag.trim().replace(/^#/, '');
              tagBadges.push('<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">#' + escapeHtml(cleanTag) + '</span>');
            }
          });
          if (tagBadges.length > 0) {
            badgesHtmlArr.push('<div class="flex flex-wrap items-center gap-1.5">' + tagBadges.join('') + '</div>');
          }
        }
        var badgesHtml = badgesHtmlArr.length > 0 ? '<div class="space-y-2">' + badgesHtmlArr.join('') + '</div>' : '';

        // AJUSTE 1: Íconos sobrios y elegantes (Vistas NEUTRO o LLAMA NARANJA, Favoritos CONTORNO NEUTRO + RELLENO ROJO si está guardado, Compartir NEUTRO)
        var modalHeartSvg = '<svg id="modal-fav-heart-svg" class="fav-icon-heart ' + (isFav ? 'fav-is-active scale-110' : 'fav-is-empty') + ' w-4 h-4 text-stone-900 dark:text-white shrink-0 transition-transform" style="fill: ' + (isFav ? '#ef4444' : 'none') + ';" fill="' + (isFav ? '#ef4444' : 'none') + '" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path id="modal-fav-heart-path" fill="' + (isFav ? '#ef4444' : 'none') + '" style="fill: ' + (isFav ? '#ef4444' : 'none') + ';" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>';
        var modalShareSvg = '<svg class="icon-share-neutral w-4 h-4 text-stone-900 dark:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>';

        var actionsBarHtml = [
          '<div class="flex items-center gap-2 sm:gap-3 py-2 border-y border-stone-100 dark:border-stone-800">',
            (isTopViewed
              ? '<div class="flex-none flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 whitespace-nowrap">' + flameSvgDetail + ' <span>' + views + ' ' + (views === 1 ? 'vista' : 'vistas') + '</span></div>'
              : '<div class="flex-none flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 whitespace-nowrap">' + eyeSvgDetail + ' <span>' + views + ' ' + (views === 1 ? 'vista' : 'vistas') + '</span></div>'),
            '<button type="button" id="btn-modal-favorite" onclick="favClick(\\'' + p.id + '\\', event)" class="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2 sm:px-3 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer">',
              modalHeartSvg + ' <span id="modal-fav-btn-label" class="truncate">' + (isFav ? 'Guardado' : 'Guardar') + '</span>',
            '</button>',
            '<button type="button" onclick="shareProductClick(\\'' + p.id + '\\', event)" class="flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-2 sm:px-3 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer whitespace-nowrap" title="Compartir producto">',
              modalShareSvg + ' <span class="whitespace-nowrap">Compartir</span>',
            '</button>',
          '</div>'
        ].join('');

        var descHtml = (p.description && p.description.trim())
          ? '<p class="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">' + escapeHtml(p.description) + '</p>'
          : '';

        // AJUSTE 5: SKU (🏷️), Medidas (📐), Materiales (🪵) y Pedido Mínimo (📦) en UNA SOLA LÍNEA HORIZONTAL
        var specItems = [];
        if (p.sku && p.sku.trim()) {
          specItems.push([
            '<span class="inline-flex items-center gap-1.5">',
              '<span class="text-base select-none">🏷️</span>',
              '<span class="text-stone-600 dark:text-stone-300 font-medium">SKU:</span>',
              '<span class="font-mono font-semibold text-stone-900 dark:text-stone-100">' + escapeHtml(p.sku) + '</span>',
            '</span>'
          ].join(''));
        }
        if (p.sku && p.sku.trim() && ((p.dimensions && p.dimensions.trim()) || (p.material && p.material.trim()) || (p.moq && Number(p.moq) > 0))) {
          specItems.push('<span class="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>');
        }
        if (p.dimensions && p.dimensions.trim()) {
          specItems.push([
            '<span class="inline-flex items-center gap-1.5">',
              '<span class="text-base select-none">📐</span>',
              '<span class="text-stone-600 dark:text-stone-300 font-medium">Medidas:</span>',
              '<span class="font-semibold text-stone-900 dark:text-stone-100">' + escapeHtml(p.dimensions) + '</span>',
            '</span>'
          ].join(''));
        }
        if (p.dimensions && p.dimensions.trim() && p.material && p.material.trim()) {
          specItems.push('<span class="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>');
        }
        if (p.material && p.material.trim()) {
          specItems.push([
            '<span class="inline-flex items-center gap-1.5">',
              '<span class="text-base select-none">🪵</span>',
              '<span class="text-stone-600 dark:text-stone-300 font-medium">Materiales:</span>',
              '<span class="font-semibold text-stone-900 dark:text-stone-100">' + escapeHtml(p.material) + '</span>',
            '</span>'
          ].join(''));
        }
        if ((p.dimensions || p.material) && p.moq && Number(p.moq) > 0) {
          specItems.push('<span class="text-stone-300 dark:text-stone-600 hidden sm:inline select-none">|</span>');
        }
        if (p.moq && Number(p.moq) > 0) {
          specItems.push([
            '<span class="inline-flex items-center gap-1.5">',
              '<span class="text-base select-none">📦</span>',
              '<span class="text-stone-600 dark:text-stone-300 font-medium">Pedido Mínimo:</span>',
              '<span class="font-semibold text-stone-900 dark:text-stone-100">' + p.moq + ' unidades</span>',
            '</span>'
          ].join(''));
        }
        var specsBoxHtml = specItems.length > 0
          ? '<div class="p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs sm:text-sm text-stone-700 dark:text-stone-300"><div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">' + specItems.join('') + '</div></div>'
          : '';

        // 5. Productos Relacionados calculados por fórmula ponderada:
        // Puntuación = (0.7 * coincidencia_categoría) + (0.3 * coincidencia_etiquetas)
        // Desempate por popularidad (más vistas primero)
        var normCatA = (p.category || '').trim().toLowerCase();
        var tagsA = (p.tags && Array.isArray(p.tags)) ? p.tags.map(function(t) {
          return String(t).trim().toLowerCase().replace(/^#+/, '');
        }).filter(Boolean) : [];

        var scoredCandidates = products.filter(function(cand) {
          return cand.id !== p.id;
        }).map(function(cand) {
          var normCatB = (cand.category || '').trim().toLowerCase();
          var categoryMatch = (normCatA && normCatB && normCatA === normCatB) ? 1 : 0;

          var tagsB = (cand.tags && Array.isArray(cand.tags)) ? cand.tags.map(function(t) {
            return String(t).trim().toLowerCase().replace(/^#+/, '');
          }).filter(Boolean) : [];

          var tagMatch = 0;
          if (tagsA.length > 0) {
            var commonCount = tagsA.filter(function(t) {
              return tagsB.indexOf(t) >= 0;
            }).length;
            tagMatch = commonCount / tagsA.length;
          }

          var score = 0.7 * categoryMatch + 0.3 * tagMatch;
          var candViews = productViews[cand.id] || cand.views || cand.viewsCount || 0;

          return {
            product: cand,
            score: score,
            views: candViews
          };
        }).filter(function(item) {
          return item.score > 0;
        });

        scoredCandidates.sort(function(a, b) {
          if (Math.abs(b.score - a.score) > 0.0001) {
            return b.score - a.score;
          }
          return b.views - a.views;
        });

        var related = scoredCandidates.slice(0, 3).map(function(item) {
          return item.product;
        });

        // AJUSTE 6: sin el enunciado de '3 sugerencias'
        var relatedHtml = '';
        if (related.length > 0) {
          var relCardsHtml = related.map(function(rel) {
            var relImg = (rel.images && rel.images[0]) || '';
            return [
              '<div onclick="openProductDetail(\\'' + rel.id + '\\')" class="group/rel flex flex-col bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl p-2 border border-stone-200/80 dark:border-stone-700/80 transition-all cursor-pointer hover:shadow-sm">',
                '<div class="w-full aspect-square bg-transparent rounded-lg overflow-hidden mb-1.5 flex items-center justify-center p-1">',
                  '<img src="' + relImg + '" alt="' + escapeHtml(rel.name) + '" class="w-full h-full object-contain group-hover/rel:scale-105 transition-transform" />',
                '</div>',
                '<p class="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1 mb-0.5">' + escapeHtml(rel.name) + '</p>',
                '<p class="text-[11px] font-bold text-amber-700 dark:text-amber-400">$' + rel.price + ' <span class="text-[9px] font-medium text-stone-600 dark:text-stone-300">' + (rel.currency || 'USD') + '</span></p>',
              '</div>'
            ].join('');
          }).join('');

          relatedHtml = [
            '<div class="pt-4 border-t border-stone-200 dark:border-stone-800">',
              '<h3 class="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">Productos relacionados</h3>',
              '<div class="grid grid-cols-3 gap-2.5 sm:gap-3">',
                relCardsHtml,
              '</div>',
            '</div>'
          ].join('');
        }

        var isNewModal = !existing;
        var div = existing || document.createElement('div');
        div.id = 'standalone-product-modal';
        div.className = 'modal-overscroll-contain overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm' + (isNewModal ? ' animate-fadeIn' : '');
        div.style.overscrollBehavior = 'contain';
        div.onclick = function() { window.closeProductDetailModal(); };

        div.innerHTML = [
          '<div style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100' + (isNewModal ? ' animate-scaleUp' : '') + '" onclick="event.stopPropagation()">',
            '<!-- 1. ENCABEZADO: Botón cerrar arriba a la izquierda con flecha circular oscura -->',
            '<div class="flex items-center justify-between px-5 py-3 border-b border-stone-100 dark:border-stone-800">',
              catHeaderHtml,
            '</div>',

            '<!-- Scrollable body -->',
            '<div id="standalone-modal-body" style="overscroll-behavior: contain;" class="modal-overscroll-contain overscroll-contain p-4 sm:p-6 overflow-y-auto space-y-5">',
              '<!-- 2. IMAGEN PRINCIPAL DEL PRODUCTO (Fondo sólido adaptable al modo claro/oscuro y transición fade de 200ms) -->',
              '<div class="space-y-3">',
                '<div id="modal-main-image-zoom-trigger" onclick="openImageZoomModal(currentImgIndex)" style="position: relative; width: 100%; aspect-ratio: 16 / 10; min-height: 220px;" class="aspect-modal-img relative w-full aspect-16/10 bg-[#fafaf9] dark:bg-[#1c1917] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 cursor-zoom-in group flex items-center justify-center select-none" title="Hacer clic para ampliar imagen">',
                  slidesHtml,
                  navArrowsHtml,
                '</div>',
                thumbsRowHtml,
              '</div>',

              '<!-- 4. INFORMACIÓN DEL PRODUCTO -->',
              '<div class="space-y-4">',
                '<!-- AJUSTE 1: 1. Nombre del producto PRIMERO y CENTRADO -->',
                '<h2 class="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 leading-tight text-center">' + escapeHtml(p.name) + '</h2>',

                '<!-- AJUSTE 2: 2. Categoría y 3. Etiquetas -->',
                badgesHtml,

                actionsBarHtml,

                descHtml,
                specsBoxHtml,

                '<!-- Precio FOB destacado -->',
                '<div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 flex items-center justify-between">',
                  '<div>',
                    '<span class="text-xs uppercase font-extrabold tracking-wider text-amber-800 dark:text-amber-400 block">Precio FOB</span>',
                    '<div class="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50">$' + p.price + ' <span class="text-sm font-semibold text-stone-600 dark:text-stone-300">' + (p.currency || 'USD') + '</span></div>',
                  '</div>',
                '</div>',

                '<!-- Botón Consultar por WhatsApp -->',
                '<div>',
                  '<button type="button" id="btn-whatsapp-consult" onclick="whatsappProductConsult(\\'' + p.id + '\\', event)" class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-base font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer">',
                    '<span>💬 Consultar por WhatsApp</span>',
                  '</button>',
                '</div>',

                '<!-- 5. PRODUCTOS RELACIONADOS -->',
                relatedHtml,
              '</div>',
            '</div>',
          '</div>'
        ].join('');

        if (isNewModal) {
          document.body.appendChild(div);
        } else {
          var newBody = div.querySelector('#standalone-modal-body');
          if (newBody && prevScrollTop > 0) {
            newBody.scrollTop = prevScrollTop;
          }
        }
        syncBodyScrollLock();

        // Bind direct click to zoom image
        var mainImgTrigger = div.querySelector('#modal-main-image-zoom-trigger');
        if (mainImgTrigger) {
          mainImgTrigger.onclick = function(e) {
            e.stopPropagation();
            window.openImageZoomModal(currentImgIndex);
          };
        }
      }
      window.renderProductModal = renderProductModal;

      window.whatsappProductConsult = function(id, e) {
        if (e) {
          e.stopPropagation();
          if (e.preventDefault) e.preventDefault();
        }
        var p = products.find(function(item) { return item.id === id; });
        if (!p) return;
        var rawTemplate = (project.messages && project.messages.consultProduct) || '';
        var defaultConsultTemplate = 'Hola, estoy interesado en consultar sobre el siguiente producto de su catálogo:\\n\\n*Producto:* {nombre}\\n*Categoría:* {categoria}\\n{precio}\\n\\n🌐 *Catálogo:* {url}\\n\\n¿Podría brindarme más detalles?';
        var template = rawTemplate || defaultConsultTemplate;
        var msg = buildProductTextMessage(template, p, true);
        var phone = project.contact && project.contact.phone ? project.contact.phone.replace(/[^0-9]/g, '') : '';
        var fallbackWaUrl = phone ? 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg) : 'https://wa.me/?text=' + encodeURIComponent(msg);
        shareOrConsultProductWithImage(p, msg, fallbackWaUrl);
      };

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      // Initial Render & Immediate Parallel Views Sync
      render();
      try {
        products.forEach(function(p) {
          var list = getProductImagesList(p);
          if (list.length > 0) {
            preloadProductImages([list[0]]);
          }
        });
      } catch(e) {}
      try {
        if (window.location.hash && window.location.hash.indexOf('#producto=') === 0) {
          var hashProdId = decodeURIComponent(window.location.hash.replace('#producto=', ''));
          if (hashProdId) {
            window.openProductDetail(hashProdId);
          }
        }
      } catch(e) {}
      try {
        fetchAllProductViewsParallel();
        setInterval(fetchAllProductViewsParallel, 12000);
      } catch(e) {}

      // Scroll to top button visibility handler
      function handleScrollTopButton() {
        var btn = document.getElementById('btn-scroll-to-top');
        if (!btn || !btn.classList) return;
        if (window.scrollY > 300) {
          btn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
          btn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
          btn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
          btn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        }
      }
      window.addEventListener('scroll', handleScrollTopButton, { passive: true });
      handleScrollTopButton();

      // Keyboard Esc handler to close zoom, product modal or sub-views hierarchically
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          if (typeof window.handleAndroidBackButton === 'function') {
            window.handleAndroidBackButton();
          }
        }
      });
    })();
  </script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
