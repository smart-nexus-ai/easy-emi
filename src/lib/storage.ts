import { ShopInfo, Provider, PdfSettings, Preferences } from './types';

const KEYS = {
  SHOP_INFO: 'emi_shop_info',
  PROVIDERS: 'emi_providers',
  PDF_SETTINGS: 'emi_pdf_settings',
  PREFERENCES: 'emi_preferences',
};

// Default values
const DEFAULT_PDF_SETTINGS: PdfSettings = {
  defaultTemplate: 'classic',
  defaultAddTotal: false,
};

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  onboardingComplete: false,
};

// Raw helpers with safety checks for SSR/runtime environments
const isBrowser = typeof window !== 'undefined';

function readKey<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage`, error);
    return defaultValue;
  }
}

function writeKey<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key} to localStorage`, error);
  }
}

// Shop Info
export function getShopInfo(): ShopInfo | null {
  if (!isBrowser) return null;
  const data = localStorage.getItem(KEYS.SHOP_INFO);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setShopInfo(data: ShopInfo): void {
  writeKey(KEYS.SHOP_INFO, data);
}

// Providers
export function getProviders(): Provider[] {
  return readKey<Provider[]>(KEYS.PROVIDERS, []);
}

export function setProviders(data: Provider[]): void {
  writeKey(KEYS.PROVIDERS, data);
}

export function addProvider(provider: Provider): void {
  const current = getProviders();
  setProviders([...current, provider]);
}

export function updateProvider(id: string, data: Partial<Provider>): void {
  const current = getProviders();
  const updated = current.map((p) => (p.id === id ? { ...p, ...data } : p));
  setProviders(updated);
}

export function deleteProvider(id: string): void {
  const current = getProviders();
  const filtered = current.filter((p) => p.id !== id);
  setProviders(filtered);
}

// PDF Settings
export function getPdfSettings(): PdfSettings {
  return readKey<PdfSettings>(KEYS.PDF_SETTINGS, DEFAULT_PDF_SETTINGS);
}

export function setPdfSettings(data: Partial<PdfSettings>): void {
  const current = getPdfSettings();
  writeKey(KEYS.PDF_SETTINGS, { ...current, ...data });
}

// Preferences
export function getPreferences(): Preferences {
  return readKey<Preferences>(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function setPreferences(data: Partial<Preferences>): void {
  const current = getPreferences();
  const updated = { ...current, ...data };
  writeKey(KEYS.PREFERENCES, updated);
  
  // Apply theme class when preferences change
  if (isBrowser) {
    applyThemeClass(updated.theme);
  }
}

// Applies theme class to document element
export function applyThemeClass(theme: Preferences['theme']): void {
  if (!isBrowser) return;
  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Initialize theme on load
export function initThemeOnLoad(): void {
  if (!isBrowser) return;
  const prefs = getPreferences();
  applyThemeClass(prefs.theme);
  
  // Listen to system changes if set to system
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const currentPrefs = getPreferences();
    if (currentPrefs.theme === 'system') {
      applyThemeClass('system');
    }
  };
  
  try {
    mediaQuery.addEventListener('change', handler);
  } catch {
    // Fallback for older browsers
    mediaQuery.addListener(handler);
  }
}
