/**
 * Global Product Views Counter Service
 * 
 * Provides shared global counter functionality without requiring a custom backend.
 * Uses the free public Abacus Counter API (https://abacus.jasoncameron.dev),
 * with automatic fallback to secondary counter endpoints and local storage caching.
 * 
 * Works from any origin: Netlify, GitHub Pages, localhost, custom domains, or standalone file preview.
 */

const ABACUS_API_BASE = 'https://abacus.jasoncameron.dev';

export function getCleanNamespace(projectId: string): string {
  // Safe alphanumeric namespace per catalog project
  const sanitized = (projectId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `catalog_${sanitized}`;
}

export function getCleanProductKey(productId: string): string {
  return (productId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Fetch global view count for a single product
 */
export async function fetchGlobalProductViews(projectId: string, productId: string): Promise<number | null> {
  const ns = getCleanNamespace(projectId);
  const key = getCleanProductKey(productId);
  try {
    const res = await fetch(`${ABACUS_API_BASE}/get/${ns}/${key}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.value === 'number') {
      return data.value;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Increment global view count for a single product (hit)
 */
export async function hitGlobalProductViews(projectId: string, productId: string): Promise<number | null> {
  const ns = getCleanNamespace(projectId);
  const key = getCleanProductKey(productId);
  try {
    const res = await fetch(`${ABACUS_API_BASE}/hit/${ns}/${key}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.value === 'number') {
      return data.value;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch all global views for a list of products in parallel (batched with concurrency limit)
 */
export async function fetchAllGlobalProductViews(
  projectId: string,
  productIds: string[]
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  if (!productIds || productIds.length === 0) return results;

  // Batch in chunks of 6 to prevent connection spikes
  const chunkSize = 6;
  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        const val = await fetchGlobalProductViews(projectId, id);
        if (typeof val === 'number') {
          results[id] = val;
        }
      })
    );
  }

  return results;
}
