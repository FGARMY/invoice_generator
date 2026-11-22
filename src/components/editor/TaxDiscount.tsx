'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { numberToWords } from '@/lib/numberToWords';
import { calcSubtotal, calcDiscountAmount, calcTaxAmount } from '@/lib/calculations';

export default function TaxDiscount() {
  const {
    discount,
    tax,
    shipping,
    amountPaid,
    amountInWords,
    lineItems,
    currency,
    setDiscount,
    setTax,
    setShipping,
    setAmountPaid,
    setAmountInWords,
  } = useInvoiceStore();

  const subtotal = calcSubtotal(lineItems);
  const discountAmt = calcDiscountAmount(subtotal, discount);
  const taxAmt = calcTaxAmount(subtotal, discount, tax);
  const total = Math.max(0, subtotal - discountAmt + taxAmt + (shipping || 0));
  const autoWords = numberToWords(total, currency);

  return (
    <div className="space-y-4">
      <h3 className="theme-heading">
        Tax, Discount & Amount in Words
      </h3>

      <div className="space-y-4">
        {/* Discount */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Discount</label>
            <div className="flex bg-slate-200/60 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setDiscount({ type: 'percent' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  discount.type === 'percent'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setDiscount({ type: 'flat' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  discount.type === 'flat'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Flat
              </button>
            </div>
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={discount.value || ''}
            onChange={(e) =>
              setDiscount({ value: parseFloat(e.target.value) || 0 })
            }
            min="0"
            step="0.01"
            className="theme-input"
            placeholder={discount.type === 'percent' ? '0%' : '0.00'}
          />
        </div>

        {/* Tax */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50 space-y-3">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tax</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={tax.label}
              onChange={(e) => setTax({ label: e.target.value })}
              className="theme-input"
              placeholder="Tax label (e.g. GST)"
            />
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={tax.rate || ''}
                onChange={(e) =>
                  setTax({ rate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.5"
                className="theme-input pr-8"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                %
              </span>
            </div>
          </div>

          {/* GST Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tax.isGST}
                onChange={(e) => setTax({ isGST: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">GST Split</span>
            </label>
            {tax.isGST && (
              <select
                value={tax.gstType}
                onChange={(e) =>
                  setTax({
                    gstType: e.target.value as 'intraState' | 'interState',
                  })
                }
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="intraState" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">CGST + SGST (Intra-State)</option>
                <option value="interState" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">IGST (Inter-State)</option>
              </select>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div>
          <label className="theme-label">
            Shipping / Short & Access
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={shipping || ''}
            onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="theme-input"
            placeholder="0.00"
          />
        </div>

        {/* Amount Paid */}
        <div>
          <label className="theme-label">
            Amount Paid
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amountPaid || ''}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="theme-input"
            placeholder="0.00"
          />
        </div>

        {/* Amount in Words / Price in Words */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Amount in Words (Price in Words)
            </label>
            <button
              type="button"
              onClick={() => setAmountInWords(autoWords)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Auto-calculate amount in words from invoice total"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto-generate
            </button>
          </div>
          <textarea
            rows={2}
            value={amountInWords !== undefined ? amountInWords : autoWords}
            onChange={(e) => setAmountInWords(e.target.value)}
            className="theme-input text-xs resize-none font-medium text-slate-800 dark:text-slate-200"
            placeholder={autoWords}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Printed on the invoice. You can edit this text directly or click &quot;Auto-generate&quot; to re-calculate from grand total.
          </p>
        </div>
      </div>
    </div>
  );
}
