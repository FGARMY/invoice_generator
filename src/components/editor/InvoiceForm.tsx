'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { defaultBusiness, defaultPaymentDetails } from '@/lib/defaults';
import { saveBusinessInfo, savePaymentInfo } from '@/lib/storage';
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
  const paymentDetails = useInvoiceStore((s) => s.paymentDetails);
  const updateBusiness = useInvoiceStore((s) => s.updateBusiness);
  const updatePaymentDetails = useInvoiceStore((s) => s.updatePaymentDetails);
  const [editCompany, setEditCompany] = useState(false);

  const handleResetToOfficialDefaults = () => {
    if (confirm('Reset company details & payment info to official ADBPACK defaults?')) {
      updateBusiness(defaultBusiness);
      saveBusinessInfo(defaultBusiness);
      updatePaymentDetails(defaultPaymentDetails);
      savePaymentInfo(defaultPaymentDetails);
    }
  };

  const handleToggleLock = () => {
    if (editCompany) {
      // Locking: guarantee saved to persistent storage
      saveBusinessInfo(business);
      savePaymentInfo(paymentDetails);
    }
    setEditCompany(!editCompany);
  };

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
                {editCompany ? 'Editing' : 'Locked'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {business.name} • Kept constant across all invoices
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editCompany && (
              <button
                type="button"
                onClick={handleResetToOfficialDefaults}
                className="px-2 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-700/60"
                title="Reset to official D Bharty's Enterprises / ADBPACK details"
              >
                Reset Defaults
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleLock}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                editCompany
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {editCompany ? 'Save & Lock' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Read-only summary when locked */}
        {!editCompany ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="font-semibold text-white truncate text-sm">
                  {business.name || "D BHARTY'S ENTERPRISES"}
                </div>
                {business.address && (
                  <div className="text-slate-400 text-[11px] whitespace-pre-line leading-relaxed">
                    {business.address}
                  </div>
                )}
                {business.taxId && (
                  <div className="text-slate-300 text-[11px] font-medium whitespace-pre-line pt-0.5">
                    {business.taxId}
                  </div>
                )}
                <div className="text-slate-400 text-[11px] pt-1">
                  <span className="text-slate-500">Bank:</span> {paymentDetails.bankName || 'HDFC Bank'} •{' '}
                  <span className="text-slate-500">A/C:</span> {paymentDetails.accountNumber} •{' '}
                  <span className="text-slate-500">IFSC:</span> {paymentDetails.ifscSwift}
                </div>
              </div>

              {/* Thumbnails of Logo and Signature */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {business.logoUrl ? (
                  <div className="w-16 h-10 rounded border border-slate-700 bg-white/5 flex items-center justify-center p-0.5">
                    <img src={business.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-10 rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] text-slate-500">
                    No Logo
                  </div>
                )}
                {business.signatureUrl ? (
                  <div className="w-16 h-8 rounded border border-slate-700 bg-white/5 flex items-center justify-center p-0.5">
                    <img src={business.signatureUrl} alt="Sign" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-8 rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-[9px] text-slate-500">
                    No Sign
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
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
