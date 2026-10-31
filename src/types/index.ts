export type Level = "green" | "yellow" | "red";

export type ProfileId = "normal" | "diabetes" | "gout" | "pregnancy";

export type FoodType = "dish" | "risky_food";

export type RiskLevel = "low" | "medium" | "high";

export interface Risk {
  label: string;
  level: RiskLevel;
}

export interface AttpInfo {
  score: number; // 0-10, càng cao càng an toàn
  risks: Risk[];
}

export interface ProfileRecommendation {
  level: Level;
  reason: string;
  advice: string;
}

export interface Food {
  id: string;
  name: string;
  aliases: string[];
  type: FoodType;
  category: string;
  emoji: string;
  attp: AttpInfo;
  profiles: Record<ProfileId, ProfileRecommendation>;
  alternatives: Partial<Record<ProfileId, string[]>>; // mảng food id
  sources: string[]; // id trong sources[]
}

export interface Profile {
  id: ProfileId;
  label: string;
  description: string;
  emoji: string;
}

export interface Source {
  id: string;
  name: string;
  url: string | null;
  verified: boolean;
}

export interface Meta {
  version: string;
  note: string;
  attpScale: string;
  levels: Level[];
  profiles: ProfileId[];
}

export interface FoodDatabase {
  meta: Meta;
  profiles: Profile[];
  sources: Source[];
  foods: Food[];
}

export type Screen = "profile-select" | "home" | "scan" | "confirm" | "result";

