'use client';

import { useState, useEffect } from 'react';
import { Provider, TermsSet, EMIFormState } from '../../lib/types';
import { getProviders, getPdfSettings } from '../../lib/storage';
import { useNavigationStore } from '../../store/navigationStore';
import { useEMIFormStore } from '../../store/emiFormStore';
import { generateSchedule, calculateTotal } from '../../lib/emi';
import {
  Calendar,
  Layers,
  Settings,
  ShieldCheck,
  Check,
  Edit2,
  FileText,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Eye,
  Shield,
  CheckCircle,
} from 'lucide-react';

const CARD_THEMES = [
  { borderGradient: 'bg-gradient-to-r from-purple-500 to-blue-500', glowClass: 'shadow-purple-blue-glow' },
  { borderGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', glowClass: 'shadow-blue-cyan-glow' },
  { borderGradient: 'bg-gradient-to-r from-green-500 to-teal-500', glowClass: 'shadow-green-teal-glow' },
  { borderGradient: 'bg-gradient-to-r from-pink-500 to-purple-500', glowClass: 'shadow-pink-purple-glow' },
  { borderGradient: 'bg-gradient-to-r from-orange-500 to-yellow-500', glowClass: 'shadow-orange-yellow-glow' },
];

export default function HomeView() {
  const { navigateTo } = useNavigationStore();
  const { setFormState } = useEMIFormStore();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Form Fields
  const [firstEmiAmount, setFirstEmiAmount] = useState('');
  const [regularEmiAmount, setRegularEmiAmount] = useState('');
  const [isEditingRegularEmi, setIsEditingRegularEmi] = useState(false);
  const [emiIncrement, setEmiIncrement] = useState(0);
  const [isOverridden, setIsOverridden] = useState(false);
  
  const [emiCount, setEmiCount] = useState(6);
  const [firstEmiDate, setFirstEmiDate] = useState('');
  const [selectedTermsSetId, setSelectedTermsSetId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist'>('classic');
  const [addTotal, setAddTotal] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const list = getProviders();
    setProviders(list);

    // Default values from Settings
    const pdfSet = getPdfSettings();
    setSelectedTemplate(pdfSet.defaultTemplate);
    setAddTotal(pdfSet.defaultAddTotal);

    // Pre-select first provider if available
    if (list.length > 0) {
      handleProviderChange(list[0]);
    }

    // Default first EMI date calculation: 1st of next month if today < 20, else 1st of next-next month
    const today = new Date();
    const day = today.getDate();
    let targetDate: Date;
    if (day < 20) {
      targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else {
      targetDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    }
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dateStr = String(targetDate.getDate()).padStart(2, '0');
    setFirstEmiDate(`${year}-${month}-${dateStr}`);
  }, []);

  const handleProviderChange = (prov: Provider) => {
    setSelectedProvider(prov);
    const inc = prov.emiIncrement || 0;
    setEmiIncrement(inc);
    setIsOverridden(false);
    
    if (firstEmiAmount) {
      const calculatedCurrent = Number(firstEmiAmount) + inc;
      setRegularEmiAmount(String(calculatedCurrent));
    } else {
      setRegularEmiAmount('');
    }
    
    setIsEditingRegularEmi(false); // Reset regular override state

    // Filter terms compatibility
    if (prov.termsSets && prov.termsSets.length > 0) {
      setSelectedTermsSetId(prov.termsSets[0].id);
    } else {
      setSelectedTermsSetId('');
    }
  };

  const handlePreviewSubmit = () => {
    const nextErrors: Record<string, string> = {};

    if (!selectedProvider) {
      nextErrors.provider = 'Please select a finance partner.';
    }
    if (!firstEmiAmount || Number(firstEmiAmount) <= 0) {
      nextErrors.firstEmi = 'First EMI payment amount is required.';
    }
    const calculatedRegular = Number(regularEmiAmount);
    if (!regularEmiAmount || calculatedRegular <= 0) {
      nextErrors.regularEmi = 'Regular EMI amount is required.';
    }
    if (!emiCount || Number(emiCount) < 6) {
      nextErrors.emiCount = 'Minimum tenure is 6 EMIs.';
    }
    if (!firstEmiDate) {
      nextErrors.firstEmiDate = 'Please pick a 1st EMI due date.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const state: EMIFormState = {
      providerId: selectedProvider!.id,
      firstEmiAmount: Number(firstEmiAmount),
      emiIncrement: calculatedRegular - Number(firstEmiAmount),
      emiCount: Number(emiCount),
      firstEmiDate: firstEmiDate,
      termsSetId: selectedTermsSetId,
      template: selectedTemplate,
      addTotal: addTotal,
    };

    setFormState(state);
    navigateTo('preview');
  };

  if (providers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 font-sans">
        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-500">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No finance partners configured</h3>
          <p className="text-xs text-slate-550 max-w-xs mx-auto mt-1 leading-relaxed">
            Please setup your shop's finance providers in settings (e.g. Bajaj Flipping, TVS) to define advance terms and billing rates.
          </p>
        </div>
        <button
          onClick={() => navigateTo('providers')}
          className="mt-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg hover:cursor-pointer transition-colors"
        >
          Add Partner Provider
        </button>
      </div>
    );
  }

  // Real-time schedule generation for side panel preview
  const previewSchedule = (() => {
    if (!selectedProvider || !firstEmiAmount || Number(firstEmiAmount) <= 0) {
      return [];
    }
    try {
      const formStatePayload: EMIFormState = {
        providerId: selectedProvider.id,
        firstEmiAmount: Number(firstEmiAmount),
        emiIncrement: Number(regularEmiAmount || firstEmiAmount) - Number(firstEmiAmount),
        emiCount: Number(emiCount) || 6,
        firstEmiDate: firstEmiDate || new Date().toISOString().split('T')[0],
        termsSetId: selectedTermsSetId,
        template: selectedTemplate,
        addTotal: addTotal,
      };
      
      return generateSchedule(formStatePayload, selectedProvider);
    } catch {
      return [];
    }
  })();

  const previewTotal = calculateTotal(
    Number(firstEmiAmount) || 0,
    (Number(regularEmiAmount) || Number(firstEmiAmount)) - Number(firstEmiAmount),
    Number(emiCount) || 6
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans items-start w-full">
      {/* Left Form Column */}
      <div className="lg:col-span-5 flex flex-col gap-5 w-full">
        {/* Page description */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">EMI Slip Form</h2>
            <p className="text-xs text-slate-500">Enter transactional details to generate payment logs.</p>
          </div>
        </div>

        <div className={`p-[1px] rounded-xl ${CARD_THEMES[0].borderGradient} ${CARD_THEMES[0].glowClass} transition-all`}>
          <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
          {/* Provider dropdown Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Finance Partner *</label>
            <select
              value={selectedProvider?.id || ''}
              onChange={(e) => {
                const match = providers.find((p) => p.id === e.target.value);
                if (match) handleProviderChange(match);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.provider && <p className="text-[11px] text-red-500 mt-0.5">{errors.provider}</p>}
          </div>

          {/* 1st EMI Amount input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">1st EMI Amount * (Advance)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={firstEmiAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setFirstEmiAmount(val);
                  if (!isOverridden && selectedProvider) {
                    const calculated = val ? Number(val) + emiIncrement : 0;
                    setRegularEmiAmount(calculated > 0 ? String(calculated) : '');
                  }
                }}
                placeholder="e.g. 2900"
                className="pl-7 pr-3 py-2 w-full text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100 font-mono-nums"
              />
            </div>
            {errors.firstEmi && <p className="text-[11px] text-red-500 mt-0.5">{errors.firstEmi}</p>}
          </div>

          {/* Inline editable configuration for Regular EMI */}
          {firstEmiAmount && selectedProvider && (
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 p-3.5 rounded-xl flex items-center justify-between transition-all">
              <div className="flex flex-col gap-0.5 flex-1 mr-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regular Monthly EMI</span>
                
                {isEditingRegularEmi ? (
                  <div className="relative mt-1 max-w-[140px]">
                    <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-455 text-xs">₹</span>
                    <input
                      type="number"
                      value={regularEmiAmount}
                      onChange={(e) => {
                        setRegularEmiAmount(e.target.value);
                        setIsOverridden(true);
                      }}
                      className="pl-6 pr-2 py-1 w-full text-xs rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono-nums focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono-nums">
                    ₹{Number(regularEmiAmount || 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  if (isEditingRegularEmi) {
                    setIsEditingRegularEmi(false);
                  } else {
                    setIsEditingRegularEmi(true);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 hover:cursor-pointer transition-colors"
              >
                {isEditingRegularEmi ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                    Override
                  </>
                )}
              </button>
            </div>
          )}
          {errors.regularEmi && <p className="text-[11px] text-red-500 mt-0.5">{errors.regularEmi}</p>}

          {/* Tenure Count & Date Box Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total EMIs tenure *</label>
              <input
                type="number"
                min={6}
                value={emiCount}
                onChange={(e) => setEmiCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100 font-mono-nums"
              />
              {errors.emiCount && <p className="text-[11px] text-red-500 mt-0.5">{errors.emiCount}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">1st EMI Due date *</label>
              <input
                type="date"
                value={firstEmiDate}
                onChange={(e) => setFirstEmiDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100 font-mono-nums"
              />
              {errors.firstEmiDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.firstEmiDate}</p>}
            </div>
          </div>

          {/* Terms Option filter Selection */}
          {selectedProvider && selectedProvider.termsSets && selectedProvider.termsSets.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Printable Terms Set</label>
              <select
                value={selectedTermsSetId}
                onChange={(e) => setSelectedTermsSetId(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
              >
                {selectedProvider.termsSets.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PDF template selection inline row */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Template Layout</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-slate-900 dark:text-slate-100"
              >
                <option value="classic">Classic Style</option>
                <option value="modern">Modern Style</option>
                <option value="compact">Compact Receipt</option>
                <option value="elegant">Elegant Style</option>
                <option value="minimalist">Minimalist Style</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-955/40 hover:cursor-pointer transition-colors text-xs text-slate-700 dark:text-slate-300">
                <span>Show Grand Total</span>
                <input
                  type="checkbox"
                  checked={addTotal}
                  onChange={(e) => setAddTotal(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 hover:cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Big compile button */}
          <button
            onClick={handlePreviewSubmit}
            className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:cursor-pointer hover:shadow-xs transition-all"
          >
            <FileText className="h-4 w-4" />
            Preview Payment Schedule
            <ChevronRight className="h-4 w-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Right Column - Desktop Live Preview Dashboard */}
      <div className="lg:col-span-7 hidden lg:flex flex-col gap-5 w-full sticky top-[80px] self-start no-print">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-500" />
              Live Calculations Engine
            </h3>
            <p className="text-[11px] text-slate-500">Schedules update in real-time as parameters are filled.</p>
          </div>
          {selectedProvider && (
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-150/40 dark:border-blue-900/50 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {selectedProvider.name}
            </span>
          )}
        </div>

        {/* Live Stat Cards Grid */}
        <div className={`p-[1px] rounded-xl ${CARD_THEMES[1].borderGradient} ${CARD_THEMES[1].glowClass} transition-all`}>
          <div className="grid grid-cols-4 gap-3 bg-white dark:bg-slate-900 rounded-[11px] p-4 overflow-hidden">
          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 p-2.5 rounded-lg">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tenure</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono-nums mt-0.5">
              {emiCount || 0} Mos
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 p-2.5 rounded-lg">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Advance EMI</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono-nums mt-0.5 text-blue-600 dark:text-blue-400">
              ₹{Number(firstEmiAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 p-2.5 rounded-lg">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Regular EMI</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono-nums mt-0.5">
              ₹{Number(regularEmiAmount || firstEmiAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col bg-slate-50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 p-2.5 rounded-lg">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-sm font-extrabold text-slate-950 dark:text-slate-50 font-mono-nums mt-0.5">
              ₹{previewTotal.toLocaleString('en-IN')}
            </span>
          </div>
          </div>
        </div>

        {/* Live Calculated Schedule List Table */}
        <div className={`p-[1px] rounded-xl ${CARD_THEMES[2].borderGradient} ${CARD_THEMES[2].glowClass} transition-all`}>
          <div className="bg-white dark:bg-slate-900 rounded-[11px] overflow-hidden flex flex-col flex-1 max-h-[350px] overflow-y-auto">
          <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="col-span-2">No.</span>
            <span className="col-span-3">Advance Date</span>
            <span className="col-span-3">Online Date</span>
            <span className="col-span-4 text-right">Payment</span>
          </div>

          {previewSchedule.length === 0 ? (
            <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <ClipboardList className="h-7 w-7 text-slate-350 dark:text-slate-700 animate-pulse" />
              <span className="text-xs font-semibold">Enter EMI amount to generate table</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {previewSchedule.map((row) => (
                <div key={row.index} className="grid grid-cols-12 px-4 py-2 items-center text-xs text-slate-700 dark:text-slate-300">
                  <span className="col-span-2 font-mono text-[10px] text-slate-400">#{row.index}</span>
                  <span className="col-span-3 font-mono-nums text-[11px] font-semibold">{row.advanceDate}</span>
                  <span className="col-span-3 font-mono-nums text-[11px] font-semibold text-slate-900 dark:text-slate-100">{row.emiDate}</span>
                  <span className="col-span-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}

              {addTotal && (
                <div className="grid grid-cols-12 px-4 py-3.5 bg-slate-50/50 dark:bg-slate-955 font-bold text-xs items-center">
                  <span className="col-span-8 text-slate-550 uppercase tracking-wide text-[10px]">Total Scheduled Repayment</span>
                  <span className="col-span-4 text-right text-blue-600 dark:text-blue-400 font-mono text-xs">
                    ₹{previewTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Selected Terms Set guidelines if available */}
        {selectedProvider && selectedTermsSetId && (
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[3].borderGradient} ${CARD_THEMES[3].glowClass} transition-all`}>
            <div className="bg-slate-50/75 dark:bg-slate-950/30 rounded-[11px] p-3.5 flex flex-col gap-2 overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Terms & Custom printing instructions
            </span>
            {(() => {
              const matchedTermsSet = selectedProvider.termsSets.find((t) => t.id === selectedTermsSetId);
              if (!matchedTermsSet) return <span className="text-xs text-slate-450 italic">No rules chosen.</span>;
              return (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {matchedTermsSet.title}
                  </p>
                  {matchedTermsSet.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      {matchedTermsSet.description}
                    </p>
                  )}
                  {matchedTermsSet.rules && matchedTermsSet.rules.filter(r => r.trim()).length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {matchedTermsSet.rules.filter(r => r.trim()).map((rule, rIdx) => (
                        <div key={rIdx} className="text-[10px] text-slate-650 dark:text-slate-400 flex gap-1.5 leading-snug">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
