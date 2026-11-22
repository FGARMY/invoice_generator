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
        <h3 className="theme-heading">
          Line Items
        </h3>
        <button
          onClick={addLineItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
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
            className="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50 sm:bg-transparent dark:bg-slate-900/60 border sm:border-0 border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-start group transition-all"
          >
            {/* Mobile Header: Item number & Remove Product button */}
            <div className="flex sm:hidden items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Item #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title={lineItems.length > 1 ? "Remove this product" : "Clear this item"}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {lineItems.length > 1 ? 'Remove Product' : 'Clear Item'}
              </button>
            </div>

            {/* Description */}
            <div className="sm:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="sm:hidden">Product Description</span>
                </label>
                {item.description ? (
                  <button
                    type="button"
                    onClick={() => updateLineItem(item.id, { description: '' })}
                    className="text-[11px] text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-0.5 px-1 py-0.5 rounded transition-colors"
                    title="Clear description text"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear text
                  </button>
                ) : null}
              </div>
              <div className="relative">
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(item.id, { description: e.target.value })
                  }
                  rows={2}
                  className="theme-input resize-y min-h-[38px] text-xs pr-7"
                  placeholder={index === 0 ? 'Description (e.g. Web Design Service)' : 'Description (optional)'}
                />
                {item.description ? (
                  <button
                    type="button"
                    onClick={() => updateLineItem(item.id, { description: '' })}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                    title="Clear description"
                    aria-label="Clear description"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Mobile Second Row: HSN/SAC, Qty, Rate grouped */}
            <div className="grid grid-cols-12 gap-2 sm:contents">
              <div className="col-span-4 sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1 truncate">
                  HSN/SAC
                </label>
                <input
                  type="text"
                  value={item.hsnSac || ''}
                  onChange={(e) =>
                    updateLineItem(item.id, { hsnSac: e.target.value })
                  }
                  className="theme-input px-2.5 sm:px-3"
                  placeholder="HSN/SAC"
                />
              </div>

              <div className="col-span-3 sm:col-span-1">
                <label className="block sm:hidden text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1 text-center">
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
                  className="theme-input px-2 sm:px-3 text-center"
                  placeholder="1"
                />
              </div>

              <div className="col-span-5 sm:col-span-2">
                <label className="block sm:hidden text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1 text-right">
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
                  className="theme-input px-2.5 sm:px-3 text-right sm:text-center"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Mobile Footer Row: Line Total & Delete button */}
            <div className="flex items-center justify-between sm:contents pt-1 sm:pt-0 border-t border-slate-200 dark:border-slate-800/60 sm:border-0">
              <div className="sm:col-span-2 text-left sm:text-right">
                <span className="text-[11px] text-slate-500 sm:hidden">Total: </span>
                <span className="text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  {sym}{(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
              <div className="sm:col-span-1 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="touch-target p-2 text-slate-400 sm:text-slate-400 hover:text-red-500 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
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
