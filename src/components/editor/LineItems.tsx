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

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
        <div className="col-span-4">Description</div>
        <div className="col-span-2">HSN/SAC</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-2 text-center">Price ({sym})</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-2 items-start group"
          >
            <div className="col-span-4">
              <textarea
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.id, { description: e.target.value })
                }
                rows={1}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y min-h-[38px]"
                placeholder={index === 0 ? 'e.g. Web Design Service' : 'Item description'}
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={item.hsnSac || ''}
                onChange={(e) =>
                  updateLineItem(item.id, { hsnSac: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="HSN/SAC"
              />
            </div>
            <div className="col-span-1">
              <input
                type="number"
                value={item.quantity || ''}
                onChange={(e) =>
                  updateLineItem(item.id, {
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white text-center placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="1"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={item.unitPrice || ''}
                onChange={(e) =>
                  updateLineItem(item.id, {
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white text-center placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm text-slate-300 font-medium">
                {sym}{(item.quantity * item.unitPrice).toFixed(2)}
              </span>
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                onClick={() => removeLineItem(item.id)}
                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                title="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
