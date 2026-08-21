const STORAGE_KEY = 'agora_recent_products';
const MAX_ITEMS = 12;

export function getRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(productId: string): void {
  try {
    const current = getRecentlyViewed().filter((id) => id !== productId);
    const updated = [productId, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silently skip, not critical
  }
}
