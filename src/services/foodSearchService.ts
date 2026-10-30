import { SEED_FOODS } from '../data/seedFoods';
import { FoodItem } from '../types/health';
import { searchOpenFoodFacts } from './openFoodFactsApi';
import { searchUSDA } from './usdaApi';

const CACHED_FOODS_KEY = 'joof_cached_foods';

export function getCachedFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(CACHED_FOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheFoodItem(item: FoodItem): void {
  try {
    const current = getCachedFoods();
    const existingIndex = current.findIndex(f => f.id === item.id);
    if (existingIndex >= 0) {
      current[existingIndex] = item;
    } else {
      current.unshift(item);
    }
    // Keep up to 100 recent/custom items
    localStorage.setItem(CACHED_FOODS_KEY, JSON.stringify(current.slice(0, 100)));
  } catch (e) {
    console.error('Failed to cache food item:', e);
  }
}

export async function searchFoodItems(
  query: string,
  sourceFilter: 'all' | 'usda' | 'off' = 'all'
): Promise<FoodItem[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [...getCachedFoods().slice(0, 10), ...SEED_FOODS.slice(0, 15)];
  }

  // 1. Instant local matching (Seed foods + Cached foods)
  const allLocal = [...getCachedFoods(), ...SEED_FOODS];
  const localMatches: FoodItem[] = [];
  const seenIds = new Set<string>();

  for (const item of allLocal) {
    if (
      (item.name.toLowerCase().includes(normalizedQuery) ||
        (item.brand && item.brand.toLowerCase().includes(normalizedQuery))) &&
      !seenIds.has(item.id)
    ) {
      seenIds.add(item.id);
      localMatches.push(item);
    }
  }

  // If query is short (< 3 chars), return local results immediately to avoid API spam
  if (normalizedQuery.length < 3) {
    return localMatches;
  }

  // 2. Fetch external data if online
  const externalPromises: Promise<FoodItem[]>[] = [];

  if (sourceFilter === 'all' || sourceFilter === 'usda') {
    externalPromises.push(
      searchUSDA(normalizedQuery).catch(err => {
        console.warn('USDA search error (falling back to local):', err);
        return [];
      })
    );
  }

  if (sourceFilter === 'all' || sourceFilter === 'off') {
    externalPromises.push(
      searchOpenFoodFacts(normalizedQuery).catch(err => {
        console.warn('OpenFoodFacts search error (falling back to local):', err);
        return [];
      })
    );
  }

  try {
    const externalResults = await Promise.all(externalPromises);
    const combinedExternal = externalResults.flat();

    for (const item of combinedExternal) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        localMatches.push(item);
      }
    }
  } catch {
    // Graceful offline fallback: return whatever local matches we have
  }

  return localMatches;
}
