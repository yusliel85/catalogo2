import { CustomBlock } from '../types';

export function getPromoSortTimestamp(b: CustomBlock): number {
  if (!b) return 0;
  if (typeof b.createdAt === "number" && !isNaN(b.createdAt) && b.createdAt > 0) {
    return b.createdAt;
  }
  if (typeof b.createdAt === "string" && b.createdAt.trim() !== "") {
    const num = Number(b.createdAt);
    if (!isNaN(num) && num > 0) return num;
    const dt = Date.parse(b.createdAt);
    if (!isNaN(dt) && dt > 0) return dt;
  }
  if (b.id && typeof b.id === "string") {
    const match = b.id.match(/\d{10,}/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 0;
}

export function sortPromosNewestFirst(blocks: CustomBlock[]): CustomBlock[] {
  if (!blocks || !Array.isArray(blocks)) return [];
  return blocks
    .map((block, index) => ({ block, index, ts: getPromoSortTimestamp(block) }))
    .sort((a, b) => {
      if (a.ts !== b.ts && a.ts > 0 && b.ts > 0) {
        return b.ts - a.ts;
      }
      if (a.ts > 0 && b.ts === 0) return -1;
      if (b.ts > 0 && a.ts === 0) return 1;
      return a.index - b.index;
    })
    .map(item => item.block);
}
