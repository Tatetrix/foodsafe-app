import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Screen, ProfileId, RiskLevel } from '../types';
import { getFoodById, getSourceById, getFoodAlternatives } from '../lib/data';
import { getProfileDetails } from '../lib/profile';
import { AttpGauge } from '../components/AttpGauge';
import { LevelBadge } from '../components/LevelBadge';
import { ProfileSheet } from '../components/ProfileSheet';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Info,
  BookOpen,
  Search,
  Sparkles,
} from 'lucide-react';

interface ResultProps {
  currentProfile: ProfileId;
  selectedFoodId?: string;
  onNavigate: (screen: Screen) => void;
  onUpdateProfile: (profileId: ProfileId) => void;
  onSelectFood?: (foodId: string) => void;
}

export const ResultScreen: React.FC<ResultProps> = ({
  currentProfile,
  selectedFoodId = 'lau-hai-san',
  onNavigate,
  onUpdateProfile,
  onSelectFood,
}) => {
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cuộn lên đầu trang khi đổi món ăn
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setUserFeedback(null);
  }, [selectedFoodId]);

  // Lấy dữ liệu món ăn và hồ sơ
  const food = useMemo(() => getFoodById(selectedFoodId), [selectedFoodId]);
  const profileDetails = useMemo(() => getProfileDetails(currentProfile), [currentProfile]);

  // Khuyến nghị theo hồ sơ hiện tại (Lớp 2)
  const profileRec = useMemo(() => {
    if (!food || !food.profiles) return null;
    return food.profiles[currentProfile] || null;
  }, [food, currentProfile]);

  // Danh sách các tổ chức nguồn tham khảo
  const sourcesList = useMemo(() => {
    if (!food || !food.sources) return [];
    return food.sources
      .map((sourceId) => getSourceById(sourceId))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [food]);

  // Lọc danh sách món thay thế: Chỉ giữ món có level = 'green' đối với hồ sơ hiện tại
  const alternativeFoods = useMemo(() => {
    return getFoodAlternatives(food, currentProfile);
  }, [food, currentProfile]);

  // Helper hiển thị badge mức độ rủi ro (Lớp 1)
  const renderRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 size={11} className="stroke-[2.5]" />
            Thấp
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <AlertTriangle size={11} className="stroke-[2.5]" />
            Trung bình
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
            <AlertOctagon size={11} className="stroke-[2.5]" />
            Cao
          </span>
        );
    }
  };

  const handleSelectAlternative = (altFoodId: string) => {
    if (onSelectFood) {
      onSelectFood(altFoodId);
    }
  };

  // 1. Trường hợp thiếu dữ liệu món ăn: Empty State (Tuyệt đối không crash)
  if (!food) {
    return (
      <div className="flex flex-col h-full bg-slate-50 justify-between p-6">
        <div className="pt-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <ArrowLeft size={16} />
            <span>Quay lại Trang Chủ</span>
          </button>
        </div>

        <div className="text-center py-12 px-4 space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto text-gray-400">
            <Search size={28} />
          </div>
          <h2 className="text-lg font-black text-gray-800">Chưa có dữ liệu</h2>
          <p className="text-xs text-gray-500 max-w-[240px] mx-auto leading-relaxed">
            Món ăn bạn đang tìm kiếm hiện chưa có dữ liệu phân tích an toàn thực phẩm.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full min-h-[48px] bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition"
        >
          Tìm món ăn khác
        </button>
      </div>
    );
  }

  const currentLevel = profileRec?.level;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* 1. Header cố định */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-2 border-b border-gray-100 flex items-center justify-between shadow-2xs">
        <button
          onClick={() => onNavigate('home')}
          className="min-h-[44px] flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-950 px-3 rounded-xl hover:bg-gray-100 transition active:scale-95"
          aria-label="Quay lại Trang Chủ"
        >
          <ArrowLeft size={18} />
          <span>Trang chủ</span>
        </button>

        {/* Chip đổi nhanh hồ sơ ngay trên header */}
        <button
          onClick={() => setIsProfileSheetOpen(true)}
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition active:scale-95 shadow-2xs"
          aria-label="Đổi hồ sơ sức khỏe"
        >
          <span className="text-base">{profileDetails.emoji}</span>
          <span className="max-w-[100px] truncate">{profileDetails.label}</span>
          <ChevronDown size={14} className="text-emerald-600 shrink-0" />
        </button>
      </header>

      {/* Nội dung cuộn chi tiết */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4"
      >
        {/* Thẻ Header món ăn */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-4xl shrink-0 shadow-2xs">
            {food.emoji || '🍽️'}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-gray-900 truncate leading-snug">
              {food.name}
            </h1>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                {food.category || 'Món ăn'}
              </span>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  food.type === 'risky_food'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                {food.type === 'risky_food' ? '⚠️ Thực phẩm rủi ro' : '🍲 Món ăn'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. LỚP 1: CẢNH BÁO AN TOÀN THỰC PHẨM (ÁP DỤNG CHUNG) */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Lớp 1: Đánh giá an toàn thực phẩm
            </h2>
          </div>

          {/* Gauge thang đo điểm ATTP */}
          <AttpGauge score={food.attp?.score ?? 0} />

          {/* Danh sách các rủi ro chế biến */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Các rủi ro chế biến & bảo quản cần lưu ý:</span>
            </h3>

            {food.attp?.risks && food.attp.risks.length > 0 ? (
              <div className="space-y-2">
                {food.attp.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex items-start justify-between gap-2.5"
                  >
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {risk.label}
                    </p>
                    {renderRiskBadge(risk.level)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Không ghi nhận rủi ro đáng kể.</p>
            )}
          </div>
        </section>

        {/* 3. LỚP 2: KHUYẾN NGHỊ THEO HỒ SƠ SỨC KHỎE (CÓ TRANSITION MƯỢT KHI ĐỔI HỒ SƠ) */}
        <section
          key={currentProfile}
          className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300 transition-all"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Lớp 2: Khuyến nghị theo hồ sơ
              </h2>
            </div>

            <button
              onClick={() => setIsProfileSheetOpen(true)}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              <span>Đổi hồ sơ</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {profileRec ? (
            <div className="space-y-2.5">
              {/* Badge lớn nổi bật: Icon + Chữ + Màu sắc */}
              <LevelBadge level={profileRec.level} size="xl" />

              {/* Thẻ Lý do y khoa & Lời khuyên */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
                {/* Hồ sơ áp dụng */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                  <span className="text-lg">{profileDetails.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-none">
                      Dành cho người: {profileDetails.label}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {profileDetails.description}
                    </span>
                  </div>
                </div>

                {/* Lý do y khoa */}
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                    <span>🩺</span>
                    <span>Lý do y khoa:</span>
                  </h5>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                    {profileRec.reason || 'Chưa có thông tin lý do cụ thể.'}
                  </p>
                </div>

                {/* Lời khuyên cụ thể */}
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Lời khuyên ăn uống:</span>
                  </h5>
                  <p className="text-xs text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 font-medium leading-relaxed">
                    {profileRec.advice || 'Chưa có lời khuyên chi tiết.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center text-xs text-gray-400 italic">
              Chưa có dữ liệu khuyến nghị cho hồ sơ này.
            </div>
          )}
        </section>

        {/* 4. KHỐI GỢI Ý MÓN ĂN THAY THẾ (PROMPT 4) */}
        {currentLevel === 'red' && alternativeFoods.length > 0 && (
          <section className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 rounded-3xl p-4 border-2 border-emerald-200/80 shadow-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-900 tracking-tight">
                  Món ăn thay thế an toàn hơn cho bạn
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Được lọc an toàn tuyệt đối (mức 🟢 An toàn) dành cho người{' '}
                  <span className="font-semibold text-emerald-700">{profileDetails.label}</span>:
                </p>
              </div>
            </div>

            {/* Danh sách các thẻ món thay thế */}
            <div className="space-y-2 pt-0.5">
              {alternativeFoods.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => handleSelectAlternative(alt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectAlternative(alt.id);
                    }
                  }}
                  className="w-full bg-white rounded-2xl p-3 border border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {alt.emoji || '🍽️'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                        {alt.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {alt.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <LevelBadge level="green" size="sm" />
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentLevel === 'yellow' && alternativeFoods.length > 0 && (
          <section className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">
                  Bạn cũng có thể thử các món thanh đạm hơn:
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Gợi ý món tối ưu mức an toàn cho người {profileDetails.label}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-0.5">
              {alternativeFoods.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => handleSelectAlternative(alt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectAlternative(alt.id);
                    }
                  }}
                  className="w-full bg-slate-50/70 rounded-2xl p-3 border border-gray-100 hover:border-emerald-300 hover:bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {alt.emoji || '🍽️'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">
                        {alt.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {alt.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <LevelBadge level="green" size="sm" />
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentLevel === 'green' && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-2.5 text-emerald-800">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 stroke-[2.2]" />
            <p className="text-xs font-medium">
              Lựa chọn hiện tại đã rất tốt cho hồ sơ <span className="font-bold">{profileDetails.label}</span>!
            </p>
          </div>
        )}

        {/* 5. PHẦN CHÂN TRANG */}
        <footer className="space-y-3 pt-2">
          {/* Accordion Nguồn tham khảo */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all">
            <button
              onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-800">
                  Nguồn tham khảo y khoa ({sourcesList.length})
                </span>
              </div>
              <div className="text-gray-400">
                {isSourcesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isSourcesExpanded && (
              <div className="px-4 pb-3.5 pt-1 border-t border-gray-50 space-y-2 animate-in fade-in duration-150">
                {sourcesList.length > 0 ? (
                  sourcesList.map((source) => (
                    <div
                      key={source.id}
                      className="p-2 rounded-lg bg-slate-50 text-[11px] text-gray-600 flex items-start gap-2 border border-gray-100"
                    >
                      <span className="font-bold text-emerald-600 shrink-0">
                        [{source.id}]
                      </span>
                      <span className="leading-relaxed">{source.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Chưa có nguồn trích dẫn cụ thể.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Disclaimer pháp lý */}
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-2.5">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-snug font-medium">
              Thông tin tham khảo, không thay thế tư vấn y khoa chuyên sâu của bác sĩ.
            </p>
          </div>

          {/* Bộ 2 nút đánh giá: 👍 / 👎 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Kết quả này có hữu ích không?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserFeedback('helpful')}
                className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  userFeedback === 'helpful'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Hữu ích"
              >
                <ThumbsUp size={16} />
                <span>Có</span>
              </button>

              <button
                onClick={() => setUserFeedback('unhelpful')}
                className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  userFeedback === 'unhelpful'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Chưa hữu ích"
              >
                <ThumbsDown size={16} />
                <span>Chưa</span>
              </button>
            </div>
          </div>
          {userFeedback && (
            <p className="text-center text-[11px] text-emerald-600 font-medium">
              Cảm ơn phản hồi của bạn! 🙏
            </p>
          )}
        </footer>
      </div>

      {/* Nút to ở đáy màn hình: "Quét / Tìm món khác" */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
        <button
          onClick={() => onNavigate('home')}
          className="w-full min-h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition"
        >
          <Search size={18} />
          <span>Quét / Tìm món khác</span>
        </button>
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
