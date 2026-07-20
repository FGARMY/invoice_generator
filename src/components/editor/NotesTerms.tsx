'use client';

import { useInvoiceStore } from '@/store/invoiceStore';

export default function NotesTerms() {
  const {
    notes,
    terms,
    paymentDetails,
    setNotes,
    setTerms,
    updatePaymentDetails,
  } = useInvoiceStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Notes & Payment
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            placeholder="Thank you for your business!"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Terms & Conditions
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            placeholder="Payment is due within 30 days..."
          />
        </div>

        {/* Payment Details Accordion */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Payment Details (Bank/UPI)
          </summary>

          <div className="mt-3 space-y-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    updatePaymentDetails({ bankName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="State Bank of India"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={paymentDetails.accountNumber}
                  onChange={(e) =>
                    updatePaymentDetails({ accountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  IFSC / SWIFT
                </label>
                <input
                  type="text"
                  value={paymentDetails.ifscSwift}
                  onChange={(e) =>
                    updatePaymentDetails({ ifscSwift: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="SBIN0001234"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) =>
                    updatePaymentDetails({ upiId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="business@upi"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Payment Link
              </label>
              <input
                type="url"
                value={paymentDetails.paymentLink}
                onChange={(e) =>
                  updatePaymentDetails({ paymentLink: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="https://pay.example.com/invoice"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
