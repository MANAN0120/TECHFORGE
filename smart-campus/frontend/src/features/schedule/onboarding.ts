const ONBOARDING_KEY = 'smartcampus.schedule.onboarded.v1';

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch (err) {
    return false;
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (err) {
    console.error('Failed to mark schedule onboarded:', err);
  }
}

export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (err) {
    console.error('Failed to reset schedule onboarding:', err);
  }
}
