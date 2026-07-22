'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { formatCurrency } from '@/lib/currencies';
import { formatDateDisplay } from '@/lib/defaults';
import {
  calcSubtotal,
  calcDiscountAmount,
  calcTaxAmount,
  calcGSTSplit,
} from '@/lib/calculations';

export default function CorporateBlue() {
  const store = useInvoiceStore();
  const {
    invoiceNumber, invoiceDate, dueDate,
    business, client, lineItems,
    discount, tax, shipping,
    notes, terms, paymentDetails,
    currency, accentColor,
    amountPaid, balanceDue, fontFamily
  } = store;

  const subtotal = calcSubtotal(lineItems);
  const discountAmt = calcDiscountAmount(subtotal, discount);
  const taxAmt = calcTaxAmount(subtotal, discount, tax);
  const gst = calcGSTSplit(subtotal, discount, tax);
  const total = subtotal - discountAmt + taxAmt + (shipping || 0);
  const fmt = (n: number) => formatCurrency(n, currency);
  const hasHsnSac = lineItems.some(item => item.hsnSac);

  // Swiss Design colors
  const primaryNavy = accentColor || '#0F172A';
  const neutralBorder = '#E2E8F0';

  return (
    <div
      className="min-h-[842px] text-[11px] leading-relaxed relative bg-[#ffffff]"
      style={{ color: '#0F172A', fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : "'Inter', sans-serif" }}
    >
      <div className="px-12 pt-12 pb-8">
        {/* Header Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12 border-b-2 pb-8" style={{ borderColor: primaryNavy }}>
          {/* Logo / Brand Name */}
          <div>
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="Logo" className="max-h-16 max-w-[200px] object-contain mb-4" />
            ) : (
              <h1 className="text-[24px] font-black tracking-tight mb-4" style={{ color: primaryNavy }}>
                {business.name || 'YOUR COMPANY'}
              </h1>
            )}
            <div className="text-[10px] text-[#475569] space-y-1">
              {business.address && <p className="whitespace-pre-line">{business.address}</p>}
              {business.email && <p>{business.email}</p>}
              {business.phone && <p>{business.phone}</p>}
              {business.taxId && <p>Tax ID / GSTIN: {business.taxId}</p>}
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="text-right flex flex-col justify-between items-end">
            <h2 className="text-[32px] font-black uppercase tracking-tight" style={{ color: primaryNavy }}>
              INVOICE
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right mt-4 text-[10px]">
              <div className="text-[#64748B] font-semibold uppercase tracking-wider">Invoice No</div>
              <div className="font-bold">{invoiceNumber}</div>
              
              <div className="text-[#64748B] font-semibold uppercase tracking-wider">Date</div>
              <div className="font-bold">{formatDateDisplay(invoiceDate)}</div>
              
              <div className="text-[#64748B] font-semibold uppercase tracking-wider">Due Date</div>
              <div className="font-bold">{formatDateDisplay(dueDate)}</div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-12">
          <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-4 text-[#64748B]">Billed To</h3>
          <div className="border-l-4 pl-4" style={{ borderColor: primaryNavy }}>
            <p className="text-[14px] font-bold">{client.name || 'Client Name'}</p>
            {client.company && <p className="text-[12px] font-medium text-[#334155]">{client.company}</p>}
            <div className="text-[10px] text-[#475569] mt-2 space-y-0.5">
              {client.address && <p className="whitespace-pre-line">{client.address}</p>}
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y-2" style={{ borderColor: primaryNavy }}>
                <th className="py-3 px-2 text-[9px] font-bold uppercase tracking-widest text-[#0F172A] w-[50%]">Item Description</th>
                {hasHsnSac && <th className="py-3 px-2 text-[9px] font-bold uppercase tracking-widest text-center text-[#0F172A]">HSN/SAC</th>}
                <th className="py-3 px-2 text-[9px] font-bold uppercase tracking-widest text-center text-[#0F172A]">Qty</th>
                <th className="py-3 px-2 text-[9px] font-bold uppercase tracking-widest text-right text-[#0F172A]">Rate</th>
                <th className="py-3 px-2 text-[9px] font-bold uppercase tracking-widest text-right text-[#0F172A]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.id} className="border-b" style={{ borderColor: neutralBorder }}>
                  <td className="py-4 px-2">
                    <span className="font-bold text-[#0F172A] whitespace-pre-line">
                      {item.description || <span className="text-[#CBD5E1] italic">No description</span>}
                    </span>
                  </td>
                  {hasHsnSac && (
                    <td className="py-4 px-2 text-center text-[#475569] font-medium">{item.hsnSac || '-'}</td>
                  )}
                  <td className="py-4 px-2 text-center text-[#475569] font-medium">{item.quantity}</td>
                  <td className="py-4 px-2 text-right text-[#475569] font-medium">{fmt(item.unitPrice)}</td>
                  <td className="py-4 px-2 text-right font-bold text-[#0F172A]">
                    {fmt(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Info */}
        <div className="flex gap-8 mb-12">
          {/* Payment Info */}
          <div className="flex-1">
            {Object.keys(paymentDetails).some((k) => paymentDetails[k as keyof typeof paymentDetails]) && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-4 text-[#64748B]">Payment Info</h3>
                <div className="bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-2">
                  {paymentDetails.bankName && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Bank</span>
                      <span className="font-medium text-[#0F172A]">{paymentDetails.bankName}</span>
                    </div>
                  )}
                  {paymentDetails.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Acct No</span>
                      <span className="font-medium text-[#0F172A]">{paymentDetails.accountNumber}</span>
                    </div>
                  )}
                  {paymentDetails.ifscSwift && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">IFSC/Routing</span>
                      <span className="font-medium text-[#0F172A]">{paymentDetails.ifscSwift}</span>
                    </div>
                  )}
                  {paymentDetails.upiId && (
                    <div className="flex justify-between border-t border-[#E2E8F0] pt-2 mt-2">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">UPI</span>
                      <span className="font-medium text-[#0F172A]">{paymentDetails.upiId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-[45%]">
            <div className="space-y-3 text-[11px]">
              <div className="flex justify-between px-2">
                <span className="text-[#64748B] font-bold uppercase tracking-wider">Subtotal</span>
                <span className="font-bold">{fmt(subtotal)}</span>
              </div>

              {discount.value > 0 && (
                <div className="flex justify-between px-2">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider">Discount</span>
                  <span className="font-bold">- {fmt(discountAmt)}</span>
                </div>
              )}

              {tax.rate > 0 && !tax.isGST && (
                <div className="flex justify-between px-2">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider">{tax.label} ({tax.rate}%)</span>
                  <span className="font-bold">{fmt(taxAmt)}</span>
                </div>
              )}
              {tax.rate > 0 && tax.isGST && tax.gstType === 'intraState' && (
                <>
                  <div className="flex justify-between px-2">
                    <span className="text-[#64748B] font-bold uppercase tracking-wider">CGST ({tax.rate / 2}%)</span>
                    <span className="font-bold">{fmt(gst.cgst)}</span>
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-[#64748B] font-bold uppercase tracking-wider">SGST ({tax.rate / 2}%)</span>
                    <span className="font-bold">{fmt(gst.sgst)}</span>
                  </div>
                </>
              )}
              {tax.rate > 0 && tax.isGST && tax.gstType === 'interState' && (
                <div className="flex justify-between px-2">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider">IGST ({tax.rate}%)</span>
                  <span className="font-bold">{fmt(gst.igst)}</span>
                </div>
              )}

              {shipping > 0 && (
                <div className="flex justify-between px-2">
                  <span className="text-[#64748B] font-bold uppercase tracking-wider">Shipping</span>
                  <span className="font-bold">{fmt(shipping)}</span>
                </div>
              )}

              <div className="flex justify-between px-4 py-3 text-[#ffffff] font-black text-[13px] tracking-wide" style={{ backgroundColor: primaryNavy }}>
                <span>TOTAL DUE</span>
                <span>{fmt(total)}</span>
              </div>

              {amountPaid > 0 && (
                <div className="mt-2 border border-[#E2E8F0]">
                  <div className="flex justify-between px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <span className="text-[#64748B] font-bold uppercase tracking-wider">Amount Paid</span>
                    <span className="font-bold">- {fmt(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 font-black text-[12px]" style={{ color: primaryNavy }}>
                    <span className="uppercase tracking-wider">Balance Due</span>
                    <span>{fmt(balanceDue)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer (Notes + Signature) */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            {(notes || terms) && (
              <div className="space-y-4">
                {notes && (
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 text-[#64748B]">Notes</h3>
                    <p className="text-[10px] text-[#475569] whitespace-pre-line leading-relaxed">{notes}</p>
                  </div>
                )}
                {terms && (
                  <div>
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 text-[#64748B]">Terms & Conditions</h3>
                    <p className="text-[10px] text-[#475569] whitespace-pre-line leading-relaxed">{terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end justify-end">
            {business.signatureUrl ? (
              <img src={business.signatureUrl} alt="Signature" className="h-16 object-contain mb-2" />
            ) : (
              <div className="h-16" />
            )}
            <div className="w-48 border-t-2 pt-2 text-center" style={{ borderColor: neutralBorder }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

