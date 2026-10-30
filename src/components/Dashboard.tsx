import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Scale,
  Zap,
  Plus
} from 'lucide-react';
import { DailyMealLog, MealType, UserProfile } from '../types/health';
import {
  loadUserProfile,
  getDailyLog,
  updateWaterIntake,
  logWeightEntry,
  logActivityEntry,
  removeMealItem,
} from '../data/storage';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieBudget,
  calculateBonusDeficit,
} from '../domain/calculator';
import MetricTile from './MetricTile';
import MealSection from './MealSection';
import QuickLogModal from './QuickLogModal';

interface DashboardProps {
  onOpenMeasurer: (meal: MealType, dateStr?: string) => void;
  refreshTrigger?: number;
}

export default function Dashboard({ onOpenMeasurer, refreshTrigger }: DashboardProps) {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [dailyLog, setDailyLog] = useState<DailyMealLog>(() => getDailyLog(currentDateStr));

  // Quick log modal state
  const [quickLogType, setQuickLogType] = useState<'weight' | 'activity' | null>(null);

  // Sync log on date change
  useEffect(() => {
    setDailyLog(getDailyLog(currentDateStr));
    setProfile(loadUserProfile());
  }, [currentDateStr, refreshTrigger]);

  // Calculations
  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const budget = calculateCalorieBudget(tdee, profile.goalType, profile.customTargetCalories);

  // Daily totals
  const allMeals = [
    ...dailyLog.meals.breakfast,
    ...dailyLog.meals.lunch,
    ...dailyLog.meals.dinner,
    ...dailyLog.meals.snacks,
  ];
  const totalCaloriesConsumed = allMeals.reduce((acc, i) => acc + i.nutrition.calories, 0);

  const deficitSummary = calculateBonusDeficit(
    budget.targetCalories,
    totalCaloriesConsumed,
    dailyLog.burnedCalories
  );

  const caloriePercent = Math.min(
    100,
    Math.round((totalCaloriesConsumed / budget.targetCalories) * 100)
  );
  const waterPercent = Math.min(
    100,
    Math.round((dailyLog.waterMl / (profile.waterGoalMl || 3000)) * 100)
  );

  // Date switching
  const handleDayShift = (deltaDays: number) => {
    const d = new Date(currentDateStr + 'T12:00:00');
    d.setDate(d.getDate() + deltaDays);
    setCurrentDateStr(d.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(currentDateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAddWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMl = updateWaterIntake(currentDateStr, 250);
    setDailyLog(prev => ({ ...prev, waterMl: newMl }));
  };

  const handleRemoveMealItem = (meal: MealType, itemId: string) => {
    removeMealItem(currentDateStr, meal, itemId);
    setDailyLog(getDailyLog(currentDateStr));
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Bar Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-pastel-peach border border-pastel-peachBorder flex items-center justify-center text-2xl shadow-xs">
            🥑
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium leading-none">Welcome back</p>
            <h1 className="text-lg font-black text-gray-900 tracking-tight mt-1">
              Good morning, {profile.name} 🌞
            </h1>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center bg-white px-2 py-1.5 rounded-2xl border border-gray-100 shadow-xs">
          <button
            onClick={() => handleDayShift(-1)}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-50"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-2 text-gray-700 min-w-[85px] text-center">
            {formattedDate}
          </span>
          <button
            onClick={() => handleDayShift(1)}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-50"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BMI Calibrated Target Banner */}
      <div className="bg-gradient-to-r from-pastel-peach to-[#ffe6dc] rounded-3xl p-4 sm:p-5 border border-pastel-peachBorder shadow-xs flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-pastel-primary">
            BMI CALIBRATED TARGET
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
            {budget.targetCalories.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-gray-500">kcal / day</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Target healthy weight: {bmiInfo.healthyMinWeight}kg – {bmiInfo.healthyMaxWeight}kg
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1.5 rounded-2xl bg-pastel-primary text-white text-xs font-extrabold shadow-xs">
            BMI {bmiInfo.bmi} · {bmiInfo.category}
          </span>
          <div className="text-[10px] text-gray-500 font-medium mt-1">
            TDEE: {tdee} kcal
          </div>
        </div>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* Calories Card */}
        <MetricTile
          title="Calories"
          value={totalCaloriesConsumed}
          unit="kcal"
          subtitle={`Left ${deficitSummary.foodRemaining} kcal`}
          icon={<Flame className="w-4 h-4 text-pastel-greenText" />}
          bgClass="bg-pastel-green"
          textClass="text-pastel-greenText"
          borderClass="border-pastel-greenBorder"
          progressPercent={caloriePercent}
          progressBarColor="bg-emerald-500"
        />

        {/* Water Card */}
        <MetricTile
          title="Water"
          value={dailyLog.waterMl}
          unit="ml"
          subtitle={`Goal ${(profile.waterGoalMl / 1000).toFixed(1)}L`}
          icon={<Droplets className="w-4 h-4 text-pastel-blueText" />}
          bgClass="bg-pastel-blue"
          textClass="text-pastel-blueText"
          borderClass="border-pastel-blueBorder"
          progressPercent={waterPercent}
          progressBarColor="bg-sky-500"
          actionButton={
            <button
              onClick={handleAddWater}
              aria-label="Add 250ml water"
              className="w-full py-1 text-[11px] font-bold text-pastel-blueText bg-white/80 rounded-xl hover:bg-white flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 250ml
            </button>
          }
        />

        {/* Weight Card */}
        <MetricTile
          title="Weight"
          value={dailyLog.weightKg || profile.weightKg}
          unit="kg"
          subtitle={`Goal ${profile.targetWeightKg}kg · tap to log`}
          icon={<Scale className="w-4 h-4 text-pastel-yellowText" />}
          bgClass="bg-pastel-yellow"
          textClass="text-pastel-yellowText"
          borderClass="border-pastel-yellowBorder"
          progressPercent={85}
          progressBarColor="bg-amber-500"
          onClick={() => setQuickLogType('weight')}
        />

        {/* Burned / Deficit Card */}
        <MetricTile
          title="Burned"
          value={dailyLog.burnedCalories}
          unit="kcal"
          subtitle={dailyLog.burnedNote || '+Bonus Deficit · tap to log'}
          icon={<Zap className="w-4 h-4 text-pastel-coralText" />}
          bgClass="bg-pastel-coral"
          textClass="text-pastel-coralText"
          borderClass="border-pastel-coralBorder"
          progressPercent={Math.min(100, (dailyLog.burnedCalories / 500) * 100)}
          progressBarColor="bg-rose-500"
          onClick={() => setQuickLogType('activity')}
        />

      </div>

      {/* Today's Meal Buckets Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-gray-900">Today's Meals 🥗</h2>
          <button
            onClick={() => onOpenMeasurer('lunch')}
            className="text-xs font-bold text-pastel-primary hover:underline"
          >
            + Measure & Log Food
          </button>
        </div>

        <MealSection
          meal="breakfast"
          items={dailyLog.meals.breakfast}
          onOpenMeasurer={(m) => onOpenMeasurer(m, currentDateStr)}
          onRemoveItem={handleRemoveMealItem}
        />

        <MealSection
          meal="lunch"
          items={dailyLog.meals.lunch}
          onOpenMeasurer={(m) => onOpenMeasurer(m, currentDateStr)}
          onRemoveItem={handleRemoveMealItem}
        />

        <MealSection
          meal="dinner"
          items={dailyLog.meals.dinner}
          onOpenMeasurer={(m) => onOpenMeasurer(m, currentDateStr)}
          onRemoveItem={handleRemoveMealItem}
        />

        <MealSection
          meal="snacks"
          items={dailyLog.meals.snacks}
          onOpenMeasurer={(m) => onOpenMeasurer(m, currentDateStr)}
          onRemoveItem={handleRemoveMealItem}
        />
      </div>

      {/* Quick Log Popup */}
      <QuickLogModal
        isOpen={quickLogType !== null}
        type={quickLogType || 'weight'}
        initialValue={
          quickLogType === 'weight'
            ? dailyLog.weightKg || profile.weightKg
            : dailyLog.burnedCalories
        }
        initialNote={dailyLog.burnedNote}
        onClose={() => setQuickLogType(null)}
        onSaveWeight={w => {
          logWeightEntry(currentDateStr, w);
          setDailyLog(getDailyLog(currentDateStr));
          setProfile(loadUserProfile());
        }}
        onSaveActivity={(c, note) => {
          logActivityEntry(currentDateStr, c, note);
          setDailyLog(getDailyLog(currentDateStr));
        }}
      />

    </div>
  );
}
