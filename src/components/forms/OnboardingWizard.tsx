'use client';

import { useState } from 'react';
import { ShopInfo, Provider } from '../../lib/types';
import { setShopInfo, addProvider, setPreferences, setPdfSettings } from '../../lib/storage';
import { useNavigationStore } from '../../store/navigationStore';
import { Store, CreditCard, FileText, ChevronRight, Check } from 'lucide-react';

export default function OnboardingWizard() {
  const { navigateTo } = useNavigationStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Shop Info State
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopError, setShopError] = useState('');

  // Step 2: First Provider State (Optional)
  const [providerName, setProviderName] = useState('');
  const [advanceDays, setAdvanceDays] = useState(5);
  const [emiIncrement, setEmiIncrement] = useState('');

  // Step 3: Default Template State
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist'>('classic');

  const handleNextStep1 = () => {
    if (!shopName.trim()) {
      setShopError('Shop Name is required.');
      return;
    }
    setShopError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleCompleteOnboarding = () => {
    // 1. Save Shop Info
    const finalShopInfo: ShopInfo = {
      name: shopName.trim() || 'My Electronics Store',
      phone: shopPhone.trim() || 'N/A',
      address: shopAddress.trim() || 'N/A',
    };
    setShopInfo(finalShopInfo);

    // 2. Save First Provider (optional)
    if (providerName.trim()) {
      const firstProvider: Provider = {
        id: crypto.randomUUID(),
        name: providerName.trim(),
        advanceDays: Number(advanceDays) || 5,
        emiIncrement: Number(emiIncrement) || 0,
        termsSets: [],
      };
      addProvider(firstProvider);
    }

    // 3. Save Default Template
    setPdfSettings({
      defaultTemplate: selectedTemplate,
      defaultAddTotal: false,
    });

    // 4. Mark Onboarding as Complete
    setPreferences({ onboardingComplete: true });

    // 5. Navigate to Home
    navigateTo('home');
  };

  const handleSkipOnboarding = () => {
    // Save minimal default fallback fields
    setShopInfo({
      name: 'Easy EMI Customer',
      phone: '',
      address: '',
    });
    setPdfSettings({
      defaultTemplate: 'classic',
      defaultAddTotal: false,
    });
    setPreferences({ onboardingComplete: true });
    navigateTo('home');
  };

  return (
    <div className="max-w-[440px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden font-sans">
      {/* Progress Header */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Step {step} of 3</span>
        </div>
        <button
          onClick={handleSkipOnboarding}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium hover:cursor-pointer p-1"
        >
          Skip Wizard
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step Contents */}
      <div className="p-6">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Shop Information</h2>
                <p className="text-xs text-slate-500">Add info displayed in generated PDF headers.</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Name *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => {
                  setShopName(e.target.value);
                  if (e.target.value.trim()) setShopError('');
                }}
                placeholder="e.g. Sri Ram Mobile Store"
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
              />
              {shopError && <p className="text-[11px] text-red-500 mt-0.5">{shopError}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Phone (Optional)</label>
              <input
                type="tel"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop Address (Optional)</label>
              <textarea
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                placeholder="e.g. Main Road, Cooch Behar, West Bengal"
                rows={2}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <button
              onClick={handleNextStep1}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:cursor-pointer transition-colors"
            >
              Configure Providers
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Add First Provider</h2>
                <p className="text-xs text-slate-500">Configure your primary finance partner details.</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              You can set up multiple finance providers or complex terms sets later in settings (e.g. Bajaj Finserv, TVS Finance, HDB). Add one now to start quickly:
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Provider Name (Optional)</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. Bajaj Finserv"
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Advance Days</label>
                <input
                  type="number"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="5"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Default EMI Increment</label>
                <input
                  type="number"
                  value={emiIncrement}
                  onChange={(e) => setEmiIncrement(e.target.value)}
                  placeholder="e.g. 300"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNextStep2}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:cursor-pointer transition-colors"
              >
                Template Selection
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Default PDF Template</h2>
                <p className="text-xs text-slate-500">Select the layout style for printing EMI schedules.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { id: 'classic', title: 'Classic Template', desc: 'Simulates the traditional landscape layout, highlighting structured ledger lines.' },
                { id: 'modern', title: 'Modern Template', desc: 'Sleek visual hierarchy with optimized margins and clean editorial typography.' },
                { id: 'compact', title: 'Compact Template', desc: 'Densely formatted single-page receipt design optimized for quick mobile prints.' },
                { id: 'elegant', title: 'Elegant Template', desc: 'Prestige format using Royal Indigo accents, alternating ledger cells, and double line totals.' },
                { id: 'minimalist', title: 'Minimalist Template', desc: 'Sophisticated design using zero vertical dividers, thin line underlines, and generous space.' }
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id as any)}
                  className={`p-3 text-left border rounded-xl hover:cursor-pointer transition-all flex items-start gap-3 ${
                    selectedTemplate === tmpl.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedTemplate === tmpl.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-transparent'
                  }`}>
                    {selectedTemplate === tmpl.id && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tmpl.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{tmpl.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:cursor-pointer transition-colors"
              >
                Finish Setup
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
