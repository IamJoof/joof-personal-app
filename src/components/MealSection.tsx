import { Plus, Trash2 } from 'lucide-react';
import { LoggedFoodItem, MealType } from '../types/health';

interface MealSectionProps {
  meal: MealType;
  items: LoggedFoodItem[];
  onOpenMeasurer: (meal: MealType) => void;
  onRemoveItem: (meal: MealType, itemId: string) => void;
}

const MEAL_CONFIG: Record<
  MealType,
  { title: string; icon: string; time: string; badgeColor: string }
> = {
  breakfast: { title: 'Breakfast', icon: '🍳', time: '7:00 - 9:00 AM', badgeColor: 'bg-amber-50 text-amber-800' },
  lunch: { title: 'Lunch', icon: '🥗', time: '12:00 - 2:00 PM', badgeColor: 'bg-emerald-50 text-emerald-800' },
  dinner: { title: 'Dinner', icon: '🍲', time: '6:30 - 8:30 PM', badgeColor: 'bg-orange-50 text-orange-800' },
  snacks: { title: 'Snacks', icon: '🍎', time: 'Anytime', badgeColor: 'bg-purple-50 text-purple-800' },
};

export default function MealSection({
  meal,
  items,
  onOpenMeasurer,
  onRemoveItem,
}: MealSectionProps) {
  const config = MEAL_CONFIG[meal];

  const totalCalories = items.reduce((sum, item) => sum + item.nutrition.calories, 0);
  const totalProtein = Math.round(items.reduce((sum, item) => sum + item.nutrition.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, item) => sum + item.nutrition.carbs, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((sum, item) => sum + item.nutrition.fat, 0) * 10) / 10;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{config.title}</h3>
              <span className="text-[10px] text-gray-400 font-medium">{config.time}</span>
            </div>
            <p className="text-[11px] text-gray-500 font-semibold">
              {totalCalories} kcal {items.length > 0 && `· P: ${totalProtein}g · C: ${totalCarbs}g · F: ${totalFat}g`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenMeasurer(meal)}
          className="flex items-center gap-1 text-xs font-bold text-pastel-primary bg-pastel-peach px-3 py-1.5 rounded-xl hover:bg-pastel-peachBorder transition-colors"
          aria-label={`+ Add food to ${meal}`}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-3 bg-[#faf9f6] rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400">No food logged yet for {config.title.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-[#faf9f6] rounded-2xl hover:bg-gray-100/70 transition-colors group"
            >
              <div>
                <div className="text-xs font-bold text-gray-800">{item.foodName}</div>
                <div className="text-[10px] text-gray-400">
                  {item.grams}g · {item.loggedAt} · P: {item.nutrition.protein}g · C: {item.nutrition.carbs}g
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-pastel-primary">
                  {item.nutrition.calories} kcal
                </span>
                <button
                  onClick={() => onRemoveItem(meal, item.id)}
                  className="opacity-60 hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                  title="Remove item"
                  aria-label={`Remove ${item.foodName}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
