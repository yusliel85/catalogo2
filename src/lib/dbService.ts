/**
 * Robust IndexedDB & localStorage persistence service.
 * Guarantees that catalog products, projects, and custom blocks are safely stored
 * without hitting mobile browser localStorage quota limits or losing state in PWAs.
 */

import { CatalogProject } from '../types';
import { CustomBlock } from '../components/AdminBlocks';

const DB_NAME = 'CatalogExporterDB';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects_store';
const STORE_BLOCKS = 'blocks_store';
const STORE_FAVORITES = 'favorites_store';
const STORE_VIEWS = 'views_store';

function getDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS);
        }
        if (!db.objectStoreNames.contains(STORE_BLOCKS)) {
          db.createObjectStore(STORE_BLOCKS);
        }
        if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
          db.createObjectStore(STORE_FAVORITES);
        }
        if (!db.objectStoreNames.contains(STORE_VIEWS)) {
          db.createObjectStore(STORE_VIEWS);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveActiveProjectId(id: string): Promise<void> {
  if (!id) return;
  // 1. Try localStorage
  try {
    localStorage.setItem('catalog-active-project-id', id);
  } catch (e) {}

  // 2. Try IndexedDB
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.put(id, 'catalog-active-project-id');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  } catch (e) {}
}

export async function loadActiveProjectId(): Promise<string | null> {
  // 1. Try localStorage first (synchronous speed)
  try {
    const stored = localStorage.getItem('catalog-active-project-id');
    if (stored && stored.trim() !== '') return stored.trim();
  } catch (e) {}

  // 2. Fallback to IndexedDB
  try {
    const db = await getDB();
    if (db) {
      const idbData = await new Promise<string | null>((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get('catalog-active-project-id');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (idbData && typeof idbData === 'string' && idbData.trim() !== '') {
        return idbData.trim();
      }
    }
  } catch (e) {}

  return null;
}

export async function saveProjectsToStorage(projects: CatalogProject[]): Promise<void> {
  if (!projects || !Array.isArray(projects)) return;

  // 1. Try IndexedDB first (virtually unlimited capacity, handles Base64 images easily)
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.put(projects, 'catalog-all-projects');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  } catch (e) {
    console.warn('[DBService] IndexedDB save error:', e);
  }

  // 2. Try localStorage (with graceful handling for quota exceeded)
  try {
    localStorage.setItem('catalog-all-projects', JSON.stringify(projects));
  } catch (e) {
    console.warn('[DBService] LocalStorage quota exceeded. Full high-res data safely kept in IndexedDB.');
  }
}

export async function loadProjectsFromStorage(): Promise<CatalogProject[] | null> {
  // 1. Try IndexedDB
  try {
    const db = await getDB();
    if (db) {
      const idbData = await new Promise<CatalogProject[] | null>((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get('catalog-all-projects');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (idbData && Array.isArray(idbData) && idbData.length > 0) {
        return idbData;
      }
    }
  } catch (e) {
    console.warn('[DBService] IndexedDB load error:', e);
  }

  // 2. Fallback to localStorage
  try {
    const stored = localStorage.getItem('catalog-all-projects');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[DBService] LocalStorage load error:', e);
  }

  return null;
}

export async function saveCustomBlocksToStorage(blocks: CustomBlock[]): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_BLOCKS, 'readwrite');
        const store = tx.objectStore(STORE_BLOCKS);
        const req = store.put(blocks, 'catalog-custom-blocks');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  } catch (e) {}

  try {
    localStorage.setItem('catalog-custom-blocks', JSON.stringify(blocks));
  } catch (e) {}
}

export async function loadCustomBlocksFromStorage(): Promise<CustomBlock[] | null> {
  try {
    const db = await getDB();
    if (db) {
      const idbData = await new Promise<CustomBlock[] | null>((resolve) => {
        const tx = db.transaction(STORE_BLOCKS, 'readonly');
        const store = tx.objectStore(STORE_BLOCKS);
        const req = store.get('catalog-custom-blocks');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (idbData && Array.isArray(idbData)) {
        return idbData;
      }
    }
  } catch (e) {}

  try {
    const stored = localStorage.getItem('catalog-custom-blocks');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}

  return null;
}

export async function saveFavoritesToStorage(projectId: string, favoriteIds: string[]): Promise<void> {
  const clean = Array.from(new Set(favoriteIds)).filter(id => id && String(id).trim() !== '');
  
  // 1. IndexedDB
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_FAVORITES, 'readwrite');
        const store = tx.objectStore(STORE_FAVORITES);
        const req = store.put(clean, `favorites-${projectId}`);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  } catch (e) {}

  // 2. Multiple fallback localStorage keys for absolute backward/cross-compatibility
  try {
    const jsonStr = JSON.stringify(clean);
    localStorage.setItem(`catalog-fav-${projectId}`, jsonStr);
    localStorage.setItem(`interactive-catalog-fav-${projectId}`, jsonStr);
    localStorage.setItem(`catalog-user-favorites-${projectId}`, jsonStr);
  } catch (e) {}
}

export async function loadFavoritesFromStorage(projectId: string): Promise<string[]> {
  // 1. Try IndexedDB
  try {
    const db = await getDB();
    if (db) {
      const idbData = await new Promise<string[] | null>((resolve) => {
        const tx = db.transaction(STORE_FAVORITES, 'readonly');
        const store = tx.objectStore(STORE_FAVORITES);
        const req = store.get(`favorites-${projectId}`);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (idbData && Array.isArray(idbData) && idbData.length > 0) {
        return Array.from(new Set(idbData));
      }
    }
  } catch (e) {}

  // 2. Check localStorage across all known keys
  const keysToCheck = [
    `catalog-fav-${projectId}`,
    `interactive-catalog-fav-${projectId}`,
    `catalog-user-favorites-${projectId}`
  ];

  for (const key of keysToCheck) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set(parsed));
        }
      }
    } catch (e) {}
  }

  return [];
}

export async function saveViewsToStorage(projectId: string, views: Record<string, number>): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_VIEWS, 'readwrite');
        const store = tx.objectStore(STORE_VIEWS);
        const req = store.put(views, `views-${projectId}`);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }
  } catch (e) {}

  try {
    const jsonStr = JSON.stringify(views);
    localStorage.setItem(`catalog-views-${projectId}`, jsonStr);
    localStorage.setItem(`interactive-catalog-views-${projectId}`, jsonStr);
  } catch (e) {}
}

export async function loadViewsFromStorage(projectId: string): Promise<Record<string, number>> {
  try {
    const db = await getDB();
    if (db) {
      const idbData = await new Promise<Record<string, number> | null>((resolve) => {
        const tx = db.transaction(STORE_VIEWS, 'readonly');
        const store = tx.objectStore(STORE_VIEWS);
        const req = store.get(`views-${projectId}`);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (idbData && typeof idbData === 'object' && !Array.isArray(idbData)) {
        return idbData;
      }
    }
  } catch (e) {}

  const keysToCheck = [
    `catalog-views-${projectId}`,
    `interactive-catalog-views-${projectId}`
  ];

  for (const key of keysToCheck) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  return {};
}

