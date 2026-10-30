import { FoodItem, Nutrition } from '../types/health';

interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, number | string>;
}

interface OFFResponse {
  products?: OFFProduct[];
}

export async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
  if (!query.trim()) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=8`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JoofPersonalApp/1.0 (contact@joof.app)',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenFoodFacts API error: ${res.statusText}`);
    }

    const data: OFFResponse = await res.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products
      .filter(p => p.product_name && p.product_name.trim().length > 0)
      .map(p => {
        const n = p.nutriments || {};
        const cal =
          Number(n['energy-kcal_100g']) ||
          Number(n['energy-kcal']) ||
          Math.round(Number(n['energy_100g'] || 0) / 4.184) ||
          0;

        const nutrition: Nutrition = {
          calories: Math.round(cal),
          protein: Math.round(Number(n['proteins_100g'] || 0) * 10) / 10,
          carbs: Math.round(Number(n['carbohydrates_100g'] || 0) * 10) / 10,
          fat: Math.round(Number(n['fat_100g'] || 0) * 10) / 10,
          fiber: Math.round(Number(n['fiber_100g'] || 0) * 10) / 10,
        };

        return {
          id: `off-${p.code || Math.random().toString(36).slice(2)}`,
          name: p.product_name || 'Unknown Item',
          brand: p.brands,
          servingSize: p.serving_size,
          per100g: nutrition,
          source: 'openfoodfacts',
        };
      });
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
