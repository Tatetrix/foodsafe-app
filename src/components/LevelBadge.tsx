import React from 'react';
import { Level } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface LevelBadgeProps {
  level: Level;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
}) => {
  const configs = {
    green: {
      text: 'An toàn',
      emoji: '🟢',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
      fillColor: 'bg-emerald-500',
      icon: CheckCircle2,
      description: 'Phù hợp với hồ sơ sức khỏe của bạn',
    },
    yellow: {
      text: 'Lưu ý',
      emoji: '🟡',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      textColor: 'text-amber-700',
      fillColor: 'bg-amber-500',
      icon: AlertTriangle,
      description: 'Nên ăn có kiểm soát hoặc theo lượng khuyến nghị',
    },
    red: {
      text: 'Nguy hiểm',
      emoji: '🔴',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      textColor: 'text-rose-700',
      fillColor: 'bg-rose-500',
      icon: AlertOctagon,
      description: 'Khuyến cáo không nên ăn với tình trạng hiện tại',
    },
  };

  const current = configs[level] || configs.yellow;
  const Icon = current.icon;

  if (size === 'xl') {
    return (
      <div
        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between shadow-xs transition-all duration-300 ${current.bg} ${current.border}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${current.fillColor}`}
          >
            <Icon size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className={`text-base font-black tracking-tight flex items-center gap-1.5 ${current.textColor}`}>
              <span>{current.emoji}</span>
              <span>Mức khuyến nghị: {current.text}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{current.description}</p>
          </div>
        </div>
      </div>
    );
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.border} ${current.textColor} ${sizeStyles[size]}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0 stroke-[2.2]" />
      {showLabel && <span>{current.text}</span>}
    </span>
  );
};
