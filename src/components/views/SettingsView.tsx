'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { ShopInfo, PdfSettings, Provider } from '../../lib/types';
import {
  getShopInfo,
  setShopInfo,
  getPdfSettings,
  setPdfSettings,
  getProviders,
  setProviders,
  getPreferences,
  setPreferences,
} from '../../lib/storage';
import { useNavigationStore } from '../../store/navigationStore';
import {
  Store,
  FileText,
  Download,
  Upload,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  CreditCard,
  Plus,
  ArrowLeftRight,
} from 'lucide-react';

interface BackupPayload {
  version: string;
  exportedAt: string;
  shopInfo: ShopInfo | null;
  providers: Provider[];
  pdfSettings: PdfSettings;
}

const CARD_THEMES = [
  { borderGradient: 'bg-gradient-to-r from-purple-500 to-blue-500', glowClass: 'shadow-purple-blue-glow' },
  { borderGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', glowClass: 'shadow-blue-cyan-glow' },
  { borderGradient: 'bg-gradient-to-r from-green-500 to-teal-500', glowClass: 'shadow-green-teal-glow' },
  { borderGradient: 'bg-gradient-to-r from-pink-500 to-purple-500', glowClass: 'shadow-pink-purple-glow' },
  { borderGradient: 'bg-gradient-to-r from-orange-500 to-yellow-500', glowClass: 'shadow-orange-yellow-glow' },
];

export default function SettingsView() {
  const { navigateTo } = useNavigationStore();
  
  // Section states
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [defaultTemplate, setDefaultTemplate] = useState<'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist'>('classic');
  const [defaultAddTotal, setDefaultAddTotal] = useState(false);

  const [providersList, setProvidersList] = useState<Provider[]>([]);

  // Import flow variables
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'replace' | 'merge' | null>(null);
  const [importedData, setImportedData] = useState<BackupPayload | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Merge Conflict variables
  interface MergeConflict {
    importing: Provider;
    existing: Provider;
  }
  const [conflicts, setConflicts] = useState<MergeConflict[]>([]);
  const [activeConflictIdx, setActiveConflictIdx] = useState<number>(0);
  const [resolveNameOverride, setResolveNameOverride] = useState('');

  useEffect(() => {
    // Read user configuration
    const sInfo = getShopInfo();
    if (sInfo) {
      setShopName(sInfo.name);
      setShopPhone(sInfo.phone);
      setShopAddress(sInfo.address);
    }

    const pdfS = getPdfSettings();
    setDefaultTemplate(pdfS.defaultTemplate);
    setDefaultAddTotal(pdfS.defaultAddTotal);

    setProvidersList(getProviders());
  }, []);

  const triggerToast = (text: string, error = false) => {
    setToastMessage({ text, error });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveShopInfo = () => {
    const fresh: ShopInfo = {
      name: shopName.trim() || 'My Electronics Store',
      phone: shopPhone.trim(),
      address: shopAddress.trim(),
    };
    setShopInfo(fresh);
    setSaveSuccess(true);
    triggerToast('Shop Settings persisted successfully!');
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleSavePdfSettings = (tmpl: any, addTot: boolean) => {
    setDefaultTemplate(tmpl);
    setDefaultAddTotal(addTot);
    setPdfSettings({ defaultTemplate: tmpl, defaultAddTotal: addTot });
    triggerToast('PDF Layout defaults saved!');
  };

  const handleExportBackup = () => {
    try {
      const payload: BackupPayload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        shopInfo: getShopInfo(),
        providers: getProviders(),
        pdfSettings: getPdfSettings(),
      };

      const raw = JSON.stringify(payload, null, 2);
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `easy-emi-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Export payload created & downloaded!');
    } catch (e) {
      triggerToast('Export failed. Please retry.', true);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.providers) && parsed.pdfSettings) {
          setImportedData(parsed);
          setShowImportDialog(true);
        } else {
          triggerToast('Invalid backup file. Format not recognized.', true);
        }
      } catch {
        triggerToast('Failed to parse backup file. Invalid formatted JSON.', true);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can trigger change again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Perform full overwrite restoration
  const executeReplaceImport = (data: BackupPayload) => {
    if (data.shopInfo) setShopInfo(data.shopInfo);
    setProviders(data.providers);
    setPdfSettings(data.pdfSettings);
    
    // Refresh parameters UI
    if (data.shopInfo) {
      setShopName(data.shopInfo.name);
      setShopPhone(data.shopInfo.phone);
      setShopAddress(data.shopInfo.address);
    }
    setDefaultTemplate(data.pdfSettings.defaultTemplate);
    setDefaultAddTotal(data.pdfSettings.defaultAddTotal);
    setProvidersList(data.providers);

    setShowImportDialog(false);
    setImportedData(null);
    triggerToast('Full restoration complete. All previous properties replaced.');
  };

  // Analyze conflicts to prepare Merge workflow
  const initiateMergeImport = (data: BackupPayload) => {
    const existing = getProviders();
    const importing = data.providers;

    const foundConflicts: MergeConflict[] = [];

    importing.forEach((impProv) => {
      const match = existing.find(
        (exProv) => exProv.name.toLowerCase() === impProv.name.toLowerCase()
      );
      if (match) {
        foundConflicts.push({ importing: impProv, existing: match });
      }
    });

    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      setActiveConflictIdx(0);
      setResolveNameOverride(`${foundConflicts[0].importing.name} (Copy)`);
      setImportType('merge');
    } else {
      // Zero conflicts, append directly!
      const finalProviders = [...existing, ...importing];
      setProviders(finalProviders);
      setProvidersList(finalProviders);
      
      // Merge shop info if null
      if (!getShopInfo() && data.shopInfo) {
        setShopInfo(data.shopInfo);
        setShopName(data.shopInfo.name);
        setShopPhone(data.shopInfo.phone);
        setShopAddress(data.shopInfo.address);
      }

      setShowImportDialog(false);
      setImportedData(null);
      triggerToast(`Merge complete. Added ${importing.length} new finance providers!`);
    }
  };

  // Handle single conflict choice outcome
  const handleResolveConflict = (action: 'skip' | 'replace' | 'rename') => {
    if (!importedData) return;
    const currentConflict = conflicts[activeConflictIdx];
    
    let resolvedList = [...getProviders()];
    const importingList = [...importedData.providers];

    if (action === 'skip') {
      // Keep existing, so skip importing this active item
      // Do nothing to local list
    } else if (action === 'replace') {
      // Overwrite local provider with matching name using imported data
      resolvedList = resolvedList.map((p) =>
        p.id === currentConflict.existing.id
          ? { ...currentConflict.importing, id: currentConflict.existing.id }
          : p
      );
    } else if (action === 'rename') {
      // Add with fresh renamed property title
      const newProv: Provider = {
        ...currentConflict.importing,
        id: crypto.randomUUID(),
        name: resolveNameOverride.trim() || `${currentConflict.importing.name} (Imported)`,
      };
      resolvedList.push(newProv);
    }

    setProviders(resolvedList);

    // Filter imported list to avoid re-including this resolved item when finishing up
    importedData.providers = importedData.providers.filter(
      (p) => p.id !== currentConflict.importing.id
    );

    if (activeConflictIdx + 1 < conflicts.length) {
      const nextIdx = activeConflictIdx + 1;
      setActiveConflictIdx(nextIdx);
      setResolveNameOverride(`${conflicts[nextIdx].importing.name} (Copy)`);
    } else {
      // Done resolving all conflicts! Append remaining non-conflicting providers
      const remainingProviders = importedData.providers.filter(
        (impProv) =>
          !conflicts.some((conf) => conf.importing.name.toLowerCase() === impProv.name.toLowerCase())
      );

      const finalProviders = [...getProviders(), ...remainingProviders];
      setProviders(finalProviders);
      setProvidersList(finalProviders);

      setShowImportDialog(false);
      setConflicts([]);
      setImportedData(null);
      setImportType(null);
      triggerToast('All partner merge conflicts resolved successfully!');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">App Settings</h2>
        <p className="text-xs text-slate-555">Configure shop parameters, invoice defaults, and backups.</p>
      </div>

      {toastMessage && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            toastMessage.error
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {toastMessage.error ? (
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Two-Column Grid for Desktop view enhancement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shop Information */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Shop Information settings Card */}
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[0].borderGradient} ${CARD_THEMES[0].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <Store className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Shop Information</h3>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Sri Ram Mobile Store"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Phone</label>
                <input
                  type="tel"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Address</label>
                <textarea
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="e.g. Main Road, Cooch Behar, West Bengal"
                  rows={2}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <button
                onClick={handleSaveShopInfo}
                className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:cursor-pointer transition-colors"
              >
                <Save className="h-4 w-4" />
                Update Details
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: PDF settings & Backups */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* PDF Generation preferences Card */}
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[1].borderGradient} ${CARD_THEMES[1].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">PDF Layout Settings</h3>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Default PDF Template style</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['classic', 'modern', 'compact', 'elegant', 'minimalist'] as const).map((tmpl) => (
                    <button
                      key={tmpl}
                      onClick={() => handleSavePdfSettings(tmpl, defaultAddTotal)}
                      className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all hover:cursor-pointer ${
                        defaultTemplate === tmpl
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 rounded-lg bg-slate-50/30 dark:bg-slate-950/10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Combined Total Amount</span>
                  <span className="text-[10px] text-slate-400">Include aggregated summary table line in PDF footer lists.</span>
                </div>
                <input
                  type="checkbox"
                  checked={defaultAddTotal}
                  onChange={(e) => handleSavePdfSettings(defaultTemplate, e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 hover:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cloud-less Backup & Restore local properties */}
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[2].borderGradient} ${CARD_THEMES[2].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <ArrowLeftRight className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Export & Import Backups</h3>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Create offline backup logs to safe-keep your finance provider configuration matrices, terms templates, and business parameters.
              </p>

              <div className="grid grid-cols-2 gap-3.5 mt-1">
                <button
                  onClick={handleExportBackup}
                  className="py-2.5 rounded-lg border border-gray-300 dark:border-indigo-900/60 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-indigo-950/30 text-gray-800 dark:text-gray-200 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:cursor-pointer transition-all"
                >
                  <Download className="h-4.5 w-4.5" />
                  Backup Logs
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 rounded-lg border border-gray-300 dark:border-slate-800 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:cursor-pointer transition-all"
                >
                  <Upload className="h-4.5 w-4.5" />
                  Restore File
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Restoration Dialog Modals */}
      {showImportDialog && importedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-100 font-sans">
          <div className="bg-white dark:bg-slate-900 max-w-[420px] w-full border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-blue-600" />
                Restore Settings Backup
              </span>
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportedData(null);
                  setImportType(null);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {importType === null ? (
                <>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Choose how the backup manager should handle file restoration:
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => executeReplaceImport(importedData)}
                      className="p-3 text-left border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 rounded-xl hover:cursor-pointer transition-all hover:border-red-400"
                    >
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Replace All Settings
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Clears all current providers and shop information definitions, overwriting them with the backup data.
                      </p>
                    </button>

                    <button
                      onClick={() => initiateMergeImport(importedData)}
                      className="p-3 text-left border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-transparent rounded-xl hover:cursor-pointer transition-all"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        Merge Configurations
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Adds new providers to the list. Triggers inline conflicts if same-named partners are detected.
                      </p>
                    </button>
                  </div>
                </>
              ) : (
                /* Conflict Resolution card frame */
                <div className="flex flex-col gap-3">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 p-3 rounded-lg text-amber-850 dark:text-amber-400 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold">Conflict Detected ({activeConflictIdx + 1}/{conflicts.length})</span>
                      <span className="text-[10px]">A provider named <code className="font-bold underline">"{conflicts[activeConflictIdx]?.importing.name}"</code> already exists locally.</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Choose conflict resolution:</label>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleResolveConflict('skip')}
                          className="w-full py-2 border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:cursor-pointer"
                        >
                          Skip Importing (Keep Local)
                        </button>
                        
                        <button
                          onClick={() => handleResolveConflict('replace')}
                          className="w-full py-2 border border-red-500 bg-red-500 text-white font-semibold text-xs rounded-lg hover:bg-red-650 hover:cursor-pointer"
                        >
                          Overwrite Local with Backed Up
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-250 dark:border-slate-800/80 my-2.5" />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350">Or rename imported provider as:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={resolveNameOverride}
                          onChange={(e) => setResolveNameOverride(e.target.value)}
                          placeholder="Renamed copy name..."
                          className="px-2.5 py-1.5 flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-750 text-xs rounded-md shadow-3xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleResolveConflict('rename')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md hover:cursor-pointer"
                        >
                          Rename & Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
