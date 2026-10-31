import { ProfileId, Profile } from '../types';
import { getProfiles } from './data';

const STORAGE_KEY = 'foodsafe.profile';
const DEFAULT_PROFILE: ProfileId = 'normal';

export function hasStoredProfile(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return Boolean(saved && ['normal', 'diabetes', 'gout', 'pregnancy'].includes(saved));
  } catch {
    return false;
  }
}

export function getStoredProfile(): ProfileId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['normal', 'diabetes', 'gout', 'pregnancy'].includes(saved)) {
      return saved as ProfileId;
    }
  } catch {
    // localStorage might be unavailable or restricted
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: ProfileId): void {
  try {
    localStorage.setItem(STORAGE_KEY, profile);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function getProfileDetails(profileId: ProfileId): Profile {
  const profiles = getProfiles();
  const found = profiles.find((p) => p.id === profileId);
  if (found) return found;

  return {
    id: profileId,
    label: profileId,
    description: '',
    emoji: '👤',
  };
}
