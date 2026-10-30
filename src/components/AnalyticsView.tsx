import { useMemo } from 'react';
import { Flame, Scale, Sparkles } from 'lucide-react';
import { getHistoricalLogs, loadUserProfile } from '../data/storage';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieBudget,
} from '../domain/calculator';

export default function AnalyticsView() {
  const profile = loadUserProfile();
  const historicalLogs = useMemo(() => getHistoricalLogs(7), []);

  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const budget = calculateCalorieBudget(tdee, profile.goalType, profile.customTargetCalories);

  // Aggregate today's stats (last element of historicalLogs)
  const todayLog = historicalLogs[historicalLogs.length - 1];
  const allTodayFoods = [
    ...todayLog.meals.breakfast,
    ...todayLog.meals.lunch,
    ...todayLog.meals.dinner,
    ...todayLog.meals.snacks,
  ];

  const todayCalories = allTodayFoods.reduce((acc, f) => acc + f.nutrition.calories, 0);
  const todayProtein = allTodayFoods.reduce((acc, f) => acc + f.nutrition.protein, 0);
  const todayCarbs = allTodayFoods.reduce((acc, f) => acc + f.nutrition.carbs, 0);
  const todayFat = allTodayFoods.reduce((acc, f) => acc + f.nutrition.fat, 0);

  const calPercent = Math.min(100, Math.round((todayCalories / budget.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((todayProtein / budget.proteinGrams) * 100));
  const carbsPercent = Math.min(100, Math.round((todayCarbs / budget.carbsGrams) * 100));
  const fatPercent = Math.min(100, Math.round((todayFat / budget.fatGrams) * 100));

  // Chart data points across the 7 days
  const chartPoints = historicalLogs.map((log) => {
    const items = [
      ...log.meals.breakfast,
      ...log.meals.lunch,
      ...log.meals.dinner,
      ...log.meals.snacks,
    ];
    const cals = items.reduce((sum, i) => sum + i.nutrition.calories, 0);
    const dayName = new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
    return {
      day: dayName,
      calories: cals,
      burned: log.burnedCalories,
    };
  });

  const maxCal = Math.max(...chartPoints.map(p => Math.max(p.calories, budget.targetCalories, 500)));

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Activities & Analytics 📊</h1>
          <p className="text-xs text-gray-500 font-medium">Your 7-day intake, macronutrients & BMI progress</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pastel-peach text-pastel-primary text-xs font-bold border border-pastel-peachBorder shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Day Sync</span>
        </div>
      </div>

      {/* Hero Calorie Badge & Graph Card (Inspired by Dribbble Screen 3) */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-pastel-coral text-pastel-coralText text-xs font-extrabold mb-1">
              {todayLog.burnedCalories > 0 ? `${todayLog.burnedCalories} kcal Burned` : `${todayCalories} kcal Eaten`}
            </div>
            <div className="text-xs text-gray-500">
              {historicalLogs.length} days tracked · <span className="font-bold text-gray-800">{Math.max(0, budget.targetCalories - todayCalories)} kcal remaining</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Target</span>
            <div className="text-sm font-black text-gray-900">{budget.targetCalories} kcal</div>
          </div>
        </div>

        {/* 7-Day Visual Curve Area Chart (Pure Responsive SVG) */}
        <div className="pt-2">
          <div className="h-36 w-full flex items-end gap-2 pt-4 px-2 border-b border-gray-100">
            {chartPoints.map((pt, idx) => {
              const heightPercent = Math.min(100, Math.max(12, Math.round((pt.calories / maxCal) * 100)));
              const isToday = idx === chartPoints.length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pt.calories}
                  </div>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-pastel-primary to-[#ff856f] shadow-xs'
                        : 'bg-pastel-peach hover:bg-pastel-peachBorder'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-[11px] font-bold ${isToday ? 'text-pastel-primary' : 'text-gray-400'}`}>
                    {pt.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pastel-primary"></span>
              <span>Intake (kcal)</span>
            </div>
            <span>Daily target: {budget.targetCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* Macro Distribution Cards (2x2 Grid from Dribbble Screen 3) */}
      <div className="space-y-2">
        <h2 className="text-sm font-extrabold text-gray-900 px-1">Macro Distribution</h2>

        <div className="grid grid-cols-2 gap-3">
          
          {/* Calories Progress Card */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Calories</span>
              <Flame className="w-4 h-4 text-pastel-primary" />
            </div>
            <div className="text-xl font-black text-gray-900">{calPercent}%</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pastel-primary rounded-full transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400">{todayCalories} / {budget.targetCalories} kcal</div>
          </div>

          {/* Carbs Progress Card */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Carbs</span>
              <span className="text-sm">🌾</span>
            </div>
            <div className="text-xl font-black text-gray-900">{carbsPercent}%</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400">{todayCarbs}g / {budget.carbsGrams}g target</div>
          </div>

          {/* Fat Progress Card */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Healthy Fat</span>
              <span className="text-sm">🧀</span>
            </div>
            <div className="text-xl font-black text-gray-900">{fatPercent}%</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400">{todayFat}g / {budget.fatGrams}g target</div>
          </div>

          {/* Protein Progress Card */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Protein</span>
              <span className="text-sm">🍗</span>
            </div>
            <div className="text-xl font-black text-gray-900">{proteinPercent}%</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400">{todayProtein}g / {budget.proteinGrams}g target</div>
          </div>

        </div>
      </div>

      {/* Weight & BMI Trajectory Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-pastel-yellowText" />
            <h2 className="text-sm font-extrabold text-gray-900">Weight & BMI Trajectory</h2>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-pastel-yellow text-pastel-yellowText text-[11px] font-extrabold">
            BMI {bmiInfo.bmi} · {bmiInfo.category}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#faf9f6] rounded-2xl p-3 border border-gray-100">
          <div>
            <div className="text-xs text-gray-400">Current Weight</div>
            <div className="text-lg font-black text-gray-900">{profile.weightKg} kg</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Target Goal</div>
            <div className="text-lg font-black text-pastel-primary">{profile.targetWeightKg} kg</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Healthy Range</div>
            <div className="text-xs font-bold text-gray-700">{bmiInfo.healthyMinWeight} - {bmiInfo.healthyMaxWeight} kg</div>
          </div>
        </div>
      </div>

    </div>
  );
}
