'use client';

import { useState, useEffect } from 'react';
import { Provider, TermsSet } from '../../lib/types';
import { getProviders, updateProvider, addProvider } from '../../lib/storage';
import { useNavigationStore } from '../../store/navigationStore';
import { ChevronLeft, Save, Plus, Trash2, HelpCircle, FileText, PlusCircle, AlertCircle } from 'lucide-react';

const CARD_THEMES = [
  { borderGradient: 'bg-gradient-to-r from-purple-500 to-blue-500', glowClass: 'shadow-purple-blue-glow' },
  { borderGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', glowClass: 'shadow-blue-cyan-glow' },
  { borderGradient: 'bg-gradient-to-r from-green-500 to-teal-500', glowClass: 'shadow-green-teal-glow' },
  { borderGradient: 'bg-gradient-to-r from-pink-500 to-purple-500', glowClass: 'shadow-pink-purple-glow' },
  { borderGradient: 'bg-gradient-to-r from-orange-500 to-yellow-500', glowClass: 'shadow-orange-yellow-glow' },
];

export default function ProviderDetailView() {
  const { currentView, navigateTo } = useNavigationStore();
  const providerId = currentView.params?.id || '';
  const isCreateMode = currentView.params?.mode === 'create';

  const [providerName, setProviderName] = useState('');
  const [providerDesc, setProviderDesc] = useState('');
  const [advanceDays, setAdvanceDays] = useState(5);
  const [regularEmi, setRegularEmi] = useState('');
  const [termsSets, setTermsSets] = useState<TermsSet[]>([]);
  const [error, setError] = useState('');
  const [expandedSetIndex, setExpandedSetIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!isCreateMode && providerId) {
      const match = getProviders().find((p) => p.id === providerId);
      if (match) {
        setProviderName(match.name);
        setProviderDesc(match.description || '');
        setAdvanceDays(match.advanceDays);
        setRegularEmi(String(match.emiIncrement));
        setTermsSets(match.termsSets || []);
      }
    }
  }, [providerId, isCreateMode]);

  const handleSave = () => {
    if (!providerName.trim()) {
      setError('Provider Name is required.');
      return;
    }
    setError('');

    const payload: Provider = {
      id: isCreateMode ? providerId : providerId,
      name: providerName.trim(),
      description: providerDesc.trim() || undefined,
      advanceDays: Number(advanceDays) || 0,
      emiIncrement: Number(regularEmi) || 0,
      termsSets: termsSets,
    };

    if (isCreateMode) {
      addProvider(payload);
    } else {
      updateProvider(providerId, payload);
    }

    navigateTo('providers');
  };

  // Add a terms set row
  const handleAddTermsSet = () => {
    if (termsSets.length >= 5) return; // Enforce Max 5 terms sets restriction
    const newSet: TermsSet = {
      id: crypto.randomUUID(),
      title: `Terms Option ${termsSets.length + 1}`,
      description: '',
      rules: [''], // Starts with one empty rule row
    };
    setTermsSets([...termsSets, newSet]);
    setExpandedSetIndex(termsSets.length); // Expand the newly added set
  };

  const handleRemoveTermsSet = (index: number) => {
    const updated = termsSets.filter((_, idx) => idx !== index);
    setTermsSets(updated);
    if (expandedSetIndex === index) {
      setExpandedSetIndex(updated.length > 0 ? 0 : null);
    } else if (expandedSetIndex !== null && expandedSetIndex > index) {
      setExpandedSetIndex(expandedSetIndex - 1);
    }
  };

  const handleTermsSetChange = (index: number, fields: Partial<TermsSet>) => {
    const updated = termsSets.map((ts, idx) => (idx === index ? { ...ts, ...fields } : ts));
    setTermsSets(updated);
  };

  const handleAddRuleRow = (setIndex: number) => {
    const targetSet = termsSets[setIndex];
    if (targetSet.rules.length >= 5) return; // Enforce Max 5 rules per set
    const updatedRules = [...targetSet.rules, ''];
    handleTermsSetChange(setIndex, { rules: updatedRules });
  };

  const handleRemoveRuleRow = (setIndex: number, ruleIndex: number) => {
    const targetSet = termsSets[setIndex];
    const updatedRules = targetSet.rules.filter((_, rIdx) => rIdx !== ruleIndex);
    handleTermsSetChange(setIndex, { rules: updatedRules });
  };

  const handleRuleTextChange = (setIndex: number, ruleIndex: number, text: string) => {
    const targetSet = termsSets[setIndex];
    const updatedRules = targetSet.rules.map((r, rIdx) => (rIdx === ruleIndex ? text : r));
    handleTermsSetChange(setIndex, { rules: updatedRules });
  };

  return (
    <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('providers')}
          className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-800 dark:hover:text-slate-200 font-bold hover:cursor-pointer p-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back List
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 hover:cursor-pointer transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Partner
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isCreateMode ? 'Create Finance Partner' : 'Configure Partner'}
        </h2>
        <p className="text-xs text-slate-550">Modify default credentials, billing parameters, and pre-written T&C clauses.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 rounded-lg flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Two-Column Grid for Desktop view enhancement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Core partner details */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[0].borderGradient} ${CARD_THEMES[0].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Partner name *</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. Bajaj Finserv"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Short internal description (Optional)</label>
                <input
                  type="text"
                  value={providerDesc}
                  onChange={(e) => setProviderDesc(e.target.value)}
                  placeholder="e.g. Used for high-value mobile finance customers"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Advance Days</label>
                    <div className="group relative">
                      <HelpCircle className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350" />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block transition-all w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg text-center font-normal z-50">
                        Number of days before the EMI due date when automatic advance collection schedules trigger.
                      </span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={advanceDays}
                    onChange={(e) => setAdvanceDays(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="5"
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Default EMI Increment (₹)</label>
                  <input
                    type="number"
                    value={regularEmi}
                    onChange={(e) => setRegularEmi(e.target.value)}
                    placeholder="300"
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-mono-nums"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Terms Sets management */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Terms & Conditions Sets</h3>
                <p className="text-[11px] text-slate-450">Build up to 5 customized T&C sets with up to 5 rules each.</p>
              </div>
              {termsSets.length < 5 && (
                <button
                  onClick={handleAddTermsSet}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-blue-600 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:cursor-pointer transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Set
                </button>
              )}
            </div>

            {termsSets.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
                No terms sets added. Tap "Add Set" to assign custom printable rules.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {termsSets.map((ts, index) => {
                  const isExpanded = expandedSetIndex === index;
                  const theme = CARD_THEMES[(index + 1) % CARD_THEMES.length];
                  return (
                    <div
                      key={ts.id}
                      className={`p-[1px] rounded-xl ${theme.borderGradient} ${theme.glowClass} transition-all`}
                    >
                      <div className="bg-white dark:bg-slate-900 rounded-[11px] overflow-hidden flex flex-col h-full">
                        {/* Header of single Set (clickable for accordion toggle) */}
                        <div
                          onClick={() => setExpandedSetIndex(isExpanded ? null : index)}
                          className={`bg-slate-50 dark:bg-slate-950 px-4 py-3 flex items-center justify-between hover:cursor-pointer transition-colors ${
                            isExpanded ? 'border-b border-slate-150 dark:border-slate-800' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={ts.title}
                              onChange={(e) => handleTermsSetChange(index, { title: e.target.value })}
                              placeholder="e.g. Standard Rules"
                              className="text-xs font-bold text-gray-800 dark:text-white bg-transparent focus:outline-hidden border-b border-transparent focus:border-slate-400 w-full placeholder-gray-400 dark:placeholder-gray-500"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRemoveTermsSet(index)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:cursor-pointer"
                              title="Remove Terms set"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            
                            {/* Visual indicator (chevron / arrow) */}
                            <svg
                              className={`h-4 w-4 text-slate-400 transition-transform duration-200 hover:cursor-pointer`}
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              onClick={() => setExpandedSetIndex(isExpanded ? null : index)}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Set Body fields */}
                        {isExpanded && (
                          <div className="p-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Set Intro / Description</label>
                              <textarea
                                value={ts.description}
                                onChange={(e) => handleTermsSetChange(index, { description: e.target.value })}
                                placeholder="e.g. Customer agrees to declare all billing items and clear dues according to the guidelines: "
                                rows={2}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                              />
                            </div>

                            {/* Rules list */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rules List ({ts.rules.length}/5)</label>
                                {ts.rules.length < 5 && (
                                  <button
                                    onClick={() => handleAddRuleRow(index)}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:cursor-pointer"
                                  >
                                    + Add Rule Row
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                {ts.rules.map((rule, ruleIdx) => (
                                  <div key={ruleIdx} className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-mono font-bold text-slate-400 w-4 shrink-0 text-center">
                                      {ruleIdx + 1}.
                                    </span>
                                    <input
                                      type="text"
                                      value={rule}
                                      onChange={(e) => handleRuleTextChange(index, ruleIdx, e.target.value)}
                                      placeholder="e.g. Aadhaar copy is mandatory"
                                      className="px-3 py-1 text-xs rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 flex-1"
                                    />
                                    <button
                                      onClick={() => handleRemoveRuleRow(index, ruleIdx)}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:cursor-pointer"
                                      title="Remove Rule row"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-2" />
    </div>
  );
}
