import rawFoodsData from '../data/foods.json';
import { FoodDatabase, Food, Profile, Source, ProfileId } from '../types';

export const foodsData = rawFoodsData as unknown as FoodDatabase;

export function getFoodDatabase(): FoodDatabase {
  return foodsData;
}

export function getAllFoods(): Food[] {
  return foodsData.foods || [];
}

export function getFoodById(id: string): Food | undefined {
  return (foodsData.foods || []).find((food) => food.id === id);
}

export function getProfiles(): Profile[] {
  return foodsData.profiles || [];
}

export function getSources(): Source[] {
  return foodsData.sources || [];
}

export function getSourceById(id: string): Source | undefined {
  return (foodsData.sources || []).find((source) => source.id === id);
}

/**
 * Lấy danh sách món thay thế phù hợp với hồ sơ hiện tại.
 * Theo spec: chỉ giữ món có level = green với hồ sơ hiện tại.
 */
export function getFoodAlternatives(food: Food | undefined | null, profileId: ProfileId): Food[] {
  if (!food || !food.alternatives) return [];
  const altIds = food.alternatives[profileId] || [];
  return altIds
    .map((altId) => getFoodById(altId))
    .filter((alt): alt is Food => {
      if (!alt || !alt.profiles) return false;
      const rec = alt.profiles[profileId];
      return rec ? rec.level === 'green' : false;
    });
}

