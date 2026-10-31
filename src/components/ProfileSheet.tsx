import React from 'react';
import { ProfileId } from '../types';
import { getProfiles } from '../lib/data';
import { X, Check } from 'lucide-react';

interface ProfileSheetProps {
  isOpen: boolean;
  currentProfile: ProfileId;
  onClose: () => void;
  onSelectProfile: (profileId: ProfileId) => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  currentProfile,
  onClose,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  const profiles = getProfiles();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl shadow-2xl p-5 pb-8 z-10 animate-in slide-in-from-bottom duration-200">
        {/* Grab bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-900">Đổi hồ sơ sức khỏe</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kết quả đánh giá món sẽ cập nhật tức thì
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 -mr-2 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition active:scale-95"
            aria-label="Đóng bảng đổi hồ sơ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile list */}
        <div className="space-y-2.5 mt-4">
          {profiles.map((p) => {
            const isSelected = p.id === currentProfile;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProfile(p.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between border-2 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                    : 'border-gray-100 bg-gray-50/70 hover:border-gray-200 hover:bg-gray-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 bg-white rounded-xl shadow-xs shrink-0">
                    {p.emoji}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      {p.label}
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                          Đang chọn
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={14} className="stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

