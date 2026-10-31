import React from 'react';
import { Screen, ProfileId } from '../types';
import { getProfiles } from '../lib/data';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface ProfileSelectProps {
  currentProfile?: ProfileId;
  onSelectProfile: (profileId: ProfileId) => void;
  onNavigate: (screen: Screen) => void;
}

export const ProfileSelectScreen: React.FC<ProfileSelectProps> = ({
  currentProfile,
  onSelectProfile,
  onNavigate,
}) => {
  const profiles = getProfiles();

  const handleChoose = (id: ProfileId) => {
    onSelectProfile(id);
    onNavigate('home');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="pt-8 pb-4 px-6 text-center">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-3xl mb-3 shadow-xs">
          <ShieldCheck size={36} className="stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          An Toàn Thực Phẩm
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
          Chọn hồ sơ sức khỏe để cá nhân hóa mức cảnh báo và gợi ý món ăn an toàn
        </p>
      </div>

      {/* 4 Large Profile Cards */}
      <div className="flex-1 px-5 py-2 space-y-3">
        {profiles.map((p) => {
          const isSelected = p.id === currentProfile;
          return (
            <button
              key={p.id}
              onClick={() => handleChoose(p.id)}
              className={`w-full min-h-[82px] p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                isSelected
                  ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                  : 'border-white bg-white hover:border-emerald-300 hover:shadow-sm shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {p.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    {p.label}
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                        Hiện tại
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition shrink-0 ml-2">
                <ChevronRight size={18} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="p-5 text-center">
        <p className="text-[11px] text-gray-400 leading-tight">
          💡 Bạn có thể chạm vào chip hồ sơ ở đầu trang để đổi nhanh bất kỳ lúc nào.
        </p>
      </div>
    </div>
  );
};
