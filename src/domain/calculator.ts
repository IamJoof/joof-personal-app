import {
  ActivityLevel,
  BMICalculation,
  BMICategory,
  CalorieBudget,
  DeficitSummary,
  GoalType,
  Nutrition
} from '../types/health';

/**
 * Calculates BMI and healthy weight range for height in centimeters.
 * BMI = weight(kg) / (height(m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): BMICalculation {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Underweight',
      healthyMinWeight: 0,
      healthyMaxWeight: 0,
    };
  }

  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);

  let category: BMICategory = 'Normal';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  // Healthy weight range (BMI 18.5 to 24.9)
  const healthyMinWeight = 18.5 * (heightMeters * heightMeters);
  const healthyMaxWeight = 24.9 * (heightMeters * heightMeters);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    healthyMinWeight: Math.round(healthyMinWeight * 10) / 10,
    healthyMaxWeight: Math.round(healthyMaxWeight * 10) / 10,
  };
}

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity level.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };

  const multiplier = multipliers[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates daily calorie budget and standard macronutrient distribution.
 * Macros: 30% Protein, 40% Carbs, 30% Fat (standard balanced guideline).
 */
export function calculateCalorieBudget(
  tdee: number,
  goal: GoalType,
  customTarget?: number
): CalorieBudget {
  let targetCalories = tdee;
  let deficitOrSurplus = 0;

  if (goal === 'custom' && customTarget && customTarget > 0) {
    targetCalories = customTarget;
    deficitOrSurplus = customTarget - tdee;
  } else {
    switch (goal) {
      case 'mild_loss':
        deficitOrSurplus = -300;
        targetCalories = Math.max(1200, tdee - 300);
        break;
      case 'standard_loss':
        deficitOrSurplus = -500;
        targetCalories = Math.max(1200, tdee - 500);
        break;
      case 'mild_gain':
        deficitOrSurplus = 300;
        targetCalories = tdee + 300;
        break;
      case 'maintain':
      default:
        deficitOrSurplus = 0;
        targetCalories = tdee;
        break;
    }
  }

  // 4 kcal per gram protein & carbs, 9 kcal per gram fat
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.3) / 9);

  return {
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    deficitOrSurplus,
  };
}

/**
 * Strict bonus deficit calculation.
 * Food remaining is strictly: Budget - Consumed.
 * Exercise burned calories are added to bonus deficit and total deficit, NEVER food remaining.
 */
export function calculateBonusDeficit(
  budget: number,
  consumed: number,
  burned: number
): DeficitSummary {
  const foodRemaining = Math.max(0, budget - consumed);
  const foodDeficit = budget - consumed;
  const bonusDeficit = Math.max(0, burned);
  const totalDeficit = foodDeficit + bonusDeficit;

  return {
    budget,
    consumed,
    foodRemaining,
    burned,
    bonusDeficit,
    totalDeficit,
  };
}

/**
 * Scales nutritional metrics linearly from a 100g base for a specific portion in grams.
 */
export function calculatePortionNutrition(basePer100g: Nutrition, grams: number): Nutrition {
  if (grams <= 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };
  }

  const factor = grams / 100;
  return {
    calories: Math.round(basePer100g.calories * factor * 10) / 10,
    protein: Math.round(basePer100g.protein * factor * 10) / 10,
    carbs: Math.round(basePer100g.carbs * factor * 10) / 10,
    fat: Math.round(basePer100g.fat * factor * 10) / 10,
    fiber: Math.round(basePer100g.fiber * factor * 10) / 10,
  };
}
