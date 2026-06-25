import { useState, useEffect } from 'react';

/**
 * Drop-in replacement for useState that automatically persists
 * the value to localStorage under the given key.
 * Falls back to defaultValue if nothing is stored or JSON is corrupt.
 */
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or private browsing — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
