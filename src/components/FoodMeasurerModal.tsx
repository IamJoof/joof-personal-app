import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Scale, PlusCircle, Check } from 'lucide-react';
import { FoodItem, LoggedFoodItem, MealType } from '../types/health';
import { SEED_FOODS } from '../data/seedFoods';
import { calculatePortionNutrition } from '../domain/calculator';
import { searchFoodItems, cacheFoodItem } from '../services/foodSearchService';

interface FoodMeasurerModalProps {
  isOpen: boolean;
  initialMeal?: MealType;
  remainingCalories: number;
  onClose: () => void;
  onAddFood: (meal: MealType, item: LoggedFoodItem) => void;
}

export default function FoodMeasurerModal({
  isOpen,
  initialMeal = 'breakfast',
  remainingCalories,
  onClose,
  onAddFood,
}: FoodMeasurerModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>(SEED_FOODS);
  const [selectedFood, setSelectedFood] = useState<FoodItem>(SEED_FOODS[0]);
  const [grams, setGrams] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [isSearching, setIsSearching] = useState(false);

  // Custom food form state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('150');
  const [customProtein, setCustomProtein] = useState('10');
  const [customCarbs, setCustomCarbs] = useState('15');
  const [customFat, setCustomFat] = useState('5');

  useEffect(() => {
    if (initialMeal) setSelectedMeal(initialMeal);
  }, [initialMeal]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults(SEED_FOODS);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchFoodItems(searchQuery);
        setSearchResults(results);
        if (results.length > 0 && searchQuery.length > 1) {
          setSelectedFood(results[0]);
        }
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const portionNutrition = useMemo(() => {
    return calculatePortionNutrition(selectedFood.per100g, grams);
  }, [selectedFood, grams]);

  const remainingAfterMeal = Math.max(0, remainingCalories - portionNutrition.calories);

  if (!isOpen) return null;

  const handleAddFood = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const loggedItem: LoggedFoodItem = {
      id: `logged-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodName: selectedFood.name,
      grams,
      nutrition: portionNutrition,
      loggedAt: timeStr,
      portionLabel: `${grams}g`,
    };

    onAddFood(selectedMeal, loggedItem);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      source: 'custom',
      per100g: {
        calories: Number(customCalories) || 0,
        protein: Number(customProtein) || 0,
        carbs: Number(customCarbs) || 0,
        fat: Number(customFat) || 0,
        fiber: 0,
      },
    };

    cacheFoodItem(newFood);
    setSelectedFood(newFood);
    setActiveTab('search');
    setSearchQuery(customName);
  };

  const mealLabels: Record<MealType, string> = {
    breakfast: '🍳 Breakfast',
    lunch: '🥗 Lunch',
    dinner: '🍲 Dinner',
    snacks: '🍎 Snack',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-[#faf9f6]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-pastel-peach flex items-center justify-center text-pastel-primary">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Measure & Log Food</h2>
              <p className="text-xs text-gray-500">Calculate exact calories by weight or portion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold">
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(meal => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`py-2 rounded-xl transition-all ${
                selectedMeal === meal
                  ? 'bg-white text-pastel-primary shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {mealLabels[meal]}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Search vs Custom Toggle */}
          <div className="flex border-b border-gray-100 pb-2 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-1 ${activeTab === 'search' ? 'border-b-2 border-pastel-primary text-pastel-primary' : 'text-gray-400'}`}
            >
              Search Database & Staples
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-1 ${activeTab === 'custom' ? 'border-b-2 border-pastel-primary text-pastel-primary' : 'text-gray-400'}`}
            >
              + Create Custom Food
            </button>
          </div>

          {activeTab === 'search' ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search food (e.g. Avocado, Chicken, Rice)..."
                  className="w-full bg-[#f4f5f7] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pastel-primary/30 transition-all border border-transparent focus:border-pastel-primary/40"
                />
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                    searching...
                  </span>
                )}
              </div>

              {/* Quick Results Pills / Dropdown */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {searchResults.slice(0, 7).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFood(item)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                      selectedFood.id === item.id
                        ? 'bg-pastel-peach border-pastel-peachBorder text-pastel-primary font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {item.name.length > 20 ? item.name.slice(0, 18) + '...' : item.name}
                  </button>
                ))}
              </div>

              {/* Selected Food Detail Card */}
              <div className="bg-[#FFF9F6] border border-pastel-peachBorder rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-primary">
                      {selectedFood.source === 'usda'
                        ? 'USDA SCIENTIFIC'
                        : selectedFood.source === 'openfoodfacts'
                        ? 'BRANDED'
                        : 'HEALTH STAPLE'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5">{selectedFood.name}</h3>
                    {selectedFood.brand && (
                      <p className="text-[11px] text-gray-500">{selectedFood.brand}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedFood.per100g.calories} kcal <span className="text-[10px] text-gray-400">/ 100g</span>
                  </span>
                </div>

                {/* Gram Weight Measurer Controls */}
                <div className="space-y-2 pt-2 border-t border-pastel-peachBorder/60">
                  <div className="flex items-center justify-between">
                    <label htmlFor="gram-weight-input" className="text-xs font-semibold text-gray-700">
                      Portion Weight
                    </label>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-pastel-peachBorder">
                      <input
                        id="gram-weight-input"
                        aria-label="Gram Weight"
                        type="number"
                        min="0"
                        max="1500"
                        value={grams}
                        onChange={e => setGrams(Math.max(0, Number(e.target.value) || 0))}
                        className="w-16 text-right font-extrabold text-sm text-gray-900 focus:outline-hidden"
                      />
                      <span className="text-xs text-gray-500 font-medium">grams</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="5"
                    value={grams}
                    onChange={e => setGrams(Number(e.target.value))}
                    className="w-full accent-pastel-primary cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {[50, 100, 150, 200].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGrams(val)}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                          grams === val
                            ? 'bg-pastel-primary text-white border-pastel-primary'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {val}g
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Computed Macros */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="bg-white rounded-xl p-2 border border-pastel-peachBorder">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Calories</div>
                    <div data-testid="computed-calories" className="text-sm font-extrabold text-pastel-primary">
                      {portionNutrition.calories}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-pastel-peachBorder">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Protein</div>
                    <div className="text-sm font-extrabold text-pastel-greenText">
                      {portionNutrition.protein}g
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-pastel-peachBorder">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Carbs</div>
                    <div className="text-sm font-extrabold text-pastel-blueText">
                      {portionNutrition.carbs}g
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-pastel-peachBorder">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Fat</div>
                    <div className="text-sm font-extrabold text-pastel-yellowText">
                      {portionNutrition.fat}g
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact on Daily Budget */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500">Remaining after logging:</span>
                  <div className="font-bold text-gray-800 text-sm">
                    {remainingAfterMeal} kcal
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-400">
                  {remainingCalories} budget left
                </div>
              </div>
            </>
          ) : (
            /* Custom Food Form */
            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Food Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Grandma's Oatmeal Cookie"
                  className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs border border-transparent focus:border-pastel-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Calories / 100g</label>
                  <input
                    type="number"
                    required
                    value={customCalories}
                    onChange={e => setCustomCalories(e.target.value)}
                    className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs border border-transparent focus:border-pastel-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={e => setCustomProtein(e.target.value)}
                    className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs border border-transparent focus:border-pastel-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(e.target.value)}
                    className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs border border-transparent focus:border-pastel-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={e => setCustomFat(e.target.value)}
                    className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs border border-transparent focus:border-pastel-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Save to My Foods & Measure
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleAddFood}
            className="w-full py-3 rounded-2xl bg-pastel-primary text-white font-bold text-sm shadow-md shadow-pastel-primary/30 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            + Add to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} ({portionNutrition.calories} kcal)
          </button>
        </div>

      </div>
    </div>
  );
}
