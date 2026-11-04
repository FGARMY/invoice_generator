'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
import ExcelImport from './ExcelImport';
import InvoiceMeta from './InvoiceMeta';
import BusinessDetails from './BusinessDetails';
import LogoUpload from './LogoUpload';
import SignatureUpload from './SignatureUpload';
import ClientDetails from './ClientDetails';
import LineItems from './LineItems';
import TaxDiscount from './TaxDiscount';
import NotesTerms from './NotesTerms';

export default function InvoiceForm() {
  const business = useInvoiceStore((s) => s.business);
  const [editCompany, setEditCompany] = useState(false);

  return (
    <div className="space-y-6 p-5">
      {/* Excel (.xlsx / .csv) Import */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <ExcelImport />
      </section>

      {/* Invoice Details */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <InvoiceMeta />
      </section>

      {/* Client */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <ClientDetails />
      </section>

      {/* Line Items */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <LineItems />
      </section>

      {/* Tax, Discount, Shipping */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <TaxDiscount />
      </section>

      {/* Notes, Terms, Payment */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <NotesTerms />
      </section>

      {/* Business + Logo + Signature (Locked by default so it stays fixed across all invoices) */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Our Company Details (Fixed)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Locked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {business.name} • Logo, Address, GST &amp; Signature kept constant
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditCompany(!editCompany)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            {editCompany ? 'Lock' : 'Edit'}
          </button>
        </div>

        {editCompany && (
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <LogoUpload />
            <div className="border-t border-slate-800 pt-4">
              <SignatureUpload />
            </div>
            <div className="border-t border-slate-800 pt-4">
              <BusinessDetails />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
