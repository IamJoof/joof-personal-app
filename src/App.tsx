import { useState } from 'react';
import { MealType, LoggedFoodItem } from './types/health';
import { saveMealItem, getDailyLog, loadUserProfile } from './data/storage';
import { calculateBMR, calculateTDEE, calculateCalorieBudget } from './domain/calculator';
import Dashboard from './components/Dashboard';
import AnalyticsView from './components/AnalyticsView';
import ProfileSettings from './components/ProfileSettings';
import BottomNav, { NavTab } from './components/BottomNav';
import FoodMeasurerModal from './components/FoodMeasurerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMeasurerOpen, setIsMeasurerOpen] = useState(false);
  const [measurerMeal, setMeasurerMeal] = useState<MealType>('lunch');
  const [refreshKey, setRefreshKey] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const profile = loadUserProfile();
  const dailyLog = getDailyLog(todayStr);

  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const budget = calculateCalorieBudget(tdee, profile.goalType, profile.customTargetCalories);

  const totalCaloriesConsumed = [
    ...dailyLog.meals.breakfast,
    ...dailyLog.meals.lunch,
    ...dailyLog.meals.dinner,
    ...dailyLog.meals.snacks,
  ].reduce((acc, f) => acc + f.nutrition.calories, 0);

  const remainingCalories = Math.max(0, budget.targetCalories - totalCaloriesConsumed);

  const [measurerDate, setMeasurerDate] = useState<string>(todayStr);

  const handleOpenMeasurer = (meal: MealType = 'lunch', dateStr?: string) => {
    setMeasurerMeal(meal);
    setMeasurerDate(dateStr || todayStr);
    setIsMeasurerOpen(true);
  };

  const handleAddFood = (meal: MealType, item: LoggedFoodItem) => {
    saveMealItem(measurerDate, meal, item);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1E1E1E] flex flex-col font-sans selection:bg-rose-200">
      
      {/* Centered Mobile/Desktop Wrapper */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 sm:p-5 flex flex-col">
        {activeTab === 'dashboard' && (
          <Dashboard refreshTrigger={refreshKey} onOpenMeasurer={handleOpenMeasurer} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView key={refreshKey} />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            onProfileUpdated={() => setRefreshKey(prev => prev + 1)}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenMeasurer={() => handleOpenMeasurer('lunch')}
      />

      {/* Food Measurer Modal */}
      <FoodMeasurerModal
        isOpen={isMeasurerOpen}
        initialMeal={measurerMeal}
        remainingCalories={remainingCalories}
        onClose={() => setIsMeasurerOpen(false)}
        onAddFood={handleAddFood}
      />

    </div>
  );
}
