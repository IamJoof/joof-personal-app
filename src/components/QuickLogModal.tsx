import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  type: 'weight' | 'activity';
  initialValue: number;
  initialNote?: string;
  onClose: () => void;
  onSaveWeight: (weight: number) => void;
  onSaveActivity: (calories: number, note?: string) => void;
}

export default function QuickLogModal({
  isOpen,
  type,
  initialValue,
  initialNote = '',
  onClose,
  onSaveWeight,
  onSaveActivity,
}: QuickLogModalProps) {
  const [val, setVal] = useState<string>(initialValue > 0 ? String(initialValue) : '');
  const [note, setNote] = useState<string>(initialNote);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = Number(val) || 0;
    if (type === 'weight') {
      const weight = Math.max(1, rawNum);
      onSaveWeight(weight);
    } else {
      const burned = Math.max(0, rawNum);
      onSaveActivity(burned, note.trim());
    }
    onClose();
  };

  const isWeight = type === 'weight';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h3 className="font-bold text-gray-900 text-sm">
            {isWeight ? '⚖️ Log Current Weight' : '⚡ Log Exercise / Burned'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700">
              {isWeight ? 'Today’s Scale Weight (kg)' : 'Active Calories Burned (kcal)'}
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                min={isWeight ? '1' : '0'}
                step={isWeight ? '0.1' : '1'}
                required
                autoFocus
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder={isWeight ? 'e.g. 72.5' : 'e.g. 350'}
                className="w-full bg-[#f4f5f7] rounded-xl px-3.5 py-2.5 text-base font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-pastel-primary/30"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                {isWeight ? 'kg' : 'kcal'}
              </span>
            </div>
            {!isWeight && (
              <p className="text-[11px] text-pastel-coralText mt-1 font-medium">
                * Tracked as a bonus deficit to protect your target eating allowance.
              </p>
            )}
          </div>

          {!isWeight && (
            <div>
              <label className="text-xs font-semibold text-gray-700">Activity Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. 30m brisk walk, HIIT session"
                className="w-full mt-1 bg-[#f4f5f7] rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-pastel-primary/30"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-pastel-primary rounded-xl shadow-xs hover:brightness-105 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
