import React, { useState } from 'react';
import { Screen, ProfileId } from './types';
import { getStoredProfile, saveStoredProfile, hasStoredProfile } from './lib/profile';
import { ProfileSelectScreen } from './screens/ProfileSelect';
import { HomeScreen } from './screens/Home';
import { ScanScreen } from './screens/Scan';
import { ConfirmScreen } from './screens/Confirm';
import { ResultScreen } from './screens/Result';

export const App: React.FC = () => {
  // Nếu trong localStorage đã có hồ sơ từ trước thì vào thẳng Màn 2 (Home), ngược lại vào Màn 1
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    hasStoredProfile() ? 'home' : 'profile-select'
  );
  const [profile, setProfile] = useState<ProfileId>(() => getStoredProfile());
  const [selectedFoodId, setSelectedFoodId] = useState<string>('lau-hai-san');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleSelectProfile = (newProfile: ProfileId) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  const handleSelectFood = (foodId: string) => {
    setSelectedFoodId(foodId);
    setCurrentScreen('result');
  };

  const screens: { id: Screen; label: string; number: number }[] = [
    { id: 'profile-select', label: 'Hồ sơ', number: 1 },
    { id: 'home', label: 'Trang chủ', number: 2 },
    { id: 'scan', label: 'Quét món', number: 3 },
    { id: 'confirm', label: 'Xác nhận', number: 4 },
    { id: 'result', label: 'Kết quả', number: 5 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 font-sans select-none">
      {/* Thanh điều hướng nhanh cho 5 màn hình (dùng để test & demo) */}
      <div className="mb-2 sm:mb-3 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg max-w-full overflow-x-auto z-40">
        <span className="text-xs font-bold text-slate-400 px-2.5 hidden sm:inline">Chuyển màn:</span>
        {screens.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentScreen(s.id)}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
              currentScreen === s.id
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            M{s.number}: {s.label}
          </button>
        ))}
      </div>

      {/* Khung mô phỏng điện thoại di động: 390x844 trên desktop, responsive tràn màn hình trên mobile */}
      <div className="w-full sm:w-[390px] h-[100dvh] sm:h-[844px] bg-white sm:rounded-[44px] sm:shadow-2xl sm:border-[10px] sm:border-slate-800 flex flex-col overflow-hidden relative">
        {/* Dynamic Island / Notch giả lập (chỉ hiện trên desktop để mô phỏng) */}
        <div className="h-7 bg-transparent w-full hidden sm:flex items-center justify-between px-7 pt-1 z-30 pointer-events-none select-none">
          <span className="text-[11px] font-bold text-gray-700">9:41</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1 text-gray-700 text-[10px] font-semibold">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Vùng nội dung màn hình chính */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {currentScreen === 'profile-select' && (
            <ProfileSelectScreen
              currentProfile={profile}
              onSelectProfile={handleSelectProfile}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              currentProfile={profile}
              onNavigate={setCurrentScreen}
              onSelectFood={handleSelectFood}
              onUpdateProfile={handleSelectProfile}
            />
          )}

          {currentScreen === 'scan' && (
            <ScanScreen
              onNavigate={setCurrentScreen}
              onCaptureComplete={setCapturedImage}
            />
          )}

          {currentScreen === 'confirm' && (
            <ConfirmScreen
              currentProfile={profile}
              capturedImage={capturedImage}
              onNavigate={setCurrentScreen}
              onSelectFood={handleSelectFood}
            />
          )}

          {currentScreen === 'result' && (
            <ResultScreen
              currentProfile={profile}
              selectedFoodId={selectedFoodId}
              onNavigate={setCurrentScreen}
              onUpdateProfile={handleSelectProfile}
              onSelectFood={setSelectedFoodId}
            />
          )}
        </div>

        {/* Thanh Home indicator phía dưới */}
        <div className="h-5 bg-white flex items-center justify-center pb-1">
          <div className="w-32 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default App;
