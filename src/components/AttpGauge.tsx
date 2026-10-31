import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface AttpGaugeProps {
  score: number; // 0 - 10
}

export const AttpGauge: React.FC<AttpGaugeProps> = ({ score }) => {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;

  // Xác định trạng thái và màu sắc theo mức điểm
  let status = {
    label: 'Mức an toàn cao',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    icon: ShieldCheck,
  };

  if (clampedScore < 5) {
    status = {
      label: 'Mức an toàn thấp',
      textClass: 'text-rose-700',
      bgClass: 'bg-rose-500',
      badgeBg: 'bg-rose-50 border-rose-200',
      icon: AlertOctagon,
    };
  } else if (clampedScore < 8) {
    status = {
      label: 'Mức an toàn trung bình',
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-500',
      badgeBg: 'bg-amber-50 border-amber-200',
      icon: AlertTriangle,
    };
  }

  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
      {/* Header dòng điểm số */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Điểm an toàn thực phẩm
          </span>
          <span className="text-[10px] text-gray-400 font-medium">(Thang 0 - 10)</span>
        </div>

        {/* Badge đánh giá có Icon + Chữ */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${status.badgeBg} ${status.textClass}`}
        >
          <StatusIcon size={13} className="stroke-[2.5]" />
          <span>{status.label}</span>
        </span>
      </div>

      {/* Hiển thị số điểm to bản & thanh đo trực quan */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${status.textClass}`}>
              {clampedScore}
            </span>
            <span className="text-sm font-semibold text-gray-400">/ 10</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Điểm càng cao càng an toàn
          </span>
        </div>

        {/* Thanh progress bar đa sắc độ */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 flex items-center">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${status.bgClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Các mốc chia thang đo */}
        <div className="flex justify-between text-[10px] text-gray-400 px-0.5 pt-0.5 font-medium">
          <span>0 (Rủi ro cao)</span>
          <span>5</span>
          <span>10 (Rất an toàn)</span>
        </div>
      </div>
    </div>
  );
};

