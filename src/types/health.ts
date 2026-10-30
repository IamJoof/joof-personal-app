export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export type GoalType = 'maintain' | 'mild_loss' | 'standard_loss' | 'mild_gain' | 'custom';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize?: string;
  per100g: Nutrition;
  source: 'seed' | 'usda' | 'openfoodfacts' | 'custom';
}

export interface LoggedFoodItem {
  id: string;
  foodName: string;
  grams: number;
  nutrition: Nutrition;
  loggedAt: string; // e.g. "08:30 AM"
  portionLabel?: string;
}

export interface DailyMealLog {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: LoggedFoodItem[];
    lunch: LoggedFoodItem[];
    dinner: LoggedFoodItem[];
    snacks: LoggedFoodItem[];
  };
  waterMl: number;
  burnedCalories: number;
  burnedNote?: string;
  weightKg?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  customTargetCalories?: number;
  waterGoalMl: number;
}

export interface BMICalculation {
  bmi: number;
  category: BMICategory;
  healthyMinWeight: number;
  healthyMaxWeight: number;
}

export interface CalorieBudget {
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  deficitOrSurplus: number;
}

export interface DeficitSummary {
  budget: number;
  consumed: number;
  foodRemaining: number;
  burned: number;
  bonusDeficit: number;
  totalDeficit: number;
}
