# PROJECT_SPEC: App An Toàn Thực Phẩm (Prototype)

> Agent: ĐỌC FILE NÀY TRƯỚC KHI LÀM BẤT CỨ VIỆC GÌ. Chỉ làm đúng phạm vi của prompt hiện tại.

## 1. Mục tiêu

Prototype mobile web để **test nhanh ý tưởng** "App An Toàn Thực Phẩm + Khuyến nghị sức khỏe theo món ăn", demo cho team chính. Chỉ cần mượt, đẹp, đúng luồng. Không phải sản phẩm thật.

## 2. LUẬT BẮT BUỘC (không được vi phạm)

1. **KHÔNG** backend, database, đăng nhập, API ngoài, AI/ML thật.
2. **KHÔNG** thêm thư viện ngoài danh sách ở mục 3 nếu chưa hỏi.
3. **KHÔNG** đổi schema trong `src/data/foods.json`. Không tự bịa/sửa nội dung y khoa trong data.
4. Mọi dữ liệu đọc từ `src/data/foods.json`. Không hard-code món ăn trong component.
5. Mọi text hiển thị bằng **tiếng Việt**, giọng thân thiện, không dọa người dùng.
6. Làm đúng phạm vi prompt hiện tại, không làm trước các màn chưa được yêu cầu.
7. Sau mỗi bước phải chạy được `npm run dev` và không lỗi TypeScript.
8. Món thiếu data thì hiện "Chưa có dữ liệu", **không crash**.
9. Không dùng chỉ màu để thể hiện mức Xanh/Vàng/Đỏ: luôn kèm **icon + chữ**.

## 3. Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- `lucide-react` (icon)
- `react-router-dom` hoặc state đơn giản để chuyển màn (chọn cái nhẹ hơn)
- Tìm kiếm: hàm normalize tiếng Việt (NFD, bỏ dấu, lowercase, đ → d). Có thể dùng `fuse.js` nếu cần fuzzy
- Lưu hồ sơ: `localStorage` (bọc try/catch)
- Camera: `navigator.mediaDevices.getUserMedia`
- Deploy: Vercel (HTTPS bắt buộc để camera chạy)

## 4. Hồ sơ sức khỏe (id cố định)

| id | Nhãn | Mô tả |
|---|---|---|
| `normal` | Bình thường | Người khỏe mạnh |
| `diabetes` | Tiểu đường Type 2 | Cần kiểm soát đường huyết |
| `gout` | Gút | Axit uric cao, hạn chế purin |
| `pregnancy` | Mang thai | Ưu tiên an toàn thực phẩm |

Chỉ chọn **1 hồ sơ** tại một thời điểm. Hồ sơ lưu localStorage key `foodsafe.profile`.

## 5. Schema dữ liệu (`src/data/foods.json`)

File gồm: `meta`, `profiles[]`, `sources[]`, `foods[]`. Mỗi food:

```ts
type Level = "green" | "yellow" | "red";
type ProfileId = "normal" | "diabetes" | "gout" | "pregnancy";

interface Food {
  id: string;
  name: string;
  aliases: string[];
  type: "dish" | "risky_food";
  category: string;
  emoji: string;
  attp: {
    score: number; // 0-10, càng cao càng an toàn
    risks: { label: string; level: "low" | "medium" | "high" }[];
  };
  profiles: Record<ProfileId, { level: Level; reason: string; advice: string }>;
  alternatives: Partial<Record<ProfileId, string[]>>; // mảng food id
  sources: string[]; // id trong sources[]
}
```

## 6. Màn hình và luồng

```
Mở app
  → Màn 1: Chọn hồ sơ (lần đầu)
  → Màn 2: Home (tìm kiếm + nút quét + danh sách món)
       ├─ Gõ tìm kiếm → chọn món → Màn 5
       └─ Bấm Quét → Màn 3 Camera → Màn 4 Xác nhận món → Màn 5
  → Màn 5: Kết quả (Lớp 1 + Lớp 2 + Gợi ý thay thế)
       └─ Bấm món thay thế → Màn 5 với món mới
(Mọi màn: chip hồ sơ trên header, bấm mở bottom sheet đổi nhanh)
```

