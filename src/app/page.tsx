'use client';

import { useEffect, useState } from 'react';
import InvoiceForm from '@/components/editor/InvoiceForm';
import InvoicePreview from '@/components/preview/InvoicePreview';
import ThemePicker from '@/components/ui/ThemePicker';
import ColorPicker from '@/components/ui/ColorPicker';
import { useInvoiceStore } from '@/store/invoiceStore';
import { loadBusinessInfo } from '@/lib/storage';

export default function Home() {
  const loadFromDraft = useInvoiceStore((s) => s.loadFromDraft);
  const updateBusiness = useInvoiceStore((s) => s.updateBusiness);
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load draft on mount
    const loaded = loadFromDraft();

    // If no draft, try to load saved business info
    if (!loaded) {
      const savedBusiness = loadBusinessInfo();
      if (savedBusiness) {
        updateBusiness(savedBusiness);
      }
    }

    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Invoice Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 print:hidden z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Invoice Generator
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">Create professional invoices in seconds</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Toggle (Theme/Color) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showSettings
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* New Invoice */}
          <button
            onClick={() => {
              if (confirm('Start a new invoice? Current draft will be saved.')) {
                resetInvoice();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Invoice</span>
          </button>

          {/* Mobile View Toggle */}
          <div className="flex lg:hidden bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setMobileView('form')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mobileView === 'form'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mobileView === 'preview'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel (Theme + Color) */}
      {showSettings && (
        <div className="px-4 lg:px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 print:hidden">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemePicker />
            <ColorPicker />
          </div>
        </div>
      )}

      {/* Main Content: Split Screen */}
      <main className="flex-1 flex overflow-hidden print:block">
        {/* Form Panel */}
        <div
          className={`w-full lg:w-[42%] xl:w-[38%] overflow-y-auto border-r border-slate-800 bg-slate-950 print:hidden ${
            mobileView !== 'form' ? 'hidden lg:block' : ''
          }`}
        >
          <InvoiceForm />
        </div>

        {/* Preview Panel */}
        <div
          className={`w-full lg:w-[58%] xl:w-[62%] overflow-hidden flex flex-col bg-slate-900/30 ${
            mobileView !== 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <InvoicePreview />
        </div>
      </main>

      {/* Autosave Indicator */}
      <div className="absolute bottom-4 left-4 print:hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700/50">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-500">Auto-saving</span>
        </div>
      </div>
    </div>
  );
}
