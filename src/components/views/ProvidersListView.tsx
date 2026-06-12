'use client';

import { useState, useEffect } from 'react';
import { Provider } from '../../lib/types';
import { getProviders, deleteProvider, addProvider } from '../../lib/storage';
import { useNavigationStore } from '../../store/navigationStore';
import { Plus, Edit3, Trash2, Calendar, ClipboardCheck, ChevronRight, AlertCircle } from 'lucide-react';

const CARD_THEMES = [
  { borderGradient: 'bg-gradient-to-r from-purple-500 to-blue-500', glowClass: 'shadow-purple-blue-glow' },
  { borderGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', glowClass: 'shadow-blue-cyan-glow' },
  { borderGradient: 'bg-gradient-to-r from-green-500 to-teal-500', glowClass: 'shadow-green-teal-glow' },
  { borderGradient: 'bg-gradient-to-r from-pink-500 to-purple-500', glowClass: 'shadow-pink-purple-glow' },
  { borderGradient: 'bg-gradient-to-r from-orange-500 to-yellow-500', glowClass: 'shadow-orange-yellow-glow' },
];

export default function ProvidersListView() {
  const { navigateTo } = useNavigationStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setProviders(getProviders());
  }, []);

  const handleDelete = (id: string) => {
    deleteProvider(id);
    setProviders(getProviders());
    setDeleteConfirmId(null);
  };

  const handleAddNew = () => {
    // Generate a default empty provider setup and route directly to its creator profile
    const newId = crypto.randomUUID();
    navigateTo('provider-detail', { id: newId, mode: 'create' });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Finance Partners</h2>
          <p className="text-xs text-slate-550">Configure EMI schemes and terms parameters.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 hover:cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">No finance partners yet</h3>
            <p className="text-xs text-slate-550 max-w-[280px] mx-auto mt-1 leading-relaxed">
              Add finance providers (e.g., Bajaj Finserv, TVS Finance) to define default EMI rates and printing rules.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="mt-2 px-4 py-2 border border-blue-600 font-semibold text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-lg hover:cursor-pointer transition-all"
          >
            Create First Provider
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            return (
              <div
                key={provider.id}
                className={`p-[1px] rounded-xl ${theme.borderGradient} ${theme.glowClass} transition-all`}
              >
                <div className="bg-white dark:bg-slate-900 rounded-[11px] overflow-hidden flex flex-col h-full">
                  <div className="p-4 flex justify-between items-start">
                    <button
                      onClick={() => navigateTo('provider-detail', { id: provider.id })}
                      className="flex-1 text-left flex flex-col gap-1 hover:cursor-pointer group mr-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {provider.name}
                        </h3>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                      </div>
                      {provider.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{provider.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {provider.advanceDays} Advance Days
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="bg-slate-100 dark:bg-slate-800 font-mono px-1.5 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                          ₹{provider.emiIncrement || 0} Increment
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => navigateTo('provider-detail', { id: provider.id })}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg hover:cursor-pointer transition-colors"
                        title="Edit provider configurations"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(provider.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg hover:cursor-pointer transition-colors"
                        title="Delete provider definition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Terms Badge Preview panel */}
                  {provider.termsSets && provider.termsSets.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 px-4 py-2 border-t border-slate-100 dark:border-slate-800/40 flex flex-wrap gap-1.5 mt-auto">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 mt-0.5">
                        Terms sets ({provider.termsSets.length}):
                      </span>
                      {provider.termsSets.map((ts) => (
                        <span
                          key={ts.id}
                          className="inline-flex items-center bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-850 font-semibold px-2 py-0.5 rounded-full text-[9px]"
                        >
                          {ts.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Double Confirm Modal backdrop/bar */}
                  {deleteConfirmId === provider.id && (
                    <div className="bg-red-50 dark:bg-red-950/30 border-t border-red-100 dark:border-red-900/40 p-3.5 flex justify-between items-center gap-3 mt-auto">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span className="text-xs font-semibold">Delete partner permanently?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-650 hover:bg-red-700 rounded-md hover:cursor-pointer"
                        >
                          Confirm Delete
                        </button>
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
  );
}
