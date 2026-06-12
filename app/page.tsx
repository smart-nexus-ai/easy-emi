'use client';

import { useEffect, useState } from 'react';
import { initThemeOnLoad, getPreferences } from '../src/lib/storage';
import { useNavigationStore } from '../src/store/navigationStore';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('../src/components/shared/ThemeToggle'), { ssr: false });
const BottomNav = dynamic(() => import('../src/components/shared/BottomNav'), { ssr: false });
const OnboardingWizard = dynamic(() => import('../src/components/forms/OnboardingWizard'), { ssr: false });
const HomeView = dynamic(() => import('../src/components/views/HomeView'), { ssr: false });
const PreviewView = dynamic(() => import('../src/components/views/PreviewView'), { ssr: false });
const SettingsView = dynamic(() => import('../src/components/views/SettingsView'), { ssr: false });
const ProvidersListView = dynamic(() => import('../src/components/views/ProvidersListView'), { ssr: false });
const ProviderDetailView = dynamic(() => import('../src/components/views/ProviderDetailView'), { ssr: false });
import { Calculator, Wifi, WifiOff, ShieldCheck, Settings } from 'lucide-react';

export default function Page() {
  const { currentView, navigateTo } = useNavigationStore();
  const [loading, setLoading] = useState(true);

  // Connection awareness statuses
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const [networkType, setNetworkType] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // 1. Initialize user theme preferences
    initThemeOnLoad();

    // Register custom Service Worker for offline PWA capabilities
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('[PWA] Service Worker registered:', reg.scope))
          .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((reg) => console.log('[PWA] Service Worker registered:', reg.scope))
            .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
        });
      }
    }

    // 2. Perform quick onboarding status checks
    const prefs = getPreferences();
    if (!prefs.onboardingComplete) {
      navigateTo('onboarding');
    }
    setLoading(false);

    // 3. Setup internet connection state listeners
    const handleOnline = () => {
      setNetworkType('online');
      setShowNetworkToast(true);
      const timer = setTimeout(() => setShowNetworkToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setNetworkType('offline');
      setShowNetworkToast(true);
      const timer = setTimeout(() => setShowNetworkToast(false), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Run first baseline check
    if (!navigator.onLine) {
      setNetworkType('offline');
      setShowNetworkToast(true);
      setTimeout(() => setShowNetworkToast(false), 4000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigateTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 font-sans">
        <span className="text-xs font-semibold animate-pulse">Initializing Easy EMI...</span>
      </div>
    );
  }

  // Active view router dispatcher
  const renderView = () => {
    switch (currentView.route) {
      case 'onboarding':
        return <OnboardingWizard />;
      case 'preview':
        return <PreviewView />;
      case 'settings':
        return <SettingsView />;
      case 'providers':
        return <ProvidersListView />;
      case 'provider-detail':
        return <ProviderDetailView />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  const showHeader = currentView.route !== 'onboarding';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Primary Header - hides during onboarding for full layout room */}
      {showHeader && (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-900/80 no-print">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 hover:cursor-pointer text-left focus:outline-hidden"
            >
              <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-950 dark:text-slate-50 leading-none">
                  Easy EMI Manager
                </h1>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                  Offline Slip Engine
                </p>
              </div>
            </button>
            
            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800/85">
              {/* EMI Form Tab */}
              <div className={`p-[1px] rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 glow-btn-blue-cyan transition-all duration-200 dark:opacity-100 ${
                currentView.route === 'home' ? 'active' : ''
              }`}>
                <button
                  onClick={() => navigateTo('home')}
                  className={`px-3 py-1.5 text-xs rounded-[7px] flex items-center gap-1.5 hover:cursor-pointer transition-all duration-200 ${
                    currentView.route === 'home'
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:bg-slate-950 dark:from-blue-500/20 dark:to-cyan-500/20 text-gray-900 font-semibold dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-950 dark:bg-gradient-to-r dark:from-blue-500/10 dark:to-cyan-500/10 text-gray-700 font-normal dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                  EMI Form
                </button>
              </div>

              {/* Providers Tab */}
              <div className={`p-[1px] rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 glow-btn-purple-pink transition-all duration-200 dark:opacity-100 ${
                currentView.route === 'providers' || currentView.route === 'provider-detail' ? 'active' : ''
              }`}>
                <button
                  onClick={() => navigateTo('providers')}
                  className={`px-3 py-1.5 text-xs rounded-[7px] flex items-center gap-1.5 hover:cursor-pointer transition-all duration-200 ${
                    currentView.route === 'providers' || currentView.route === 'provider-detail'
                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:bg-slate-950 dark:from-purple-500/20 dark:to-pink-500/20 text-gray-900 font-semibold dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-950 dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-pink-500/10 text-gray-700 font-normal dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Providers
                </button>
              </div>

              {/* Settings Tab */}
              <div className={`p-[1px] rounded-lg bg-gradient-to-r from-green-500 to-teal-500 glow-btn-green-teal transition-all duration-200 dark:opacity-100 ${
                currentView.route === 'settings' ? 'active' : ''
              }`}>
                <button
                  onClick={() => navigateTo('settings')}
                  className={`px-3 py-1.5 text-xs rounded-[7px] flex items-center gap-1.5 hover:cursor-pointer transition-all duration-200 ${
                    currentView.route === 'settings'
                      ? 'bg-gradient-to-r from-green-500/10 to-teal-500/10 dark:bg-slate-950 dark:from-green-500/20 dark:to-teal-500/20 text-gray-900 font-semibold dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-950 dark:bg-gradient-to-r dark:from-green-500/10 dark:to-teal-500/10 text-gray-700 font-normal dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </header>
      )}

      {/* Main Container pane */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-5 flex flex-col gap-6">
        {renderView()}
      </main>

      {/* Persistent Mobile Bottom Navigation rails (only on key dashboard entries) */}
      <BottomNav />

      {/* Network Alert Notification Overlay */}
      {showNetworkToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-100 max-w-[400px] w-[90%] font-sans no-print animate-pulse">
          <div
            className={`px-4 py-3.5 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md transition-all ${
              networkType === 'offline'
                ? 'bg-slate-900/95 border-slate-700 text-slate-100'
                : 'bg-emerald-600/95 border-emerald-500 text-white'
            }`}
          >
            {networkType === 'offline' ? (
              <>
                <div className="bg-slate-800 p-1.5 rounded-md text-amber-500 shrink-0">
                  <WifiOff className="h-4 w-4" />
                </div>
                <div className="flex-1 leading-snug text-left">
                  <h5 className="font-extrabold text-[11px] text-white">Offline Mode Active</h5>
                  <p className="text-[10px] text-slate-450 mt-0.5 font-normal">Working 100% locally. No internet required.</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-emerald-700 p-1.5 rounded-md text-white shrink-0">
                  <Wifi className="h-4 w-4" />
                </div>
                <div className="flex-1 leading-snug text-left">
                  <h5 className="font-extrabold text-[11px] text-white">Back Online</h5>
                  <p className="text-[10px] text-emerald-100 mt-0.5 font-normal">Your network access has been restored.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Minimal Printable Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-900 py-3 text-center text-[10px] text-slate-400 dark:text-slate-500 mt-auto bg-white/30 dark:bg-slate-950/30 font-semibold no-print">
        Easy EMI Manager &bull; Crafted Offline-First
      </footer>
    </div>
  );
}
