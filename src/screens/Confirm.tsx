import React from 'react';
import { Screen, ProfileId } from '../types';
import { getAllFoods } from '../lib/data';
import { LevelBadge } from '../components/LevelBadge';
import {
  Sparkles,
  ChevronRight,
  Search,
  Camera,
  Bot,
} from 'lucide-react';

interface ConfirmProps {
  currentProfile: ProfileId;
  capturedImage?: string | null;
  onNavigate: (screen: Screen) => void;
  onSelectFood: (foodId: string) => void;
}

export const ConfirmScreen: React.FC<ConfirmProps> = ({
  currentProfile,
  capturedImage,
  onNavigate,
  onSelectFood,
}) => {
  const allFoods = getAllFoods();

  // Chọn 3 món ăn tiêu biểu từ foods.json làm gợi ý nhận diện AI
  const suggestedDishIds = ['lau-hai-san', 'goi-cuon-tom', 'com-ga-luoc'];
  const suggestedFoods = suggestedDishIds
    .map((id) => allFoods.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const handleChoose = (foodId: string) => {
    onSelectFood(foodId);
    onNavigate('result');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white relative overflow-hidden select-none">
      {/* 1. Phần nền: Ảnh chụp từ camera hoặc nền gradient mô phỏng */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Món ăn đã quét"
            className="w-full h-full object-cover scale-105 filter blur-xs brightness-75"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-center">
            <span className="text-8xl opacity-20">🍲</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
      </div>

      {/* 2. Top bar với Badge "Mô phỏng nhận diện AI" minh bạch theo spec */}
      <div className="relative z-10 px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => onNavigate('scan')}
          className="flex items-center gap-1 text-xs font-semibold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition active:scale-95"
        >
          <Camera size={14} />
          <span>Quét lại</span>
        </button>

        {/* Badge minh bạch quy định tại mục 6 trong Spec */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 backdrop-blur-md text-purple-300 text-[11px] font-bold shadow-xs">
          <Bot size={13} className="text-purple-300" />
          <span>Mô phỏng nhận diện AI</span>
        </div>
      </div>

      {/* 3. Vùng xem nhanh ảnh chụp */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        {capturedImage ? (
          <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl relative group">
            <img
              src={capturedImage}
              alt="Món ăn vừa chụp"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2">
              <span className="text-[10px] text-white/90 font-medium">Ảnh chụp</span>
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-3 shadow-xl">
            <span className="text-4xl mb-1">📸</span>
            <span className="text-[10px] text-white/70">Ảnh đã quét</span>
          </div>
        )}
      </div>

      {/* 4. Bottom Sheet xác nhận món (Modal trượt lên) */}
      <div className="relative z-20 bg-white text-gray-900 rounded-t-3xl shadow-2xl p-5 pb-7 animate-in slide-in-from-bottom duration-300 space-y-4">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />

        {/* Tiêu đề & Subtitle */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <Sparkles size={13} />
            <span>Kết quả nhận diện</span>
          </div>
          <h2 className="text-base font-black text-gray-900 tracking-tight">
            Có phải món bạn đang quét không?
          </h2>
          <p className="text-[11px] text-gray-500">
            Chạm vào món ăn chính xác để xem ngay phân tích an toàn
          </p>
        </div>

        {/* Danh sách 3 món gợi ý nhận diện */}
        <div className="space-y-2">
          {suggestedFoods.map((food, index) => {
            const rec = food.profiles ? food.profiles[currentProfile] : null;
            return (
              <button
                key={food.id}
                onClick={() => handleChoose(food.id)}
                className={`w-full p-3 rounded-2xl text-left border-2 transition-all flex items-center justify-between active:scale-[0.98] group ${
                  index === 0
                    ? 'border-emerald-500/80 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                    : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    {food.emoji || '🍽️'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-gray-800 truncate">
                        {food.name}
                      </h3>
                      {index === 0 && (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md shrink-0">
                          Gợi ý nhất
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {food.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rec && <LevelBadge level={rec.level} size="sm" />}
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-600 transition" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Nút hành động phụ */}
        <div className="pt-1">
          <button
            onClick={() => onNavigate('home')}
            className="w-full min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Search size={14} />
            <span>Không phải các món trên, tìm món khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};
