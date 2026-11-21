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
      <h3 className="theme-heading">
        Notes & Payment
      </h3>

      <div className="space-y-3">
        <div>
          <label className="theme-label">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="theme-input resize-none"
            placeholder="Thank you for your business!"
          />
        </div>

        <div>
          <label className="theme-label">
            Terms & Conditions
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={2}
            className="theme-input resize-none"
            placeholder="Payment is due within 30 days..."
          />
        </div>

        {/* Payment Details Accordion */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors flex items-center gap-1 py-1">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="theme-label">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    updatePaymentDetails({ bankName: e.target.value })
                  }
                  className="theme-input"
                  placeholder="State Bank of India"
                />
              </div>
              <div>
                <label className="theme-label">
                  Account Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentDetails.accountNumber}
                  onChange={(e) =>
                    updatePaymentDetails({ accountNumber: e.target.value })
                  }
                  className="theme-input"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="theme-label">
                  IFSC / SWIFT
                </label>
                <input
                  type="text"
                  value={paymentDetails.ifscSwift}
                  onChange={(e) =>
                    updatePaymentDetails({ ifscSwift: e.target.value })
                  }
                  className="theme-input"
                  placeholder="SBIN0001234"
                />
              </div>
              <div>
                <label className="theme-label">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) =>
                    updatePaymentDetails({ upiId: e.target.value })
                  }
                  className="theme-input"
                  placeholder="business@upi"
                />
              </div>
            </div>

            <div>
              <label className="theme-label">
                Branch Address
              </label>
              <input
                type="text"
                value={paymentDetails.bankAddress || ''}
                onChange={(e) =>
                  updatePaymentDetails({ bankAddress: e.target.value })
                }
                className="theme-input"
                placeholder="123 Bank Street, City"
              />
            </div>

            <div>
              <label className="theme-label">
                Payment Link
              </label>
              <input
                type="url"
                inputMode="url"
                value={paymentDetails.paymentLink}
                onChange={(e) =>
                  updatePaymentDetails({ paymentLink: e.target.value })
                }
                className="theme-input"
                placeholder="https://pay.example.com/invoice"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
