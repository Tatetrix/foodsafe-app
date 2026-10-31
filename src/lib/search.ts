import { Food } from '../types';

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt:
 * 1. Chuyển chữ thường
 * 2. Phân tách tổ hợp Unicode (NFD)
 * 3. Loại bỏ toàn bộ dấu thanh/dấu mũ (dải \u0300-\u036f)
 * 4. Thay thế đ/Đ thành d
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

/**
 * Tìm kiếm món ăn theo chuỗi truy vấn (hỗ trợ tiếng Việt không dấu).
 * So khớp với tên món và các biệt danh (aliases).
 */
export function searchFoods(query: string, foods: Food[]): Food[] {
  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery) return foods;

  return foods.filter((food) => {
    const nameMatch = normalizeVietnamese(food.name).includes(normalizedQuery);
    if (nameMatch) return true;

    const aliasMatch = (food.aliases || []).some((alias) =>
      normalizeVietnamese(alias).includes(normalizedQuery)
    );
    return aliasMatch;
  });
}

