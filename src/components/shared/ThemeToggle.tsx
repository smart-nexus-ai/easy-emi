'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { getPreferences, setPreferences } from '../../lib/storage';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const prefs = getPreferences();
    setTheme(prefs.theme);
  }, []);

  const cycleTheme = () => {
    let nextTheme: 'light' | 'dark' | 'system' = 'light';
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'system';
    else nextTheme = 'light';

    setTheme(nextTheme);
    setPreferences({ theme: nextTheme });
  };

  return (
    <button
      id="theme-cycle-button"
      onClick={cycleTheme}
      className="p-2 mr-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 hover:cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 font-sans outline-hidden inline-flex items-center gap-1.5 text-xs font-semibold"
      title="Cycle theme (Light, Dark, System)"
    >
      {theme === 'light' && (
        <>
          <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
          <span>Light Mode</span>
        </>
      )}
      {theme === 'dark' && (
        <>
          <Moon className="h-4 w-4 text-indigo-400" />
          <span>Dark Mode</span>
        </>
      )}
      {theme === 'system' && (
        <>
          <Laptop className="h-4 w-4 text-emerald-500" />
          <span>System Theme</span>
        </>
      )}
    </button>
  );
}
