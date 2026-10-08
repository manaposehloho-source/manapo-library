import { useState, useEffect } from 'react';
import { readKey, writeKey } from '../storage.js';

/* useState that is loaded from, and saved to, localStorage.
   `initial` may be a value or a function (used only when storage is empty). */
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = readKey(key, undefined);
    if (stored !== undefined) return stored;
    return typeof initial === 'function' ? initial() : initial;
  });

  useEffect(() => {
    writeKey(key, value);
  }, [key, value]);

  return [value, setValue];
}
