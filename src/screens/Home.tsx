import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Screen, ProfileId, FoodType } from '../types';
import { getAllFoods } from '../lib/data';
import { getProfileDetails } from '../lib/profile';
import { searchFoods } from '../lib/search';
import { FoodCard } from '../components/FoodCard';
import { ProfileSheet } from '../components/ProfileSheet';
import { LevelBadge } from '../components/LevelBadge';
import { Search, X, Camera, ShieldCheck, ChevronDown, UtensilsCrossed, Sparkles } from 'lucide-react';

interface HomeProps {
  currentProfile: ProfileId;
  onNavigate: (screen: Screen) => void;
  onSelectFood: (foodId: string) => void;
  onUpdateProfile: (profileId: ProfileId) => void;
}

export const HomeScreen: React.FC<HomeProps> = ({
  currentProfile,
  onNavigate,
  onSelectFood,
  onUpdateProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FoodType>('dish');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const allFoods = useMemo(() => getAllFoods(), []);
  const profileDetails = useMemo(() => getProfileDetails(currentProfile), [currentProfile]);

  // Trích xuất danh mục duy nhất từ dữ liệu thực tế
  const categories = useMemo(() => {
    const set = new Set<string>();
    allFoods.forEach((food) => {
      if (food.category) set.add(food.category);
    });
    return ['all', ...Array.from(set)];
  }, [allFoods]);

  // Đóng gợi ý autocomplete khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách gợi ý autocomplete theo từ khóa
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFoods(searchQuery, allFoods).slice(0, 5);
  }, [searchQuery, allFoods]);

  // Danh sách món ăn hiển thị sau khi lọc qua: Tab Type + Category + Search Query
  const filteredFoods = useMemo(() => {
    let list = allFoods.filter((item) => item.type === selectedType);

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      list = searchFoods(searchQuery, list);
    }

    return list;
  }, [allFoods, selectedType, selectedCategory, searchQuery]);

  const handleSelectDish = (foodId: string) => {
    setIsAutocompleteOpen(false);
    onSelectFood(foodId);
    onNavigate('result');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* 1. Header cố định */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-2xs">
        {/* Logo App */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight leading-none">
              FoodSafe
            </h1>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              An toàn thực phẩm
            </span>
          </div>
        </div>

        {/* Chip hồ sơ sức khỏe: Tối thiểu 44px touch target */}
        <button
          onClick={() => setIsProfileSheetOpen(true)}
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition active:scale-95 shadow-2xs"
          aria-label="Đổi hồ sơ sức khỏe"
        >
          <span className="text-base">{profileDetails.emoji}</span>
          <span className="max-w-[110px] truncate">{profileDetails.label}</span>
          <ChevronDown size={14} className="text-emerald-600 shrink-0" />
        </button>
      </header>

      {/* Nội dung cuộn chính */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
        {/* 2. Thanh tìm kiếm với Autocomplete */}
        <div ref={searchContainerRef} className="relative z-20">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsAutocompleteOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsAutocompleteOpen(true);
              }}
              placeholder="Tìm món ăn, ví dụ: lẩu, gà, trà sữa..."
              className="w-full h-12 pl-10 pr-10 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsAutocompleteOpen(false);
                }}
                className="w-8 h-8 absolute right-2 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full"
                aria-label="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Dropdown Autocomplete gợi ý */}
          {isAutocompleteOpen && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden z-30 animate-in fade-in duration-150">
              <div className="px-3.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Gợi ý phù hợp</span>
                <span>{autocompleteSuggestions.length} món</span>
              </div>
              {autocompleteSuggestions.map((item) => {
                const rec = item.profiles ? item.profiles[currentProfile] : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectDish(item.id)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 text-left hover:bg-emerald-50/70 flex items-center justify-between border-b border-gray-50 last:border-b-0 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-gray-900 truncate">
                          {item.name}
                        </div>
                        <span className="text-[11px] text-gray-400">{item.category}</span>
                      </div>
                    </div>

                    {rec && (
                      <div className="shrink-0 ml-2">
                        <LevelBadge level={rec.level} size="sm" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Nút to nổi bật: "Quét món ăn" */}
        <button
          onClick={() => onNavigate('scan')}
          className="w-full min-h-[56px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-md shadow-emerald-600/20 active:scale-[0.99] transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Camera size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black tracking-wide">Quét món ăn bằng camera</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Nhận diện nhanh & kiểm tra an toàn thực phẩm
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl shrink-0">
            Quét &rarr;
          </span>
        </button>

        {/* 4. Hai tab chuyển đổi: "Món ăn" và "Thực phẩm rủi ro" (Đạt chiều cao >= 44px) */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setSelectedType('dish')}
            className={`flex-1 min-h-[44px] py-2 px-3 text-xs font-black rounded-xl transition-all ${
              selectedType === 'dish'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Món ăn thông thường
          </button>
          <button
            onClick={() => setSelectedType('risky_food')}
            className={`flex-1 min-h-[44px] py-2 px-3 text-xs font-black rounded-xl transition-all ${
              selectedType === 'risky_food'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚠️ Thực phẩm rủi ro
          </button>
        </div>

        {/* 5. Bộ lọc danh mục (Category Chips) (Chiều cao >= 40px) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isAll = cat === 'all';
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isAll ? 'Tất cả nhóm' : cat}
              </button>
            );
          })}
        </div>

        {/* 6. Danh sách món ăn */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-semibold">
            <span className="text-gray-800">
              {selectedType === 'dish' ? 'Danh sách món ăn' : 'Thực phẩm rủi ro cao'}
            </span>
            <span>{filteredFoods.length} món</span>
          </div>

          {filteredFoods.length > 0 ? (
            <div className="space-y-2.5">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  currentProfile={currentProfile}
                  onClick={handleSelectDish}
                />
              ))}
            </div>
          ) : (
            /* Empty State đẹp mắt & có nút giải quyết */
            <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-300 text-center space-y-3.5 my-4 shadow-2xs animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                <UtensilsCrossed size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-gray-800">
                  Không tìm thấy món ăn nào phù hợp
                </h4>
                <p className="text-xs text-gray-500 max-w-[240px] mx-auto leading-relaxed">
                  Thử tìm kiếm với các từ khóa phổ biến như <span className="font-semibold text-gray-700">"lẩu"</span>, <span className="font-semibold text-gray-700">"gà"</span>, <span className="font-semibold text-gray-700">"trà"</span>, <span className="font-semibold text-gray-700">"cá"</span> hoặc chuyển sang danh mục khác.
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Xóa tìm kiếm & xem tất cả món</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet đổi nhanh hồ sơ */}
      <ProfileSheet
        isOpen={isProfileSheetOpen}
        currentProfile={currentProfile}
        onClose={() => setIsProfileSheetOpen(false)}
        onSelectProfile={onUpdateProfile}
      />
    </div>
  );
};
