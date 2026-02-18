// Local storage utility for per-client Activity Log entries
// Used as fallback when backend storage is unavailable

import type { ActivityLogEntry } from '../backend';

const STORAGE_KEY_PREFIX = 'client_activity_log_';

export function loadClientActivityLog(clientId: string): string[] {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load client activity log:', error);
    return [];
  }
}

export function appendClientActivityLog(clientId: string, entries: ActivityLogEntry[]): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    const existing = loadClientActivityLog(clientId);
    
    // Format entries to match backend format
    const formattedEntries = entries.map((entry) => {
      const timestamp = entry.timestamp.toString();
      return `${timestamp} | ${entry.fieldName} | Old: ${entry.oldValue} | New: ${entry.newValue} | User: ${entry.user}`;
    });
    
    const updated = [...existing, ...formattedEntries];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to append to client activity log:', error);
  }
}

export function clearClientActivityLog(clientId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${clientId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear client activity log:', error);
  }
}
