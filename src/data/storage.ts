import { DailyMealLog, LoggedFoodItem, MealType, UserProfile } from '../types/health';

const PROFILE_KEY = 'joof_user_profile';
const LOG_PREFIX = 'joof_daily_log_';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Joof',
  age: 26,
  sex: 'male',
  heightCm: 175,
  weightKg: 72.5,
  targetWeightKg: 68.0,
  activityLevel: 'moderate',
  goalType: 'mild_loss',
  waterGoalMl: 3000,
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function getDailyLog(dateStr: string): DailyMealLog {
  const emptyLog: DailyMealLog = {
    date: dateStr,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    waterMl: 0,
    burnedCalories: 0,
    weightKg: undefined,
  };

  try {
    const raw = localStorage.getItem(LOG_PREFIX + dateStr);
    if (!raw) return emptyLog;
    const parsed = JSON.parse(raw);
    return {
      ...emptyLog,
      ...parsed,
      meals: {
        breakfast: parsed.meals?.breakfast || [],
        lunch: parsed.meals?.lunch || [],
        dinner: parsed.meals?.dinner || [],
        snacks: parsed.meals?.snacks || [],
      },
    };
  } catch {
    return emptyLog;
  }
}

export function saveDailyLog(log: DailyMealLog): void {
  try {
    localStorage.setItem(LOG_PREFIX + log.date, JSON.stringify(log));
  } catch (e) {
    console.error('Failed to save daily log:', e);
  }
}

export function saveMealItem(
  dateStr: string,
  meal: MealType,
  item: LoggedFoodItem
): void {
  const log = getDailyLog(dateStr);
  log.meals[meal].push(item);
  saveDailyLog(log);
}

export function removeMealItem(
  dateStr: string,
  meal: MealType,
  itemId: string
): void {
  const log = getDailyLog(dateStr);
  log.meals[meal] = log.meals[meal].filter(i => i.id !== itemId);
  saveDailyLog(log);
}

export function updateWaterIntake(dateStr: string, deltaMl: number): number {
  const log = getDailyLog(dateStr);
  log.waterMl = Math.max(0, log.waterMl + deltaMl);
  saveDailyLog(log);
  return log.waterMl;
}

export function logWeightEntry(dateStr: string, weightKg: number): void {
  const log = getDailyLog(dateStr);
  log.weightKg = weightKg;
  saveDailyLog(log);

  // Also update current weight on user profile if logging for today
  const profile = loadUserProfile();
  profile.weightKg = weightKg;
  saveUserProfile(profile);
}

export function logActivityEntry(
  dateStr: string,
  calories: number,
  note?: string
): void {
  const log = getDailyLog(dateStr);
  log.burnedCalories = calories;
  if (note !== undefined) {
    log.burnedNote = note;
  }
  saveDailyLog(log);
}

/**
 * Retrieves daily meal logs for the past N days leading up to today.
 */
export function getHistoricalLogs(days: number): DailyMealLog[] {
  const logs: DailyMealLog[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    logs.push(getDailyLog(dateStr));
  }

  return logs;
}