**Màn 1 Chọn hồ sơ:** 4 thẻ lớn có emoji + mô tả. Chọn xong vào Home.

**Màn 2 Home:** header (logo + chip hồ sơ), thanh tìm kiếm có autocomplete, nút lớn "Quét món ăn", chip lọc theo `category`, danh sách món, 2 tab "Món ăn" / "Thực phẩm rủi ro" (theo `type`).

**Màn 3 Quét (giả lập):** camera thật làm nền, khung ngắm giữa, nút chụp → "Đang phân tích..." ~1.5s. Nút phụ "Chọn ảnh từ thư viện", "Nhập tên món". Từ chối quyền camera → fallback sang tìm kiếm, không để màn trắng.

**Màn 4 Xác nhận:** "Có phải món này không?" với 3 món gợi ý (mock), bấm chọn 1. Phải ghi rõ trong UI hoặc báo cáo đây là nhận diện giả lập.

**Màn 5 Kết quả (quan trọng nhất), từ trên xuống:**
1. Header món: emoji, tên, nhóm, hồ sơ đang áp dụng
2. **Lớp 1 An toàn thực phẩm:** điểm `attp.score` (gauge/thanh), danh sách `risks` kèm mức
3. **Lớp 2 Khuyến nghị theo hồ sơ:** badge lớn 🟢 An toàn / 🟡 Lưu ý / 🔴 Nguy hiểm (icon + chữ), `reason`, `advice`
4. **Gợi ý thay thế:** hiện khi Đỏ (nhẹ hơn khi Vàng). Lấy `alternatives[profile]`, **chỉ giữ món có level = green với hồ sơ hiện tại**. 2-3 thẻ, bấm để xem món đó
5. Nguồn tham khảo (thu gọn) + disclaimer "Thông tin tham khảo, không thay thế tư vấn của bác sĩ"
6. Nút 👍/👎 "Kết quả này có hữu ích không?" (chỉ lưu local) + nút "Quét/tìm món khác"

**Bottom sheet đổi hồ sơ:** đổi khi đang ở Màn 5 thì kết quả **cập nhật tức thì**, có transition mượt (đây là điểm demo chính).

## 7. Giao diện

- Khung mobile 390x844; trên desktop căn giữa trong khung điện thoại
- Màu đèn giao thông: xanh `#22C55E`, vàng `#F59E0B`, đỏ `#EF4444`. Nền sáng, font to, dễ đọc
- Nút tối thiểu 44px, nút chính ở nửa dưới màn hình (thao tác một tay)
- Có loading/skeleton, empty state, transition nhẹ giữa màn
- Tôn trọng safe-area iOS

## 8. Kịch bản demo (phải chạy đúng)

1. Gút + Lẩu hải sản → 🔴 → gợi ý Cơm gà luộc, Canh rau thịt băm nạc
2. Tiểu đường + Trà sữa → 🔴 → gợi ý Trà xanh không đường
3. Mang thai + Xiên chiên vỉa hè → 🔴 → gợi ý món nấu chín
4. Xiên chiên vỉa hè: điểm ATTP thấp ở Lớp 1, đổi hồ sơ thấy màu thay đổi
5. Đổi hồ sơ ngay trên Màn 5 để show cá nhân hóa

## 9. Cấu trúc thư mục gợi ý

```
src/
  data/foods.json
  types/index.ts
  lib/ (search.ts, data.ts, profile.ts)
  components/ (LevelBadge, AttpGauge, FoodCard, ProfileSheet, ...)
  screens/ (ProfileSelect, Home, Scan, Confirm, Result)
  App.tsx
```

## 10. Ngoài phạm vi (không làm)

Đăng nhập, backend, AI nhận diện ảnh thật, lịch sử ăn uống, tính calo chi tiết, đa ngôn ngữ, chọn nhiều bệnh cùng lúc (ghi vào báo cáo là hướng phát triển).
