import React from 'react';

interface MetricTileProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressPercent: number;
  progressBarColor: string;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export default function MetricTile({
  title,
  value,
  unit,
  subtitle,
  icon,
  bgClass,
  textClass,
  borderClass,
  progressPercent,
  progressBarColor,
  onClick,
  actionButton,
}: MetricTileProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-3.5 sm:p-4 border ${borderClass} ${bgClass} flex flex-col justify-between shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-extrabold ${textClass}`}>{title}</span>
        <div className="text-sm">{icon}</div>
      </div>

      <div className="my-1">
        <div className={`text-xl sm:text-2xl font-black ${textClass} tracking-tight leading-none`}>
          {value} {unit && <span className="text-xs font-semibold opacity-80">{unit}</span>}
        </div>
        <div className="text-[11px] font-medium text-gray-500 mt-1 truncate">{subtitle}</div>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-full bg-white/70 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
        {actionButton && <div className="pt-0.5">{actionButton}</div>}
      </div>
    </div>
  );
}
