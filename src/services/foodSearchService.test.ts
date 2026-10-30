import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFoodItems, cacheFoodItem, getCachedFoods } from './foodSearchService';

describe('Unified Food Search Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns matching seed foods immediately even when offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));
    const results = await searchFoodItems('chicken');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(f => f.name.toLowerCase().includes('chicken'))).toBe(true);
  });

  it('handles external API network errors gracefully and falls back to seed/cached items', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));
    const results = await searchFoodItems('egg');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(f => f.name.toLowerCase().includes('egg'))).toBe(true);
  });

  it('caches custom or external food items locally for instant offline lookup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));
    cacheFoodItem({
      id: 'custom-protein-bar',
      name: 'Joof Special Protein Bar',
      brand: 'Joof Nutrition',
      servingSize: '60g',
      source: 'custom',
      per100g: { calories: 350, protein: 35, carbs: 25, fat: 10, fiber: 8 },
    });

    const cached = getCachedFoods();
    expect(cached.some(f => f.name === 'Joof Special Protein Bar')).toBe(true);

    const searchRes = await searchFoodItems('Special Protein');
    expect(searchRes.some(f => f.name === 'Joof Special Protein Bar')).toBe(true);
  });
});
