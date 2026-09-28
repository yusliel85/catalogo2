import { CatalogProject, CustomBlock } from '../types';

const DB_NAME = 'CatalogExporterDB';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects_store';
const STORE_BLOCKS = 'blocks_store';

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
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveActiveProjectId(id: string) {
  if (!id) return;
  try {
    localStorage.setItem('catalog-active-project-id', id);
  } catch (e) {}
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
  try {
    const stored = localStorage.getItem('catalog-active-project-id');
    if (stored && stored.trim() !== '') return stored.trim();
  } catch (e) {}
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

export async function saveProjectsToStorage(projects: CatalogProject[]) {
  if (!projects || !Array.isArray(projects)) return;
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
  try {
    localStorage.setItem('catalog-all-projects', JSON.stringify(projects));
  } catch (e) {
    console.warn('[DBService] LocalStorage quota exceeded. Data kept in IndexedDB.');
  }
}

export async function loadProjectsFromStorage(): Promise<CatalogProject[] | null> {
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
  try {
    const stored = localStorage.getItem('catalog-all-projects');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

export async function saveCustomBlocksToStorage(blocks: CustomBlock[]) {
  if (!blocks || !Array.isArray(blocks)) return;
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
      if (idbData && Array.isArray(idbData)) return idbData;
    }
  } catch (e) {}
  try {
    const stored = localStorage.getItem('catalog-custom-blocks');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return null;
}
