'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function BusinessDetails() {
  const { business, updateBusiness } = useInvoiceStore();

  return (
    <div className="space-y-4">
      <h3 className="theme-heading">
        Your Business
      </h3>

      <div className="space-y-3">
        <div>
          <label className="theme-label">
            Business Name
          </label>
          <input
            type="text"
            value={business.name}
            onChange={(e) => updateBusiness({ name: e.target.value })}
            className="theme-input"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="theme-label">
            Address
          </label>
          <textarea
            value={business.address}
            onChange={(e) => updateBusiness({ address: e.target.value })}
            rows={2}
            className="theme-input resize-none"
            placeholder="123 Business St, City, State - ZIP"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="theme-label">
              Email
            </label>
            <input
              type="email"
              inputMode="email"
              value={business.email}
              onChange={(e) => updateBusiness({ email: e.target.value })}
              className="theme-input"
              placeholder="you@business.com"
            />
          </div>
          <div>
            <label className="theme-label">
              Phone
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={business.phone}
              onChange={(e) => updateBusiness({ phone: e.target.value })}
              className="theme-input"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="theme-label">
              Website
            </label>
            <input
              type="url"
              inputMode="url"
              value={business.website}
              onChange={(e) => updateBusiness({ website: e.target.value })}
              className="theme-input"
              placeholder="www.example.com"
            />
          </div>
          <div>
            <label className="theme-label">
              Tax ID / GSTIN
            </label>
            <input
              type="text"
              value={business.taxId}
              onChange={(e) => updateBusiness({ taxId: e.target.value })}
              className="theme-input"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
