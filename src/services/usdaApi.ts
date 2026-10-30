import { FoodItem, Nutrition } from '../types/health';

interface USDANutrient {
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

export async function searchUSDA(
  query: string,
  apiKey = 'DEMO_KEY'
): Promise<FoodItem[]> {
  if (!query.trim()) return [];

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=8&api_key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`USDA API error: ${res.statusText}`);
    }

    const data: USDASearchResponse = await res.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];

    return data.foods.map(item => {
      const nutrition: Nutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      };

      for (const n of item.foodNutrients || []) {
        const name = (n.nutrientName || '').toLowerCase();
        const val = Number(n.value) || 0;

        if (name.includes('energy') && (n.unitName || '').toLowerCase() === 'kcal') {
          nutrition.calories = Math.round(val);
        } else if (name === 'protein') {
          nutrition.protein = Math.round(val * 10) / 10;
        } else if (name.includes('carbohydrate')) {
          nutrition.carbs = Math.round(val * 10) / 10;
        } else if (name.includes('total lipid') || name === 'fat') {
          nutrition.fat = Math.round(val * 10) / 10;
        } else if (name.includes('fiber')) {
          nutrition.fiber = Math.round(val * 10) / 10;
        }
      }

      const servingStr = item.servingSize
        ? `${item.servingSize}${item.servingSizeUnit || 'g'}`
        : undefined;

      return {
        id: `usda-${item.fdcId}`,
        name: item.description,
        brand: item.brandOwner || item.brandName,
        servingSize: servingStr,
        per100g: nutrition,
        source: 'usda',
      };
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
