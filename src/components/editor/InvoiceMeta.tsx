'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function InvoiceMeta() {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    status,
    currency,
    invoicePrefix,
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
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Invoice Details
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Invoice Number */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Invoice Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="INV-"
            />
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="INV-2026-001"
            />
          </div>
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Invoice Date
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [color-scheme:dark]"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [color-scheme:dark]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="AUD">A$ AUD</option>
            <option value="CAD">C$ CAD</option>
            <option value="JPY">¥ JPY</option>
            <option value="CHF">CHF</option>
            <option value="SGD">S$ SGD</option>
          </select>
        </div>

        {/* Typography */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Typography
          </label>
          <select
            value={fontFamily || 'Inter'}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="Inter">Inter (Clean & Modern)</option>
            <option value="Playfair Display">Playfair Display (Elegant & Classic)</option>
            <option value="Space Grotesk">Space Grotesk (Tech & Edgy)</option>
            <option value="Roboto Mono">Roboto Mono (Code & Technical)</option>
            <option value="Outfit">Outfit (Geometric & Friendly)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
