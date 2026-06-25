const STORAGE_KEY = 'mandarin-studio-progress-v1';

export function readStoredProgress() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') {
    return;
  }

  const existing = readStoredProgress();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...progress }));
}

export function clearStoredProgress() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
