import React from 'react';
import { Food, ProfileId } from '../types';
import { LevelBadge } from './LevelBadge';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface FoodCardProps {
  food: Food;
  currentProfile: ProfileId;
  onClick: (foodId: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, currentProfile, onClick }) => {
  const profileRec = food.profiles ? food.profiles[currentProfile] : undefined;
  const score = food.attp?.score ?? null;

  return (
    <div
      onClick={() => onClick(food.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(food.id);
        }
      }}
      className="w-full min-h-[78px] bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Emoji Icon Container */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
          {food.emoji || '🍽️'}
        </div>

        {/* Text Info */}
        <div className="min-w-0">
          <h4 className="text-sm font-black text-gray-900 truncate tracking-tight group-hover:text-emerald-700 transition-colors">
            {food.name}
          </h4>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              {food.category || 'Món ăn'}
            </span>

            {/* ATTP score badge */}
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
              <ShieldCheck size={13} className="text-emerald-600" />
              ATTP: {score !== null ? `${score}/10` : 'Chưa có'}
            </span>
          </div>

          {/* Profile safety recommendation */}
          <div className="mt-1.5">
            {profileRec ? (
              <LevelBadge level={profileRec.level} size="sm" />
            ) : (
              <span className="text-[11px] text-gray-400 italic">Chưa có dữ liệu</span>
            )}
          </div>
        </div>
      </div>

      {/* Right chevron */}
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition shrink-0">
        <ChevronRight size={18} />
      </div>
    </div>
  );
};
