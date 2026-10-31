import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import {
  X,
  Camera,
  Image as ImageIcon,
  Search,
  AlertCircle,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ScanProps {
  onNavigate: (screen: Screen) => void;
  onCaptureComplete?: (imageDataUrl: string | null) => void;
}

export const ScanScreen: React.FC<ScanProps> = ({ onNavigate, onCaptureComplete }) => {
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dọn dẹp stream camera khi dừng hoặc unmount
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Khởi tạo camera
  const startCamera = async () => {
    stopCamera();
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setErrorMessage('Trình duyệt không hỗ trợ truy cập camera HTML5.');
      return;
    }

    setCameraStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
      setCameraStatus('active');
    } catch (err: unknown) {
      console.warn('Lỗi mở camera:', err);
      setCameraStatus('denied');
      setErrorMessage(
        'Không thể mở camera. Vui lòng cấp quyền truy cập camera trong cài đặt trình duyệt.'
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Xử lý chụp ảnh & giả lập AI phân tích 1.5s
  const handleCapture = () => {
    let dataUrl: string | null = null;

    if (videoRef.current && cameraStatus === 'active') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch {
        // Bỏ qua nếu vẽ canvas gặp lỗi cross-origin
      }
    }

    setCapturedImage(dataUrl);
    stopCamera();
    setIsAnalyzing(true);

    // Giả lập thời gian AI phân tích trong 1.5 giây theo spec
    setTimeout(() => {
      setIsAnalyzing(false);
      onCaptureComplete?.(dataUrl);
      onNavigate('confirm');
    }, 1500);
  };

  // Xử lý chọn ảnh từ thư viện
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        stopCamera();
        setIsAnalyzing(true);

        setTimeout(() => {
          setIsAnalyzing(false);
          onCaptureComplete?.(result);
          onNavigate('confirm');
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white relative overflow-hidden select-none">
      {/* 1. Header điều khiển */}
      <div className="absolute top-0 inset-x-0 z-30 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={() => {
            stopCamera();
            onNavigate('home');
          }}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition active:scale-95"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          Quét Món Ăn
        </span>

        <button
          onClick={() => {
            stopCamera();
            onNavigate('home');
          }}
          className="text-xs font-semibold text-emerald-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 hover:bg-emerald-500/20 transition"
        >
          Nhập tên
        </button>
      </div>

      {/* 2. Vùng hiển thị Camera hoặc Ảnh chụp */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-neutral-950">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Món ăn vừa chụp"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Khung ngắm Viewfinder với hiệu ứng tia laser quét */}
        {cameraStatus === 'active' && !isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {/* Viewfinder box */}
            <div className="w-68 h-68 relative rounded-3xl overflow-hidden border border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {/* 4 góc viền nhấn khung ngắm */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

              {/* Tia laser quét lên xuống */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-laser" />
            </div>

            {/* Dòng hướng dẫn người dùng */}
            <div className="mt-5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-emerald-300 flex items-center gap-1.5 shadow-lg">
              <Camera size={14} />
              <span>Đưa món ăn vào khung ngắm</span>
            </div>
          </div>
        )}

        {/* Trạng thái fallback khi camera bị từ chối hoặc không có camera */}
        {(cameraStatus === 'denied' || cameraStatus === 'unsupported') && !isAnalyzing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Chưa thể truy cập camera</h3>
              <p className="text-xs text-gray-400 max-w-[250px] mx-auto leading-relaxed">
                {errorMessage ||
                  'Bạn có thể tải ảnh món ăn từ máy hoặc gõ tên món để kiểm tra an toàn thực phẩm.'}
              </p>
            </div>

            <div className="space-y-2.5 w-full max-w-[260px] pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <ImageIcon size={16} />
                <span>Chọn ảnh từ thư viện</span>
              </button>

              <button
                onClick={startCamera}
                className="w-full min-h-[42px] bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <RefreshCw size={14} />
                <span>Thử lại kết nối camera</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="w-full min-h-[42px] text-gray-400 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Search size={14} />
                <span>Tìm kiếm bằng tên món</span>
              </button>
            </div>
          </div>
        )}

        {/* Trạng thái giả lập AI đang phân tích món ăn (~1.5s) */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
                <Sparkles size={36} />
              </div>
              <div className="absolute -inset-1 rounded-3xl border border-emerald-400/40 animate-ping" />
            </div>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-emerald-400" />
              <span>Đang phân tích món ăn...</span>
            </h3>

            <p className="text-xs text-gray-400 mt-1.5 text-center max-w-[240px]">
              AI đang nhận diện nguyên liệu và đối soát dữ liệu an toàn thực phẩm
            </p>
          </div>
        )}
      </div>

      {/* Input ẩn để chọn file ảnh từ thư viện máy */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 3. Bảng điều khiển đáy (Nút chụp ảnh & các nút phụ) */}
      <div className="relative z-20 px-6 pt-3 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
        {/* Nút thư viện ảnh */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white p-2 rounded-xl transition"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <ImageIcon size={20} />
          </div>
          <span className="text-[10px] font-medium">Thư viện</span>
        </button>

        {/* Nút chụp ảnh chính (To nổi bật) */}
        <button
          onClick={handleCapture}
          disabled={isAnalyzing}
          className="w-18 h-18 rounded-full border-4 border-white/80 p-1 flex items-center justify-center transition active:scale-95 disabled:opacity-50 hover:border-emerald-400 shadow-lg group"
          aria-label="Chụp ảnh"
        >
          <div className="w-full h-full rounded-full bg-white group-hover:bg-emerald-400 transition-colors" />
        </button>

        {/* Nút tìm kiếm bằng tên */}
        <button
          onClick={() => {
            stopCamera();
            onNavigate('home');
          }}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white p-2 rounded-xl transition"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Search size={20} />
          </div>
          <span className="text-[10px] font-medium">Tìm tên</span>
        </button>
      </div>
    </div>
  );
};
