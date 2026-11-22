'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function InvoiceMeta() {
  const {
    documentTitle,
    invoiceNumber,
    invoiceDate,
    dueDate,
    status,
    currency,
    invoicePrefix,
    setDocumentTitle,
    setInvoiceNumber,
    setInvoicePrefix,
    setInvoiceDate,
    setDueDate,
    setStatus,
    setCurrency,
    fontFamily,
    setFontFamily,
  } = useInvoiceStore();

  return (
    <div className="space-y-4">
      <h3 className="theme-heading">
        Invoice Details
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Document Title */}
        <div className="col-span-2">
          <label className="theme-label">
            Document Title
          </label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="theme-input"
            placeholder="TAX INVOICE"
          />
        </div>

        {/* Invoice Number */}
        <div className="col-span-2">
          <label className="theme-label">
            Invoice Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-24 theme-input"
              placeholder="INV-"
            />
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="flex-1 theme-input"
              placeholder="INV-2026-001"
            />
          </div>
        </div>

        {/* Invoice Date */}
        <div>
          <label className="theme-label">
            Invoice Date
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="theme-input [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Due Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Due Date
            </label>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="text-[11px] text-red-500 hover:text-red-600 dark:text-red-400 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Remove due date"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => setDueDate(e.target.value)}
              className="theme-input [color-scheme:light] dark:[color-scheme:dark] pr-8"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                title="Clear due date"
                aria-label="Clear due date"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="theme-label">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="theme-input"
          >
            <option value="Draft" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Draft</option>
            <option value="Sent" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Sent</option>
            <option value="Paid" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Paid</option>
            <option value="Overdue" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Overdue</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="theme-label">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="theme-input"
          >
            <option value="INR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">₹ INR</option>
            <option value="USD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">$ USD</option>
            <option value="EUR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">€ EUR</option>
            <option value="GBP" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">£ GBP</option>
            <option value="AUD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">A$ AUD</option>
            <option value="CAD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">C$ CAD</option>
            <option value="JPY" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">¥ JPY</option>
            <option value="CHF" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">CHF</option>
            <option value="SGD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">S$ SGD</option>
          </select>
        </div>

        {/* Typography */}
        <div className="col-span-2">
          <label className="theme-label">
            Typography
          </label>
          <select
            value={fontFamily || 'Inter'}
            onChange={(e) => setFontFamily(e.target.value)}
            className="theme-input"
          >
            <option value="Inter" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Inter (Clean & Modern)</option>
            <option value="Playfair Display" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Playfair Display (Elegant & Classic)</option>
            <option value="Space Grotesk" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Space Grotesk (Tech & Edgy)</option>
            <option value="Roboto Mono" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Roboto Mono (Code & Technical)</option>
            <option value="Outfit" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Outfit (Geometric & Friendly)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
