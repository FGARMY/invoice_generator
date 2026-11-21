'use client';

import { useEffect, useState } from 'react';
import InvoiceForm from '@/components/editor/InvoiceForm';
import InvoicePreview from '@/components/preview/InvoicePreview';
import ThemePicker from '@/components/ui/ThemePicker';
import ColorPicker from '@/components/ui/ColorPicker';
import { useInvoiceStore } from '@/store/invoiceStore';
import { loadBusinessInfo, loadPaymentInfo } from '@/lib/storage';

export default function Home() {
  const loadFromDraft = useInvoiceStore((s) => s.loadFromDraft);
  const updateBusiness = useInvoiceStore((s) => s.updateBusiness);
  const updatePaymentDetails = useInvoiceStore((s) => s.updatePaymentDetails);
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice);
  const appTheme = useInvoiceStore((s) => s.appTheme);
  const setAppTheme = useInvoiceStore((s) => s.setAppTheme);
  const toggleAppTheme = useInvoiceStore((s) => s.toggleAppTheme);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize UI theme preference (Default: 'light' white theme)
    try {
      const savedTheme = localStorage.getItem('invoice_app_theme') as 'light' | 'dark' | null;
      const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
      setAppTheme(initialTheme);
    } catch {}

    // Load draft on mount
    const loaded = loadFromDraft();

    // If no draft, try to load saved business & payment info
    if (!loaded) {
      const savedBusiness = loadBusinessInfo();
      if (savedBusiness) {
        updateBusiness(savedBusiness);
      }
      const savedPayment = loadPaymentInfo();
      if (savedPayment) {
        updatePaymentDetails(savedPayment);
      }
    }

    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading Invoice Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 print:hidden z-40 flex-shrink-0 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent truncate">
              Invoice Generator
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">Create professional invoices in seconds</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleAppTheme}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title={appTheme === 'dark' ? 'Switch to White (Light) Theme' : 'Switch to Dark Theme'}
          >
            {appTheme === 'dark' ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Settings Toggle (Theme/Color) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showSettings
                ? 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </header>

      {/* Settings Panel (Theme + Color) */}
      {showSettings && (
        <div className="px-4 lg:px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 print:hidden z-30 max-h-[60vh] overflow-y-auto transition-colors">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* App UI Theme Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                App Interface Theme
              </h3>
              <div className="grid grid-cols-2 sm:w-80 gap-2">
                <button
                  type="button"
                  onClick={() => setAppTheme('light')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    appTheme === 'light'
                      ? 'bg-blue-50 text-blue-700 border-blue-400 ring-2 ring-blue-400/20 font-semibold'
                      : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>White (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAppTheme('dark')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    appTheme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500 ring-2 ring-blue-500/20 font-semibold'
                      : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200 dark:border-slate-800">
              <ThemePicker />
              <ColorPicker />
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Split Screen on Desktop, Full-Pane on Mobile */}
      <main className="flex-1 flex overflow-hidden print:block relative">
        {/* Form Panel */}
        <div
          className={`w-full lg:w-[42%] xl:w-[38%] overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-6 print:hidden transition-colors ${
            mobileView !== 'form' ? 'hidden lg:block' : ''
          }`}
        >
          <InvoiceForm />
        </div>

        {/* Preview Panel */}
        <div
          className={`w-full lg:w-[58%] xl:w-[62%] overflow-hidden flex flex-col bg-slate-100/70 dark:bg-slate-900/30 pb-16 lg:pb-0 transition-colors ${
            mobileView !== 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <InvoicePreview />
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around print:hidden transition-colors">
        <button
          onClick={() => setMobileView('form')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            mobileView === 'form'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-[11px]">Edit Invoice</span>
        </button>

        <button
          onClick={() => setMobileView('preview')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            mobileView === 'preview'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-[11px]">Preview A4</span>
        </button>
      </nav>

      {/* Autosave Indicator */}
      <div className="absolute bottom-16 lg:bottom-4 left-3 lg:left-4 print:hidden pointer-events-none z-30">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm rounded-full border border-slate-700/60 shadow-lg">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-400">Auto-saving</span>
        </div>
      </div>
    </div>
  );
}
