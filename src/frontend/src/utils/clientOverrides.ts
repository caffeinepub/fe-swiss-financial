// Local storage utility for per-client Overview field overrides
// Used for mock clients and as fallback for backend clients

const STORAGE_KEY_PREFIX = 'client_overrides_';

export function loadClientOverrides(clientId: string): Record<string, string> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load client overrides:', error);
    return {};
  }
}

export function saveClientOverrides(clientId: string, overrides: Record<string, string>): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    localStorage.setItem(key, JSON.stringify(overrides));
  } catch (error) {
    console.error('Failed to save client overrides:', error);
  }
}

export function clearClientOverrides(clientId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear client overrides:', error);
  }
}
