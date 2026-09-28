/**
 * Counter Service for Global Real-time Views via Abacus API
 * Namespace: catalogo-madera-laser
 * High-speed parallel queries with concurrency pool (max 6 simultaneous),
 * 5s timeout, exponential backoff retries (1s, 2s, 4s), and non-blocking architecture.
 */

export const GLOBAL_COUNTER_NAMESPACE = 'catalogo-madera-laser';
const ABACUS_BASE_URL = 'https://abacus.jasoncameron.dev';
const REQUEST_TIMEOUT_MS = 5000;
const MAX_CONCURRENCY = 6;
const PENDING_HITS_KEY = 'catalog-pending-counter-hits';

export function getCleanProductKey(productId: string): string {
  if (!productId) return 'general';
  return productId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, credentials: 'omit', signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch with Exponential Backoff (1s, 2s, 4s)
 */
async function fetchWithBackoff(url: string, options: RequestInit = {}, maxRetries = 2): Promise<Response> {
  let attempt = 0;
  let delay = 1000;

  while (true) {
    try {
      const res = await fetchWithTimeout(url, options);
      if (res.ok || res.status === 404) {
        return res;
      }
      if (res.status === 429 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        attempt++;
        continue;
      }
      return res;
    } catch (err: unknown) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

// Local offline pending hits queue
function getPendingHits(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PENDING_HITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingHits(hits: Record<string, number>) {
  try {
    localStorage.setItem(PENDING_HITS_KEY, JSON.stringify(hits));
  } catch {}
}

export function queuePendingHit(key: string) {
  const hits = getPendingHits();
  hits[key] = (hits[key] || 0) + 1;
  savePendingHits(hits);
}

/**
 * Get current counter value without incrementing
 */
export async function getProductViews(productId: string): Promise<number | null> {
  const key = getCleanProductKey(productId);
  const url = `${ABACUS_BASE_URL}/get/${encodeURIComponent(GLOBAL_COUNTER_NAMESPACE)}/${encodeURIComponent(key)}`;
  try {
    const res = await fetchWithBackoff(url, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : null;
  } catch (err) {
    return null;
  }
}

/**
 * Increment counter and return new value
 */
export async function incrementProductViews(productId: string): Promise<number | null> {
  const key = getCleanProductKey(productId);
  const url = `${ABACUS_BASE_URL}/hit/${encodeURIComponent(GLOBAL_COUNTER_NAMESPACE)}/${encodeURIComponent(key)}`;
  try {
    const res = await fetchWithBackoff(url, { method: 'GET' });
    if (!res.ok) {
      queuePendingHit(key);
      return null;
    }
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : null;
  } catch (err) {
    queuePendingHit(key);
    return null;
  }
}

/**
 * Flush any offline queued pending hits in parallel
 */
export async function flushPendingHits(): Promise<void> {
  const hits = getPendingHits();
  const keys = Object.keys(hits);
  if (keys.length === 0) return;

  const remaining: Record<string, number> = {};

  await runInParallel(keys, async (key) => {
    const count = hits[key];
    for (let i = 0; i < count; i++) {
      const url = `${ABACUS_BASE_URL}/hit/${encodeURIComponent(GLOBAL_COUNTER_NAMESPACE)}/${encodeURIComponent(key)}`;
      try {
        const res = await fetchWithBackoff(url, { method: 'GET' }, 1);
        if (!res.ok) {
          remaining[key] = (remaining[key] || 0) + 1;
        }
      } catch {
        remaining[key] = (remaining[key] || 0) + 1;
      }
    }
  }, MAX_CONCURRENCY);

  savePendingHits(remaining);
}

/**
 * High-speed parallel runner with max concurrency limit.
 * Runs tasks without sequential delays, immediately picking up the next item.
 */
export async function runInParallel<T>(
  items: T[],
  workerFn: (item: T) => Promise<void>,
  concurrency = MAX_CONCURRENCY
): Promise<void> {
  if (!items || items.length === 0) return;

  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        await workerFn(items[index]);
      } catch (e) {
        // Non-blocking: failures in one item do not stop other items
      }
    }
  }

  const pool = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(pool);
}

/**
 * High-speed batch update of all product counters in parallel.
 * Updates views in the callback as each product finishes.
 */
export async function fetchAllProductViewsParallel(
  productIds: string[],
  onUpdate: (productId: string, views: number) => void
): Promise<void> {
  if (!productIds || productIds.length === 0) return;

  await runInParallel(
    productIds,
    async (id) => {
      const views = await getProductViews(id);
      if (views !== null && views >= 0) {
        onUpdate(id, views);
      }
    },
    MAX_CONCURRENCY
  );
}
