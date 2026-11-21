'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { getCurrencySymbol } from '@/lib/currencies';

export default function LineItems() {
  const {
    lineItems,
    currency,
    addLineItem,
    removeLineItem,
    updateLineItem,
  } = useInvoiceStore();

  const sym = getCurrencySymbol(currency);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Line Items
        </h3>
        <button
          onClick={addLineItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
        <div className="col-span-4">Description</div>
        <div className="col-span-2">HSN/SAC</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-2 text-center">Price ({sym})</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      <div className="space-y-3 sm:space-y-2">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-900/60 sm:bg-transparent border sm:border-0 border-slate-800 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-start group transition-all"
          >
            {/* Description */}
            <div className="sm:col-span-4">
              <label className="block sm:hidden text-[11px] font-medium text-slate-400 mb-1">
                Item Description #{index + 1}
              </label>
              <textarea
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, { description: e.target.value })
                }
                rows={1}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-[16px] sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y min-h-[38px]"
                placeholder={index === 0 ? 'e.g. Web Design Service' : 'Item description'}
              />
            </div>

            {/* Mobile Second Row: HSN/SAC, Qty, Rate grouped */}
            <div className="grid grid-cols-12 gap-2 sm:contents">
              <div className="col-span-4 sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-medium text-slate-400 mb-1 truncate">
                  HSN/SAC
                </label>
                <input
                  type="text"
                  value={item.hsnSac || ''}
                  onChange={(e) =>
                    updateLineItem(item.id, { hsnSac: e.target.value })
                  }
                  className="w-full px-2.5 sm:px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-[16px] sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="HSN/SAC"
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <label className="block sm:hidden text-[10px] font-medium text-slate-400 mb-1 text-center">
                  Qty
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={item.quantity || ''}
                  onChange={(e) =>
                    updateLineItem(item.id, {
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-2 sm:px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-[16px] sm:text-sm text-white text-center placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="1"
                />
              </div>

              <div className="col-span-5 sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-medium text-slate-400 mb-1 text-right">
                  Rate ({sym})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.unitPrice || ''}
                  onChange={(e) =>
                    updateLineItem(item.id, {
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 sm:px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-[16px] sm:text-sm text-white text-right sm:text-center placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Mobile Footer Row: Line Total & Delete button */}
            <div className="flex items-center justify-between sm:contents pt-1 sm:pt-0 border-t border-slate-800/60 sm:border-0">
              <div className="sm:col-span-2 text-left sm:text-right">
                <span className="text-[11px] text-slate-400 sm:hidden">Total: </span>
                <span className="text-sm text-slate-200 font-semibold">
                  {sym}{(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
              <div className="sm:col-span-1 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="touch-target p-2 text-slate-400 sm:text-slate-600 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
