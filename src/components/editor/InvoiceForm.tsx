'use client';

import InvoiceMeta from './InvoiceMeta';
import BusinessDetails from './BusinessDetails';
import LogoUpload from './LogoUpload';
import SignatureUpload from './SignatureUpload';
import ClientDetails from './ClientDetails';
import LineItems from './LineItems';
import TaxDiscount from './TaxDiscount';
import NotesTerms from './NotesTerms';

export default function InvoiceForm() {
  return (
    <div className="space-y-6 p-5">
      {/* Invoice Details */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <InvoiceMeta />
      </section>

      {/* Business + Logo */}
      <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <LogoUpload />
        <div className="border-t border-slate-800 pt-4">
          <SignatureUpload />
        </div>
        <div className="border-t border-slate-800 pt-4">
          <BusinessDetails />
        </div>
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
    </div>
  );
}
