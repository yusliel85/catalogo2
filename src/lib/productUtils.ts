import { CatalogProduct } from '../types';

/**
 * Orden histórico de inserción para productos de catálogos existentes
 * que preserva la cronología exacta de adición ("últimos agregados primero").
 */
export const HISTORICAL_PRODUCT_ORDER: string[] = [
  'prod-1',
  'prod-2',
  'prod-3',
  'prod-4',
  'prod-5',
  'prod-1785815071398',
  'prod-1785816961280',
  'prod-1786334061118',
  'prod-1786334469584',
  'prod-1786334712033',
  'prod-1786334896287',
  'prod-1786335220716',
  'prod-1786335525853',
  'prod-1786335600799',
  'prod-1786336038010',
  'prod-1786336681682',
  'prod-1786508437646',
  'prod-1786654500119',
  'prod-1786655205374',
  'prod-1786656194815',
  'prod-1786656567057',
  'prod-1787250790361',
  'prod-1787093566184',
  'prod-1787248810166',
  'prod-1786336181559'
];

export const HISTORICAL_ORDER_MAP = new Map<string, number>();
HISTORICAL_PRODUCT_ORDER.forEach((id, idx) => {
  HISTORICAL_ORDER_MAP.set(id, 1785000000000 + idx * 3600000);
});

/**
 * Obtiene la marca de tiempo de ordenamiento de un producto.
 * Prioriza el orden histórico conocido para preservar la cronología de creación real,
 * seguido del campo createdAt numérico o fecha.
 */
export function getProductSortTimestamp(p: CatalogProduct | any): number {
  if (!p) return 0;
  if (p.id && HISTORICAL_ORDER_MAP.has(p.id)) {
    return HISTORICAL_ORDER_MAP.get(p.id)!;
  }
  if (typeof p.createdAt === 'number' && !isNaN(p.createdAt) && p.createdAt > 0) {
    return p.createdAt;
  }
  if (typeof p.createdAt === 'string' && p.createdAt.trim() !== '') {
    const num = Number(p.createdAt);
    if (!isNaN(num) && num > 0) return num;
    const dt = Date.parse(p.createdAt);
    if (!isNaN(dt) && dt > 0) return dt;
  }
  return 0;
}

/**
 * Ordena una lista de productos poniendo los más recientes primero (orden por defecto).
 * Si hay productos sin timestamp o con timestamps idénticos, preserva de forma determinística
 * la precedencia de inserción (índice original del arreglo).
 */
export function sortProductsNewestFirst(prods: CatalogProduct[]): CatalogProduct[] {
  if (!Array.isArray(prods) || prods.length <= 1) return Array.isArray(prods) ? prods : [];
  
  const indexed = prods.map((p, idx) => {
    const ts = getProductSortTimestamp(p);
    return {
      product: ts > 0 && (!p.createdAt || HISTORICAL_ORDER_MAP.has(p.id)) ? { ...p, createdAt: ts } : p,
      index: idx,
      ts: ts
    };
  });

  indexed.sort((a, b) => {
    if (b.ts > 0 && a.ts > 0 && b.ts !== a.ts) {
      return b.ts - a.ts;
    }
    if (b.ts > 0 && a.ts <= 0) return -1;
    if (a.ts > 0 && b.ts <= 0) return 1;
    return a.index - b.index;
  });

  return indexed.map(item => item.product);
}

