import { useState } from 'react';
import { User, Check, Target, Droplets } from 'lucide-react';
import { ActivityLevel, GoalType, UserProfile } from '../types/health';
import { loadUserProfile, saveUserProfile } from '../data/storage';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieBudget,
} from '../domain/calculator';

interface ProfileSettingsProps {
  onProfileUpdated?: (profile: UserProfile) => void;
}

export default function ProfileSettings({ onProfileUpdated }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const budget = calculateCalorieBudget(tdee, profile.goalType, profile.customTargetCalories);

  const handleChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveUserProfile(updated);
    if (onProfileUpdated) onProfileUpdated(updated);

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Profile & BMI Calibration ⚙️</h1>
          <p className="text-xs text-gray-500 font-medium">Configure your body stats and daily calorie goals</p>
        </div>
        {showSavedToast && (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Saved
          </div>
        )}
      </div>

      {/* Live BMI & Goal Status Card */}
      <div className="bg-gradient-to-r from-pastel-peach to-[#ffe6dc] rounded-3xl p-5 border border-pastel-peachBorder shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-pastel-primary">
              CALCULATED INTAKE BUDGET
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
              {budget.targetCalories.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-gray-500">kcal / day</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1.5 rounded-2xl bg-pastel-primary text-white text-xs font-extrabold shadow-xs">
              BMI {bmiInfo.bmi} · {bmiInfo.category}
            </span>
            <div className="text-[10px] text-gray-500 font-medium mt-1">BMR: {Math.round(bmr)} kcal</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pastel-peachBorder/60 text-center text-xs">
          <div className="bg-white/80 rounded-xl p-2">
            <div className="text-[10px] text-gray-500">Protein Target</div>
            <div className="font-extrabold text-pastel-greenText">{budget.proteinGrams}g</div>
          </div>
          <div className="bg-white/80 rounded-xl p-2">
            <div className="text-[10px] text-gray-500">Carbs Target</div>
            <div className="font-extrabold text-pastel-blueText">{budget.carbsGrams}g</div>
          </div>
          <div className="bg-white/80 rounded-xl p-2">
            <div className="text-[10px] text-gray-500">Fat Target</div>
            <div className="font-extrabold text-pastel-yellowText">{budget.fatGrams}g</div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
        
        {/* Basic Info */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            <User className="w-4 h-4 text-pastel-primary" /> Personal Information
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-pastel-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Biological Sex</label>
              <select
                value={profile.sex}
                onChange={e => handleChange('sex', e.target.value as 'male' | 'female')}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-pastel-primary/30"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Age</label>
              <input
                type="number"
                min="10"
                max="120"
                value={profile.age}
                onChange={e => handleChange('age', Number(e.target.value) || 25)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={profile.heightCm}
                onChange={e => handleChange('heightCm', Number(e.target.value) || 170)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={profile.weightKg}
                onChange={e => handleChange('weightKg', Number(e.target.value) || 70)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Goals & Activity */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-pastel-primary" /> Fitness Goal & Activity
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Target Goal</label>
              <select
                value={profile.goalType}
                onChange={e => handleChange('goalType', e.target.value as GoalType)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="maintain">Maintain Healthy BMI</option>
                <option value="mild_loss">Mild Deficit (-300 kcal)</option>
                <option value="standard_loss">Standard Deficit (-500 kcal)</option>
                <option value="mild_gain">Muscle Building (+300 kcal)</option>
                <option value="custom">Custom Target</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Activity Level</label>
              <select
                value={profile.activityLevel}
                onChange={e => handleChange('activityLevel', e.target.value as ActivityLevel)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              >
                <option value="sedentary">Sedentary (Desk work)</option>
                <option value="light">Light (1-2 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
              </select>
            </div>
          </div>

          {profile.goalType === 'custom' && (
            <div>
              <label className="text-xs font-bold text-gray-700">Custom Calorie Goal (kcal)</label>
              <input
                type="number"
                min="800"
                max="5000"
                value={profile.customTargetCalories || budget.targetCalories}
                onChange={e => handleChange('customTargetCalories', Number(e.target.value) || 2000)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.targetWeightKg}
                onChange={e => handleChange('targetWeightKg', Number(e.target.value) || 68)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-pastel-blueText" /> Water Goal (ml)
              </label>
              <input
                type="number"
                step="250"
                value={profile.waterGoalMl}
                onChange={e => handleChange('waterGoalMl', Number(e.target.value) || 3000)}
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
