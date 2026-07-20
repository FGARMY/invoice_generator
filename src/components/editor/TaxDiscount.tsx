'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function TaxDiscount() {
  const { discount, tax, shipping, amountPaid, setDiscount, setTax, setShipping, setAmountPaid } =
    useInvoiceStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Tax, Discount & Shipping
      </h3>

      <div className="space-y-4">
        {/* Discount */}
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Discount</label>
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setDiscount({ type: 'percent' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  discount.type === 'percent'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setDiscount({ type: 'flat' })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  discount.type === 'flat'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Flat
              </button>
            </div>
          </div>
          <input
            type="number"
            value={discount.value || ''}
            onChange={(e) =>
              setDiscount({ value: parseFloat(e.target.value) || 0 })
            }
            min="0"
            step="0.01"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder={discount.type === 'percent' ? '0%' : '0.00'}
          />
        </div>

        {/* Tax */}
        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-3">
          <label className="text-xs font-medium text-slate-400">Tax</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={tax.label}
              onChange={(e) => setTax({ label: e.target.value })}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="Tax label (e.g. GST)"
            />
            <div className="relative">
              <input
                type="number"
                value={tax.rate || ''}
                onChange={(e) =>
                  setTax({ rate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.5"
                className="w-full px-3 py-2 pr-8 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
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
                className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
              />
              <span className="text-xs text-slate-400">GST Split</span>
            </label>
            {tax.isGST && (
              <select
                value={tax.gstType}
                onChange={(e) =>
                  setTax({
                    gstType: e.target.value as 'intraState' | 'interState',
                  })
                }
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="intraState">CGST + SGST (Intra-State)</option>
                <option value="interState">IGST (Inter-State)</option>
              </select>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Shipping
          </label>
          <input
            type="number"
            value={shipping || ''}
            onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="0.00"
          />
        </div>

        {/* Amount Paid */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Amount Paid
          </label>
          <input
            type="number"
            value={amountPaid || ''}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}
