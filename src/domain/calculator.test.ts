import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieBudget,
  calculateBonusDeficit,
  calculatePortionNutrition
} from './calculator';

describe('Calculator Domain Logic', () => {
  it('calculates BMI correctly and categorizes normal weight', () => {
    const res = calculateBMI(70, 175);
    expect(res.bmi).toBeCloseTo(22.86, 1);
    expect(res.category).toBe('Normal');
    expect(res.healthyMinWeight).toBeCloseTo(56.7, 1);
    expect(res.healthyMaxWeight).toBeCloseTo(76.3, 1);
  });

  it('categorizes underweight, overweight, and obese BMI ranges accurately', () => {
    expect(calculateBMI(50, 175).category).toBe('Underweight');
    expect(calculateBMI(85, 175).category).toBe('Overweight');
    expect(calculateBMI(105, 175).category).toBe('Obese');
  });

  it('handles boundary / extreme inputs gracefully without NaN or infinity', () => {
    const zeroRes = calculateBMI(0, 0);
    expect(Number.isFinite(zeroRes.bmi)).toBe(true);
    expect(zeroRes.category).toBe('Underweight');

    const nanRes = calculateBMI(NaN, 175);
    expect(nanRes.bmi).toBe(0);
    expect(nanRes.category).toBe('Underweight');

    const infRes = calculateBMI(70, Infinity);
    expect(infRes.bmi).toBe(0);
    expect(infRes.category).toBe('Underweight');

    const highRes = calculateBMI(250, 250);
    expect(Number.isFinite(highRes.bmi)).toBe(true);

    expect(calculateBMR(NaN, 175, 25, 'male')).toBe(0);
    expect(calculateBMR(-50, 175, 25, 'male')).toBe(0);
    expect(calculateBMR(70, 0, 25, 'male')).toBe(0);
  });

  it('calculates BMR using Mifflin-St Jeor formula for male and female', () => {
    // Male: 10 * 70 + 6.25 * 175 - 5 * 25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(70, 175, 25, 'male')).toBeCloseTo(1673.75, 1);
    // Female: 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    expect(calculateBMR(60, 165, 25, 'female')).toBeCloseTo(1345.25, 1);
  });

  it('calculates TDEE using standard activity multipliers', () => {
    const bmr = 1600;
    expect(calculateTDEE(bmr, 'sedentary')).toBe(1920); // 1.2
    expect(calculateTDEE(bmr, 'light')).toBe(2200); // 1.375
    expect(calculateTDEE(bmr, 'moderate')).toBe(2480); // 1.55
    expect(calculateTDEE(bmr, 'very_active')).toBe(2760); // 1.725
  });

  it('calculates calorie budget with goal deficits and custom override', () => {
    const tdee = 2200;
    expect(calculateCalorieBudget(tdee, 'maintain').targetCalories).toBe(2200);
    expect(calculateCalorieBudget(tdee, 'mild_loss').targetCalories).toBe(1900); // -300
    expect(calculateCalorieBudget(tdee, 'standard_loss').targetCalories).toBe(1700); // -500
    expect(calculateCalorieBudget(tdee, 'mild_gain').targetCalories).toBe(2500); // +300
    expect(calculateCalorieBudget(tdee, 'custom', 2050).targetCalories).toBe(2050);
  });

  it('enforces strict bonus deficit where exercise calories do NOT increase food remaining', () => {
    const budget = 2000;
    const consumed = 1400;
    const burned = 400;
    const res = calculateBonusDeficit(budget, consumed, burned);
    expect(res.foodRemaining).toBe(600); // 2000 - 1400 (never 1000)
    expect(res.bonusDeficit).toBe(400);
    expect(res.totalDeficit).toBe(1000); // (2000 - 1400) + 400
  });

  it('calculates portion nutrition scaled linearly by grams and handles 0g or negative safely', () => {
    const per100g = { calories: 200, protein: 20, carbs: 10, fat: 5, fiber: 2 };
    expect(calculatePortionNutrition(per100g, 150)).toEqual({
      calories: 300, protein: 30, carbs: 15, fat: 7.5, fiber: 3
    });
    expect(calculatePortionNutrition(per100g, 0)).toEqual({
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
    });
    expect(calculatePortionNutrition(per100g, -20)).toEqual({
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
    });
  });
});
