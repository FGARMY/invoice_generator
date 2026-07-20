'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function BusinessDetails() {
  const { business, updateBusiness } = useInvoiceStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Your Business
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={business.name}
            onChange={(e) => updateBusiness({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Address
          </label>
          <textarea
            value={business.address}
            onChange={(e) => updateBusiness({ address: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            placeholder="123 Business St, City, State - ZIP"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={business.email}
              onChange={(e) => updateBusiness({ email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="you@business.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={business.phone}
              onChange={(e) => updateBusiness({ phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Website
            </label>
            <input
              type="url"
              value={business.website}
              onChange={(e) => updateBusiness({ website: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="www.example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tax ID / GSTIN
            </label>
            <input
              type="text"
              value={business.taxId}
              onChange={(e) => updateBusiness({ taxId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
