'use client';

import { useEffect, useState } from 'react';
import { useEMIFormStore } from '../../store/emiFormStore';
import { useNavigationStore } from '../../store/navigationStore';
import { getShopInfo, getProviders } from '../../lib/storage';
import { generateSchedule, calculateTotal } from '../../lib/emi';
import {
  generateClassicPDF,
  generateModernPDF,
  generateCompactPDF,
  generateElegantPDF,
  generateMinimalistPDF
} from '../../lib/pdf/generators';
import {
  ChevronLeft,
  Download,
  Printer,
  Share2,
  FileCheck,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';

const CARD_THEMES = [
  { borderGradient: 'bg-gradient-to-r from-purple-500 to-blue-500', glowClass: 'shadow-purple-blue-glow' },
  { borderGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500', glowClass: 'shadow-blue-cyan-glow' },
  { borderGradient: 'bg-gradient-to-r from-green-500 to-teal-500', glowClass: 'shadow-green-teal-glow' },
  { borderGradient: 'bg-gradient-to-r from-pink-500 to-purple-500', glowClass: 'shadow-pink-purple-glow' },
  { borderGradient: 'bg-gradient-to-r from-orange-500 to-yellow-500', glowClass: 'shadow-orange-yellow-glow' },
];

export default function PreviewView() {
  const { navigateTo } = useNavigationStore();
  const { formState, setFormState } = useEMIFormStore();

  const [shopInfo, setShopInfo] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [termsSet, setTermsSet] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [successToast, setSuccessToast] = useState('');

  const templates = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'compact', label: 'Compact' },
    { id: 'elegant', label: 'Elegant' },
    { id: 'minimalist', label: 'Minimalist' }
  ] as const;

  const handleTemplateChange = (tmpl: 'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist') => {
    if (formState && setFormState) {
      setFormState({
        ...formState,
        template: tmpl,
      });
    }
  };

  useEffect(() => {
    if (formState) {
      const shop = getShopInfo();
      setShopInfo(shop);

      const allProviders = getProviders();
      const prov = allProviders.find((p) => p.id === formState.providerId);
      setProvider(prov);

      if (prov) {
        const tSet = prov.termsSets.find((ts) => ts.id === formState.termsSetId);
        setTermsSet(tSet || null);
        
        const calculatedSchedule = generateSchedule(formState, prov);
        setSchedule(calculatedSchedule);

        const total = calculateTotal(
          formState.firstEmiAmount,
          formState.emiIncrement,
          formState.emiCount
        );
        setTotalAmount(total);
      }
    }
  }, [formState]);

  if (!formState || !provider) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 font-sans">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Active Preview Session</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            Please fill out the home screen EMI parameters form to calculate schedules and compile a printable schedule handout.
          </p>
        </div>
        <button
          onClick={() => navigateTo('home')}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg hover:cursor-pointer hover:shadow-xs transition-all"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  // Common PDF Builder router
  const buildPDFDoc = () => {
    const payload = {
      shopInfo,
      provider,
      termsSet,
      schedule,
      addTotal: formState.addTotal,
      totalAmount,
    };

    switch (formState.template) {
      case 'modern':
        return generateModernPDF(payload);
      case 'compact':
        return generateCompactPDF(payload);
      case 'elegant':
        return generateElegantPDF(payload);
      case 'minimalist':
        return generateMinimalistPDF(payload);
      case 'classic':
      default:
        return generateClassicPDF(payload);
    }
  };

  const handleDownload = () => {
    try {
      const doc = buildPDFDoc();
      doc.save(`EMI-Schedule-${provider.name.replace(/\s+/g, '-')}.pdf`);
      showToast('EMI Schedule PDF file downloaded successfully!');
    } catch {
      showToast('Failed to download PDF. Please try again.', true);
    }
  };

  const handlePrint = () => {
    try {
      // Safely clean up any previous print iframe to avoid duplicate DOM elements or active dialog crashes
      const oldIframe = document.getElementById('pdf-print-iframe');
      if (oldIframe) {
        document.body.removeChild(oldIframe);
      }

      const doc = buildPDFDoc();
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      const iframe = document.createElement('iframe');
      iframe.id = 'pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      // Trigger print after a short delay because onload doesn't fire for PDF sources in modern Chrome/Edge
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Safe deferred cleanup after 60 seconds (prevents early removal from closing Chrome's out-of-process print dialog)
        setTimeout(() => {
          try {
            if (iframe && iframe.parentNode) {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(blobUrl);
            }
          } catch {}
        }, 60000);
      }, 300);
    } catch {
      showToast('Failed to initialize print engine. Please try again.', true);
    }
  };

  const handleShare = async () => {
    try {
      const doc = buildPDFDoc();
      const pdfBlob = doc.output('blob');
      const file = new File(
        [pdfBlob],
        `EMI-Schedule-${provider.name.replace(/\s+/g, '-')}.pdf`,
        { type: 'application/pdf' }
      );

      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'EMI Payments Receipt Slip',
          text: `EMI payment schedule sheet generated via Easy EMI Manager for ${provider.name}.`,
        });
        showToast('Shared successfully!');
      } else {
        // Fallback if APIs are blocked or unsupported on desktop/mobile browsers
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const showToast = (msg: string, error = false) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans items-start w-full print:hidden no-print">
        {/* Left Column: Interactive Settings Control Panel (Only on screen, hidden on print) */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-5 w-full">
          {/* Back navigation & Top Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold hover:cursor-pointer p-0.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Edit Parameters
            </button>
            
            <div className="flex items-center gap-2">
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={handleShare}
                  className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg hover:cursor-pointer hover:text-blue-500 transition-colors"
                  title="Share slip as file attachment"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
  
              <button
                onClick={handlePrint}
                className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg hover:cursor-pointer hover:text-emerald-500 transition-colors"
                title="Print document slip"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
  
          {/* Action Callouts */}
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[0].borderGradient} ${CARD_THEMES[0].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-4 overflow-hidden">
              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-widest leading-none">
                  Handout Compiler
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  Actions Control
                </h3>
                <p className="text-xs text-slate-550 mt-0.5 leading-relaxed">
                  Export and hand over the formal calculated payment schedule checklist to the customer.
                </p>
              </div>
    
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:cursor-pointer hover:shadow-xs transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Handout PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:cursor-pointer transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Direct Standard Print
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 text-[10.5px] text-slate-550 dark:text-slate-400 leading-relaxed flex flex-col gap-0.5">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">ℹ️ Printing Tip</span>
                <span>Use <strong>Direct Standard Print</strong> (and choose "Save as PDF" if saving as a file) for perfect Bengali script shaping and layout quality.</span>
              </div>
              
              {successToast && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-905 px-3.5 py-2.5 rounded-lg text-xs font-bold text-emerald-705 dark:text-emerald-400 flex items-center gap-1.5 leading-none transition-all">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  {successToast}
                </div>
              )}
            </div>
          </div>
  
          {/* Template Style Switcher Widget */}
          <div className={`p-[1px] rounded-xl ${CARD_THEMES[1].borderGradient} ${CARD_THEMES[1].glowClass} transition-all`}>
            <div className="bg-white dark:bg-slate-900 rounded-[11px] p-5 flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center gap-1.5 pb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  PDF Template Settings
                </h4>
              </div>
    
              <div className="flex flex-col gap-1.5">
                {templates.map((tmpl) => {
                  const isActive = formState.template === tmpl.id;
                  
                  // Custom layout descriptions for extreme visual craftsmanship
                  const desc = tmpl.id === 'classic'
                    ? 'Traditional business style with structured margins.'
                    : tmpl.id === 'modern'
                    ? 'Sleek header with structured blue color highlights.'
                    : tmpl.id === 'compact'
                    ? 'POS-friendly ink-saver receipt slip style.'
                    : tmpl.id === 'elegant'
                    ? 'Deep blue royal accents with premium typography.'
                    : 'Barebones simple high-contrast clean ink blocks.';
    
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`text-left p-2.5 rounded-lg border hover:cursor-pointer transition-all flex flex-col gap-0.5 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 shadow-3xs'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span className={`text-xs font-black capitalize leading-none ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {tmpl.label}
                      </span>
                      <span className={`text-[10px] ${isActive ? 'text-blue-700/80 dark:text-slate-300' : 'text-slate-550 dark:text-slate-500'}`}>
                        {desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
  
        {/* Right Column: Virtual Handheld Sheet Preview */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-1.5 w-full">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Active Paper Preview ({templates.find((t) => t.id === formState.template)?.label || 'Classic'})
          </span>
          
          <div className={`p-[1px] rounded-2xl ${CARD_THEMES[2].borderGradient} ${CARD_THEMES[2].glowClass} transition-all`}>
            <div className="bg-slate-100 dark:bg-slate-950 p-6 md:p-8 rounded-[15px] max-h-[850px] overflow-y-auto shadow-inner w-full flex justify-center items-start">
            {/* Virtual Sheet */}
            <div className={`bg-white text-slate-900 p-6 shadow-sm rounded-lg max-w-[440px] mx-auto flex flex-col text-center border font-sans duration-200 ${
              formState.template === 'elegant' 
                ? 'border-t-[6px] border-t-[#273189] border-slate-205 flex flex-col gap-6' 
                : formState.template === 'minimalist' 
                ? 'border-slate-200 shadow-none flex flex-col gap-8 p-8' 
                : formState.template === 'compact'
                ? 'border-slate-100 flex flex-col gap-3 p-4'
                : formState.template === 'modern'
                ? 'border-t-4 border-t-blue-500 border-slate-200 flex flex-col gap-5'
                : 'border-slate-100 flex flex-col gap-6'
            }`}>
              {/* Centered Brand Header */}
              <div className={`flex flex-col items-center gap-1 pb-2 ${
                formState.template === 'minimalist'
                  ? 'border-b border-slate-900 pb-3'
                  : 'border-b border-slate-100'
              }`}>
                <h4 className={`leading-tight ${
                  formState.template === 'minimalist'
                    ? 'text-base font-medium tracking-widest uppercase text-slate-900'
                    : formState.template === 'elegant'
                    ? 'text-lg font-black tracking-tight text-[#273189]'
                    : formState.template === 'compact'
                    ? 'text-sm font-bold text-slate-800'
                    : 'text-lg font-black tracking-tight text-blue-600'
                }`}>
                  {shopInfo?.name || 'My Electronics Store'}
                </h4>
                {shopInfo?.phone && (
                  <p className={`${
                    formState.template === 'minimalist'
                      ? 'text-[10px] text-slate-600 font-mono tracking-wider'
                      : formState.template === 'elegant'
                      ? 'text-[10px] text-slate-600 font-medium'
                      : formState.template === 'compact'
                      ? 'text-[9px] text-slate-500'
                      : 'text-[11px] font-bold text-blue-500'
                  }`}>
                    Phone: {shopInfo.phone}
                  </p>
                )}
                {shopInfo?.address && (
                  <p className={`${
                    formState.template === 'minimalist'
                      ? 'text-[9px] text-slate-500 max-w-sm leading-relaxed mt-1'
                      : formState.template === 'elegant'
                      ? 'text-[9px] text-slate-500 max-w-sm font-medium'
                      : formState.template === 'compact'
                      ? 'text-[9px] text-slate-500 max-w-xs'
                      : 'text-[10px] font-bold text-blue-500 max-w-sm leading-snug'
                  }`}>
                    Address: {shopInfo.address}
                  </p>
                )}
              </div>
  
              {/* Virtual Table with dynamically computed header style matching screenshot & templates */}
              <div className={`flex flex-col overflow-hidden ${
                formState.template === 'minimalist'
                  ? 'border-0'
                  : 'rounded-lg border border-slate-200'
              }`}>
                {/* Header */}
                <div className={`grid grid-cols-12 text-[10px] font-extrabold uppercase text-left ${
                  formState.template === 'minimalist'
                    ? 'bg-white text-slate-900 border-t border-b border-slate-900 py-1.5 px-1 font-mono tracking-wider'
                    : formState.template === 'elegant'
                    ? 'bg-[#273189] text-white py-2 px-2'
                    : formState.template === 'compact'
                    ? 'bg-slate-700 text-white py-1 px-1.5 text-[9px]'
                    : 'bg-blue-500 text-white py-2 px-2'
                }`}>
                  <span className="col-span-3">Advanced Date</span>
                  <span className={`col-span-3 pl-2 ${
                    formState.template === 'minimalist'
                      ? 'border-0'
                      : formState.template === 'elegant'
                      ? 'border-l border-indigo-400'
                      : formState.template === 'compact'
                      ? 'border-l border-slate-600'
                      : 'border-l border-blue-400'
                  }`}>Online Date</span>
                  <span className={`col-span-3 pl-2 ${
                    formState.template === 'minimalist'
                      ? 'border-0'
                      : formState.template === 'elegant'
                      ? 'border-l border-indigo-400'
                      : formState.template === 'compact'
                      ? 'border-l border-slate-600'
                      : 'border-l border-blue-400'
                  }`}>EMI</span>
                  <span className={`col-span-3 pl-2 ${
                    formState.template === 'minimalist'
                      ? 'border-0'
                      : formState.template === 'elegant'
                      ? 'border-l border-indigo-400'
                      : formState.template === 'compact'
                      ? 'border-l border-slate-600'
                      : 'border-l border-blue-400'
                  }`}>Remark</span>
                </div>
  
                {/* Rows */}
                <div className="flex flex-col bg-white">
                  {schedule.map((row, rIdx) => (
                    <div
                      key={row.index}
                      className={`grid grid-cols-12 text-[10px] text-left text-slate-800 font-medium ${
                        formState.template === 'minimalist'
                          ? 'py-2 px-1 border-b border-slate-100 font-mono text-[9px]'
                          : formState.template === 'elegant'
                          ? `py-2 px-2 border-t border-slate-205 ${rIdx % 2 === 0 ? 'bg-[#f3f5fd]' : 'bg-white'}`
                          : formState.template === 'compact'
                          ? 'py-1 px-1.5 border-t border-slate-200 text-[9px]'
                          : 'py-2 px-2 border-t border-slate-200'
                      }`}
                    >
                      <span className="col-span-3 font-mono">{row.advanceDate}</span>
                      <span className={`col-span-3 pl-2 font-mono ${
                        formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                      }`}>{row.emiDate}</span>
                      <span className={`col-span-3 pl-2 font-mono font-bold ${
                        formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                      }`}>
                        Rs. {row.amount.toFixed(2)}
                      </span>
                      <span className={`col-span-3 pl-2 font-mono ${
                        formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                      }`}></span>
                    </div>
                  ))}
                </div>
  
                {/* Total Scheduled Row */}
                {formState.addTotal && (
                  <div className={`grid grid-cols-12 text-[10px] text-left font-bold ${
                    formState.template === 'minimalist'
                      ? 'bg-white border-t border-b-2 border-b-double border-b-slate-900 border-t-slate-900 py-1.5 px-1 font-mono'
                      : formState.template === 'elegant'
                      ? 'bg-[#ebeefd] text-[#273189] border-t border-slate-200 py-2 px-2'
                      : formState.template === 'compact'
                      ? 'bg-slate-50 text-slate-900 border-t border-slate-200 py-1.5 px-1.5 text-[9px]'
                      : 'bg-slate-50 text-slate-900 border-t border-slate-200 py-2.5 px-2'
                  }`}>
                    <span className="col-span-6 uppercase tracking-wider">Total Scheduled Amount</span>
                    <span className={`col-span-6 font-mono font-bold pl-2 ${
                      formState.template === 'minimalist'
                        ? 'border-0 text-slate-900'
                        : formState.template === 'elegant'
                        ? 'border-l border-slate-200 text-[#273189]'
                        : 'border-l border-slate-200 text-blue-600'
                    }`}>
                      Rs. {totalAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
  
              {/* Terms and conditions block with theme coordinates */}
              {termsSet && (
                <div className={`${
                  formState.template === 'minimalist'
                    ? 'border-0 border-t border-slate-900 pt-3 pb-1 text-left bg-white shadow-none mt-1'
                    : formState.template === 'elegant'
                    ? 'border border-slate-200 border-l-4 border-l-[#273189] rounded-xl p-4 text-left bg-[#f8f9fe] shadow-3xs'
                    : formState.template === 'compact'
                    ? 'border border-slate-200 rounded-lg p-3 text-left bg-white text-[9px]'
                    : 'border border-slate-200 rounded-xl p-4 text-left bg-white shadow-3xs'
                }`}>
                  <div className="mb-2">
                    <span className={`${
                      formState.template === 'minimalist'
                        ? 'text-[10px] font-bold text-slate-900 uppercase tracking-widest'
                        : formState.template === 'elegant'
                        ? 'text-[11px] font-extrabold text-[#273189] border-b border-[#273189] pb-0.5 inline-block'
                        : formState.template === 'compact'
                        ? 'text-[9.5px] font-extrabold text-slate-800'
                        : 'text-[11px] font-extrabold text-blue-600 border-b border-blue-500 pb-0.5 inline-block'
                    }`}>
                      {provider.name} {formState.template === 'minimalist' ? 'Terms & Conditions' : '(Terms & Conditions)'}
                    </span>
                  </div>
                  
                  {termsSet.description && (
                    <p className={`mb-2 leading-relaxed ${
                      formState.template === 'minimalist'
                        ? 'text-[8.5px] text-slate-500'
                        : formState.template === 'compact'
                        ? 'text-[8px] text-slate-500 italic'
                        : 'text-[9px] text-slate-500 italic'
                    }`}>{termsSet.description}</p>
                  )}
                  
                  <div className="flex flex-col gap-1.5">
                    {termsSet.rules.map((rule: string, rIdx: number) => {
                      if (!rule.trim()) return null;
                      return (
                        <p key={rIdx} className={`leading-relaxed flex gap-1.5 ${
                          formState.template === 'minimalist'
                            ? 'text-[8.5px] text-slate-700'
                            : formState.template === 'compact'
                            ? 'text-[8.5px] text-slate-700'
                            : 'text-[9px] text-slate-700'
                        }`}>
                          <span className="font-extrabold text-slate-900 shrink-0">
                            {formState.template === 'minimalist' ? '•' : `${rIdx + 1}.`}
                          </span>
                          <span>{rule}</span>
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
  
              {/* Signature box and bottom markup */}
              <div className="flex justify-end mt-2">
                <div className="flex flex-col gap-1 items-end text-right">
                  <span className={`font-extrabold ${
                    formState.template === 'minimalist'
                      ? 'text-[8.5px] text-slate-900 font-mono tracking-wider'
                      : formState.template === 'compact'
                      ? 'text-[8.5px] text-slate-500'
                      : 'text-[10px] text-slate-600'
                  }`}>
                    Customer Signature: _____________________
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only container (hidden on screen, visible on print) */}
      <div className="hidden print:block print:w-full print:max-w-none print:p-0 print:m-0 bg-white text-slate-900 font-sans">
        <div className={`mx-auto flex flex-col text-center duration-200 ${
          formState.template === 'elegant' 
            ? 'border-t-[10px] border-t-[#273189] flex flex-col gap-8 p-10 max-w-[720px]' 
            : formState.template === 'minimalist' 
            ? 'flex flex-col p-12 gap-10 max-w-[720px]' 
            : formState.template === 'compact'
            ? 'border border-slate-200 flex flex-col gap-5 p-6 max-w-[520px]'
            : formState.template === 'modern'
            ? 'border-t-[6px] border-t-blue-500 border border-slate-200 flex flex-col gap-8 p-10 max-w-[700px]'
            : 'border border-slate-200 flex flex-col p-10 gap-8 max-w-[700px]'
        }`}>
          {/* Centered Brand Header */}
          <div className={`flex flex-col items-center gap-1.5 pb-4 ${
            formState.template === 'minimalist'
              ? 'border-b-2 border-slate-900 pb-4'
              : 'border-b border-slate-100'
          }`}>
            <h4 className={`leading-tight ${
              formState.template === 'minimalist'
                ? 'text-xl font-semibold tracking-widest uppercase text-slate-900'
                : formState.template === 'elegant'
                ? 'text-2xl font-black tracking-tight text-[#273189]'
                : formState.template === 'compact'
                ? 'text-base font-bold text-slate-800'
                : 'text-2xl font-black tracking-tight text-blue-600'
            }`}>
              {shopInfo?.name || 'My Electronics Store'}
            </h4>
            {shopInfo?.phone && (
              <p className={`${
                formState.template === 'minimalist'
                  ? 'text-xs text-slate-600 font-mono tracking-wider'
                  : formState.template === 'elegant'
                  ? 'text-xs text-slate-600 font-medium'
                  : formState.template === 'compact'
                  ? 'text-[11px] text-slate-500'
                  : 'text-xs font-bold text-blue-500'
              }`}>
                Phone: {shopInfo.phone}
              </p>
            )}
            {shopInfo?.address && (
              <p className={`${
                formState.template === 'minimalist'
                  ? 'text-xs text-slate-500 max-w-lg leading-relaxed mt-1'
                  : formState.template === 'elegant'
                  ? 'text-xs text-slate-550 max-w-lg font-medium'
                  : formState.template === 'compact'
                  ? 'text-[11px] text-slate-500 max-w-sm'
                  : 'text-xs font-bold text-blue-500 max-w-lg leading-snug'
              }`}>
                Address: {shopInfo.address}
              </p>
            )}
          </div>

          {/* Virtual Table */}
          <div className={`flex flex-col overflow-hidden ${
            formState.template === 'minimalist'
              ? 'border-0'
              : 'rounded-lg border border-slate-200'
          }`}>
            {/* Header */}
            <div className={`grid grid-cols-12 text-xs font-extrabold uppercase text-left ${
              formState.template === 'minimalist'
                ? 'bg-white text-slate-900 border-t-2 border-b-2 border-slate-900 py-2.5 px-1 font-mono tracking-wider'
                : formState.template === 'elegant'
                ? 'bg-[#273189] text-white py-3 px-3'
                : formState.template === 'compact'
                ? 'bg-slate-700 text-white py-2 px-2 text-[11px]'
                : 'bg-blue-500 text-white py-3 px-3'
            }`}>
              <span className="col-span-3">Advanced Date</span>
              <span className={`col-span-3 pl-2.5 ${
                formState.template === 'minimalist'
                  ? 'border-0'
                  : formState.template === 'elegant'
                  ? 'border-l border-indigo-400'
                  : formState.template === 'compact'
                  ? 'border-l border-slate-600'
                  : 'border-l border-blue-400'
              }`}>Online Date</span>
              <span className={`col-span-3 pl-2.5 ${
                formState.template === 'minimalist'
                  ? 'border-0'
                  : formState.template === 'elegant'
                  ? 'border-l border-indigo-400'
                  : formState.template === 'compact'
                  ? 'border-l border-slate-600'
                  : 'border-l border-blue-400'
              }`}>EMI</span>
              <span className={`col-span-3 pl-2.5 ${
                formState.template === 'minimalist'
                  ? 'border-0'
                  : formState.template === 'elegant'
                  ? 'border-l border-indigo-400'
                  : formState.template === 'compact'
                  ? 'border-l border-slate-600'
                  : 'border-l border-blue-400'
              }`}>Remark</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col bg-white">
              {schedule.map((row, rIdx) => (
                <div
                  key={row.index}
                  className={`grid grid-cols-12 text-xs text-left text-slate-800 font-medium ${
                    formState.template === 'minimalist'
                      ? 'py-2.5 px-1 border-b border-slate-100 font-mono text-[11px]'
                      : formState.template === 'elegant'
                      ? `py-2.5 px-3 border-t border-slate-205 ${rIdx % 2 === 0 ? 'bg-[#f3f5fd]' : 'bg-white'}`
                      : formState.template === 'compact'
                      ? 'py-2 px-2 border-t border-slate-200 text-[11px]'
                      : 'py-2.5 px-3 border-t border-slate-200'
                  }`}
                >
                  <span className="col-span-3 font-mono">{row.advanceDate}</span>
                  <span className={`col-span-3 pl-2.5 font-mono ${
                    formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                  }`}>{row.emiDate}</span>
                  <span className={`col-span-3 pl-2.5 font-mono font-bold ${
                    formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                  }`}>
                    Rs. {row.amount.toFixed(2)}
                  </span>
                  <span className={`col-span-3 pl-2.5 font-mono ${
                    formState.template === 'minimalist' ? 'border-0' : 'border-l border-slate-200'
                  }`}></span>
                </div>
              ))}
            </div>

            {/* Total Scheduled Row */}
            {formState.addTotal && (
              <div className={`grid grid-cols-12 text-xs text-left font-bold ${
                formState.template === 'minimalist'
                  ? 'bg-white border-t-2 border-b-4 border-b-double border-b-slate-900 border-t-slate-900 py-2.5 px-1 font-mono'
                  : formState.template === 'elegant'
                  ? 'bg-[#ebeefd] text-[#273189] border-t border-slate-200 py-3 px-3'
                  : formState.template === 'compact'
                  ? 'bg-slate-50 text-slate-900 border-t border-slate-200 py-2.5 px-2 text-[11px]'
                  : 'bg-slate-50 text-slate-900 border-t border-slate-200 py-3 px-3'
              }`}>
                <span className="col-span-6 uppercase tracking-wider">Total Scheduled Amount</span>
                <span className={`col-span-6 font-mono font-bold pl-2.5 ${
                  formState.template === 'minimalist'
                    ? 'border-0 text-slate-900'
                    : formState.template === 'elegant'
                    ? 'border-l border-slate-200 text-[#273189]'
                    : 'border-l border-slate-200 text-blue-600'
                }`}>
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Terms and conditions block */}
          {termsSet && (
            <div className={`${
              formState.template === 'minimalist'
                ? 'border-0 border-t-2 border-slate-900 pt-4 pb-1 text-left bg-white shadow-none mt-2'
                : formState.template === 'elegant'
                ? 'border border-slate-200 border-l-[5px] border-l-[#273189] rounded-xl p-5 text-left bg-[#f8f9fe]'
                : formState.template === 'compact'
                ? 'border border-slate-200 rounded-lg p-4 text-left bg-white text-[10.5px]'
                : 'border border-slate-200 rounded-xl p-5 text-left bg-white'
            }`}>
              <div className="mb-2.5">
                <span className={`${
                  formState.template === 'minimalist'
                    ? 'text-xs font-bold text-slate-900 uppercase tracking-widest'
                    : formState.template === 'elegant'
                    ? 'text-xs font-extrabold text-[#273189] border-b border-[#273189] pb-0.5 inline-block'
                    : formState.template === 'compact'
                    ? 'text-[11px] font-extrabold text-slate-800'
                    : 'text-xs font-extrabold text-blue-600 border-b border-blue-500 pb-0.5 inline-block'
                }`}>
                  {provider.name} {formState.template === 'minimalist' ? 'Terms & Conditions' : '(Terms & Conditions)'}
                </span>
              </div>
              
              {termsSet.description && (
                <p className={`mb-3 leading-relaxed ${
                  formState.template === 'minimalist'
                    ? 'text-[10px] text-slate-500'
                    : formState.template === 'compact'
                    ? 'text-[9.5px] text-slate-500 italic'
                    : 'text-[10.5px] text-slate-500 italic'
                }`}>{termsSet.description}</p>
              )}
              
              <div className="flex flex-col gap-2">
                {termsSet.rules.map((rule: string, rIdx: number) => {
                  if (!rule.trim()) return null;
                  return (
                    <p key={rIdx} className={`leading-relaxed flex gap-2 ${
                      formState.template === 'minimalist'
                        ? 'text-[10px] text-slate-700'
                        : formState.template === 'compact'
                        ? 'text-[10px] text-slate-700'
                        : 'text-[10.5px] text-slate-700'
                    }`}>
                      <span className="font-extrabold text-slate-900 shrink-0">
                        {formState.template === 'minimalist' ? '•' : `${rIdx + 1}.`}
                      </span>
                      <span>{rule}</span>
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signature box */}
          <div className="flex justify-end mt-4">
            <div className="flex flex-col gap-1 items-end text-right">
              <span className={`font-extrabold ${
                formState.template === 'minimalist'
                  ? 'text-[10px] text-slate-900 font-mono tracking-wider'
                  : formState.template === 'compact'
                  ? 'text-[10px] text-slate-500'
                  : 'text-xs text-slate-600'
              }`}>
                Customer Signature: _____________________
              </span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
