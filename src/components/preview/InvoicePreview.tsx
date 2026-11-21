'use client';

import { useCallback, useState, useEffect } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { exportToPDF } from '@/lib/pdfExport';
import { useElementSize } from '@/hooks/useElementSize';
import MinimalMono from './themes/MinimalMono';
import CorporateBlue from './themes/CorporateBlue';
import BoldModern from './themes/BoldModern';

const themeComponents = {
  'minimal-mono': MinimalMono,
  'corporate-blue': CorporateBlue,
  'bold-modern': BoldModern,
};

export default function InvoicePreview() {
  const theme = useInvoiceStore((s) => s.theme);
  const invoiceNumber = useInvoiceStore((s) => s.invoiceNumber);
  const isExporting = useInvoiceStore((s) => s.isExporting);
  const setIsExporting = useInvoiceStore((s) => s.setIsExporting);
  const client = useInvoiceStore((s) => s.client);
  const lineItems = useInvoiceStore((s) => s.lineItems);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mobileZoomMode, setMobileZoomMode] = useState<'fit' | 'fill'>('fit');
  const [canShare, setCanShare] = useState(false);

  // Check Web Share API support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'share' in navigator) {
      setCanShare(true);
    }
  }, []);

  // Responsive scaling logic
  const [containerRef, { width: containerWidth }] = useElementSize();
  const A4_WIDTH_PX = 794; // 210mm at 96dpi
  const padding = 24;
  const autoScale = containerWidth > 0 ? Math.min(1, (containerWidth - padding) / A4_WIDTH_PX) : 1;
  const scale = mobileZoomMode === 'fill' ? Math.max(autoScale, 0.95) : autoScale;

  const [contentRef, { height: contentHeight }] = useElementSize();
  
  const ThemeComponent = themeComponents[theme] || MinimalMono;

  const validate = useCallback((): boolean => {
    if (!client.name.trim()) {
      setValidationError('Please enter a client name before exporting.');
      setTimeout(() => setValidationError(null), 4000);
      return false;
    }
    const hasValidItem = lineItems.some(
      (item) => item.description.trim() && item.quantity > 0 && item.unitPrice > 0
    );
    if (!hasValidItem) {
      setValidationError('Please add at least one line item with description, quantity, and price.');
      setTimeout(() => setValidationError(null), 4000);
      return false;
    }
    return true;
  }, [client, lineItems]);

  const handleExport = useCallback(async () => {
    if (!validate()) return;

    setIsExporting(true);
    try {
      let safeName = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
      if (!safeName) safeName = 'invoice';
      const filename = `${safeName}.pdf`;
      await exportToPDF('invoice-preview-content', filename);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setValidationError(`PDF export failed: ${err?.message || err}`);
      setTimeout(() => setValidationError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  }, [invoiceNumber, validate, setIsExporting]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    if (!validate()) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice #${invoiceNumber}`,
          text: `Invoice #${invoiceNumber} for ${client.name}`,
          url: window.location.href,
        });
      }
    } catch {
      // User cancelled share or not supported
    }
  }, [validate, invoiceNumber, client]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-slate-900/90 border-b border-slate-800 print:hidden flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-300">Preview</h2>
          {/* Mobile Zoom Mode Toggle */}
          <button
            type="button"
            onClick={() => setMobileZoomMode(mobileZoomMode === 'fit' ? 'fill' : 'fit')}
            className="sm:hidden px-2 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700"
          >
            {mobileZoomMode === 'fit' ? 'Zoom 100%' : 'Fit Page'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {canShare && (
            <button
              onClick={handleShare}
              className="touch-target sm:hidden p-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
              title="Share invoice link"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="touch-target flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-wait text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            {isExporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg print:hidden">
          {validationError}
        </div>
      )}

      {/* Preview Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-800/30 p-4 sm:p-6 print:p-0 print:bg-white flex justify-center"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            // Reserve height based on scale to prevent layout collapse
            height: contentHeight > 0 ? contentHeight * scale : `${297 * scale}mm`,
            marginBottom: contentHeight > 0 ? (1 - scale) * -contentHeight : `${(1 - scale) * -297}mm`
          }}
          className="print:transform-none print:h-auto print:mb-0"
        >
          <div
            ref={contentRef}
            id="invoice-preview-content"
            className="mx-auto print:shadow-none bg-white flex flex-col"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              width: '210mm',
              minHeight: '297mm',
            }}
          >
            <ThemeComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

