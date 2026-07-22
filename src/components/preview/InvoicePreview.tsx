'use client';

import { useCallback, useState } from 'react';
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
  
  // Responsive scaling logic
  const [containerRef, { width: containerWidth }] = useElementSize();
  const A4_WIDTH_PX = 794; // 210mm at 96dpi
  const padding = 32; // 16px padding on each side
  const scale = containerWidth > 0 ? Math.min(1, (containerWidth - padding) / A4_WIDTH_PX) : 1;

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

  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 print:hidden">
        <h2 className="text-sm font-semibold text-slate-300">Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-wait text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            {isExporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
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
            height: `${297 * scale}mm`,
            marginBottom: `${(1 - scale) * -297}mm`
          }}
          className="print:transform-none print:h-auto print:mb-0"
        >
          <div
            id="invoice-preview-content"
            className="mx-auto print:shadow-none bg-white"
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
