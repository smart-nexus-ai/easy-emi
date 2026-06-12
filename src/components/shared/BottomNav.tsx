'use client';

import { useNavigationStore } from '../../store/navigationStore';
import { Calculator, ShieldCheck, Settings } from 'lucide-react';

export default function BottomNav() {
  const { currentView, navigateTo } = useNavigationStore();
  const currentRoute = currentView.route;

  // Bottom navigation only visible on primary navigation root states
  const visibleRoutes = ['home', 'providers', 'settings'];
  if (!visibleRoutes.includes(currentRoute)) {
    return null;
  }

  return (
    <nav className="border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky bottom-0 z-50 no-print md:hidden">
      <div className="max-w-[480px] mx-auto flex items-center justify-around py-1.5 px-2">
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:cursor-pointer ${
            currentRoute === 'home'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 dark:bg-transparent dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
          }`}
        >
          <Calculator className="h-5 w-5" />
          <span className="text-[10px] font-semibold tracking-tight">EMI Form</span>
        </button>

        <button
          onClick={() => navigateTo('providers')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:cursor-pointer ${
            currentRoute === 'providers' || currentRoute === 'provider-detail'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 dark:bg-transparent dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
          <span className="text-[10px] font-semibold tracking-tight">Providers</span>
        </button>

        <button
          onClick={() => navigateTo('settings')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:cursor-pointer ${
            currentRoute === 'settings'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 dark:bg-transparent dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] font-semibold tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
}
