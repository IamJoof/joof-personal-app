import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserProfile,
  saveUserProfile,
  getDailyLog,
  saveMealItem,
  removeMealItem,
  updateWaterIntake,
  logWeightEntry,
  logActivityEntry,
  getHistoricalLogs
} from './storage';

describe('Local Storage Repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default profile and persists updates', () => {
    const initial = loadUserProfile();
    expect(initial.weightKg).toBeGreaterThan(0);
    expect(initial.name).toBe('Joof');
    saveUserProfile({ ...initial, weightKg: 75, targetWeightKg: 68 });
    const updated = loadUserProfile();
    expect(updated.weightKg).toBe(75);
    expect(updated.targetWeightKg).toBe(68);
  });

  it('adds and removes food items from daily meal buckets', () => {
    const date = '2026-10-30';
    saveMealItem(date, 'breakfast', {
      id: 'item-1',
      foodName: 'Oatmeal',
      grams: 50,
      nutrition: { calories: 190, protein: 7, carbs: 34, fat: 3, fiber: 5 },
      loggedAt: '08:30 AM',
    });

    let log = getDailyLog(date);
    expect(log.meals.breakfast.length).toBe(1);
    expect(log.meals.breakfast[0].foodName).toBe('Oatmeal');

    removeMealItem(date, 'breakfast', 'item-1');
    log = getDailyLog(date);
    expect(log.meals.breakfast.length).toBe(0);
  });

  it('updates water intake with increments', () => {
    const date = '2026-10-30';
    expect(updateWaterIntake(date, 250)).toBe(250);
    expect(updateWaterIntake(date, 250)).toBe(500);
    expect(getDailyLog(date).waterMl).toBe(500);
  });

  it('logs weight entry and active calories burned with optional note', () => {
    const date = '2026-10-30';
    logWeightEntry(date, 72.4);
    logActivityEntry(date, 350, '30m treadmill');

    const log = getDailyLog(date);
    expect(log.weightKg).toBe(72.4);
    expect(log.burnedCalories).toBe(350);
    expect(log.burnedNote).toBe('30m treadmill');
  });

  it('retrieves historical logs for analytics across multiple days', () => {
    saveMealItem('2026-10-28', 'dinner', {
      id: 'd-1',
      foodName: 'Salmon',
      grams: 150,
      nutrition: { calories: 300, protein: 30, carbs: 0, fat: 18, fiber: 0 },
      loggedAt: '07:00 PM',
    });
    saveMealItem('2026-10-29', 'lunch', {
      id: 'l-1',
      foodName: 'Chicken',
      grams: 150,
      nutrition: { calories: 240, protein: 45, carbs: 0, fat: 5, fiber: 0 },
      loggedAt: '01:00 PM',
    });

    const logs = getHistoricalLogs(7);
    expect(logs.length).toBe(7);
    const day28 = logs.find(l => l.date === '2026-10-28');
    expect(day28?.meals.dinner.length).toBe(1);
  });
});
