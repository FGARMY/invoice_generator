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

export default function BoldModern() {
  const store = useInvoiceStore();
  const {
    documentTitle,
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

  // Black and white minimalist colors
  const primaryColor = '#000000';
  const neutralBorder = '#000000';

  return (
    <div
      className="bg-[#ffffff] text-[#000000] min-h-full h-full text-[11px] leading-relaxed relative flex flex-col"
      style={{ fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : "'Inter', sans-serif" }}
    >
      <div className="flex-1 px-12 pt-12 pb-8 flex flex-col">
        {/* Editorial Header */}
        <div className="border-b-[4px] border-[#000000] pb-8 mb-12 flex justify-between items-end">
          <div className="w-[60%]">
            <h1 className="text-[54px] font-black uppercase tracking-tighter leading-none mb-4">
              {documentTitle || 'INVOICE'}
            </h1>
            <div className="grid grid-cols-3 gap-6 text-[10px]">
              <div>
                <p className="font-bold uppercase tracking-widest text-[#737373] mb-1">Invoice No</p>
                <p className="font-bold text-[14px]">{invoiceNumber}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[#737373] mb-1">Date</p>
                <p className="font-bold text-[14px]">{formatDateDisplay(invoiceDate)}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[#737373] mb-1">Due Date</p>
                <p className="font-bold text-[14px]">{formatDateDisplay(dueDate)}</p>
              </div>
            </div>
          </div>
          <div className="w-[35%] text-right">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="Logo" className="max-h-20 w-auto object-contain ml-auto mb-4 grayscale" />
            ) : (
              <h2 className="text-[20px] font-bold uppercase tracking-tight mb-2">
                {business.name || 'YOUR BUSINESS'}
              </h2>
            )}
            <div className="text-[10px] text-[#404040]">
              {business.address && <p className="whitespace-pre-line mb-1">{business.address}</p>}
              {business.email && <p>{business.email}</p>}
              {business.phone && <p>{business.phone}</p>}
              {business.taxId && <p className="mt-1 font-bold">TAX ID: {business.taxId}</p>}
            </div>
          </div>
        </div>

        {/* Client Section */}
        <div className="mb-12 flex">
          <div className="w-1/2">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-[#737373]">
              Billed To
            </h3>
            <div className="text-[14px] font-bold uppercase tracking-tight mb-1">{client.name || 'Client Name'}</div>
            {client.company && <div className="text-[12px] font-bold text-[#404040] mb-2">{client.company}</div>}
            <div className="text-[10px] text-[#404040] space-y-0.5">
              {client.address && <p className="whitespace-pre-line">{client.address}</p>}
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
            </div>
          </div>
          <div className="w-1/2 flex justify-end items-start">
             <div className="text-right p-6 border-2 border-[#000000]">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-[#737373]">
                  Total Amount Due
                </h3>
                <div className="text-[32px] font-black tracking-tighter">
                  {fmt(balanceDue)}
                </div>
             </div>
          </div>
        </div>

        {/* Line Items - Minimalist Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[3px] border-[#000000]">
                <th className="py-4 text-[9px] font-black uppercase tracking-widest w-[50%]">Description</th>
                {hasHsnSac && <th className="py-4 text-[9px] font-black uppercase tracking-widest text-center">HSN/SAC</th>}
                <th className="py-4 text-[9px] font-black uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-[9px] font-black uppercase tracking-widest text-right">Rate</th>
                <th className="py-4 text-[9px] font-black uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.id} className="border-b border-[#E5E5E5]">
                  <td className="py-4">
                    <span className="font-bold text-[12px] whitespace-pre-line">
                      {item.description || <span className="text-[#A3A3A3] italic">No description</span>}
                    </span>
                  </td>
                  {hasHsnSac && (
                    <td className="py-4 text-center font-bold text-[#404040]">{item.hsnSac || '-'}</td>
                  )}
                  <td className="py-4 text-center font-bold text-[#404040]">{item.quantity}</td>
                  <td className="py-4 text-right font-bold text-[#404040]">{fmt(item.unitPrice)}</td>
                  <td className="py-4 text-right font-black text-[12px]">
                    {fmt(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment */}
        <div className="flex gap-12 mb-12">
          {/* Payment Info */}
          <div className="flex-1">
            {Object.keys(paymentDetails).some((k) => paymentDetails[k as keyof typeof paymentDetails]) && (
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-[#737373]">Payment Details</h3>
                <div className="space-y-3">
                  {paymentDetails.bankName && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#737373]">Bank</span>
                      <span className="font-bold">{paymentDetails.bankName}</span>
                    </div>
                  )}
                  {paymentDetails.bankAddress && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#737373]">Branch</span>
                      <span className="font-bold">{paymentDetails.bankAddress}</span>
                    </div>
                  )}
                  {paymentDetails.accountNumber && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#737373]">Account No.</span>
                      <span className="font-bold tracking-wider">{paymentDetails.accountNumber}</span>
                    </div>
                  )}
                  {paymentDetails.ifscSwift && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#737373]">Routing / IFSC</span>
                      <span className="font-bold tracking-wider">{paymentDetails.ifscSwift}</span>
                    </div>
                  )}
                  {paymentDetails.upiId && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-[#737373]">UPI ID</span>
                      <span className="font-bold">{paymentDetails.upiId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="w-[45%]">
            <div className="space-y-3 text-[11px] border-t-2 border-[#000000] pt-4">
              <div className="flex justify-between">
                <span className="font-bold uppercase tracking-widest text-[#737373]">Subtotal</span>
                <span className="font-bold">{fmt(subtotal)}</span>
              </div>

              {discount.value > 0 && (
                <div className="flex justify-between">
                  <span className="font-bold uppercase tracking-widest text-[#737373]">Discount</span>
                  <span className="font-bold">- {fmt(discountAmt)}</span>
                </div>
              )}

              {tax.rate > 0 && (
                <div className="flex justify-between">
                  <span className="font-bold uppercase tracking-widest text-[#737373]">
                    {tax.isGST ? 'Total Before GST' : 'Total Before Tax'}
                  </span>
                  <span className="font-bold">{fmt(subtotal - discountAmt)}</span>
                </div>
              )}

              {tax.rate > 0 && !tax.isGST && (
                <div className="flex justify-between">
                  <span className="font-bold uppercase tracking-widest text-[#737373]">{tax.label} ({tax.rate}%)</span>
                  <span className="font-bold">{fmt(taxAmt)}</span>
                </div>
              )}
              {tax.rate > 0 && tax.isGST && tax.gstType === 'intraState' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-widest text-[#737373]">CGST ({tax.rate / 2}%)</span>
                    <span className="font-bold">{fmt(gst.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-widest text-[#737373]">SGST ({tax.rate / 2}%)</span>
                    <span className="font-bold">{fmt(gst.sgst)}</span>
                  </div>
                </>
              )}
              {tax.rate > 0 && tax.isGST && tax.gstType === 'interState' && (
                <div className="flex justify-between">
                  <span className="font-bold uppercase tracking-widest text-[#737373]">IGST ({tax.rate}%)</span>
                  <span className="font-bold">{fmt(gst.igst)}</span>
                </div>
              )}

              {shipping !== 0 && (
                <div className="flex justify-between">
                  <span className="font-bold uppercase tracking-widest text-[#737373]">Short & Access</span>
                  <span className="font-bold">{fmt(shipping)}</span>
                </div>
              )}

              <div className="flex justify-between py-3 border-y-2 border-[#000000] my-4 text-[14px]">
                <span className="font-black uppercase tracking-widest">Total</span>
                <span className="font-black">{fmt(total)}</span>
              </div>

              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-widest text-[#737373]">Amount Paid</span>
                    <span className="font-bold">- {fmt(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 bg-[#000000] text-[#ffffff] px-4">
                    <span className="font-black uppercase tracking-widest">Balance Due</span>
                    <span className="font-black">{fmt(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(notes || terms) && (
          <div className="mb-12 border-l-[3px] border-[#000000] pl-6">
            {notes && (
              <div className="mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-[#737373]">Notes</h3>
                <p className="text-[10px] text-[#404040] whitespace-pre-line">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-[#737373]">Terms</h3>
                <p className="text-[10px] text-[#404040] whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Signature footer (pinned to bottom if short) */}
      <div className="px-12 py-8 mt-auto border-t-4 border-[#000000] flex justify-between items-end bg-[#FAFAFA]">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#737373]">
          Thank you for your business.
        </div>
        <div className="text-right">
          {business.signatureUrl && (
            <img src={business.signatureUrl} alt="Signature" className="h-16 object-contain ml-auto mb-2 grayscale" />
          )}
          <div className="text-[10px] font-bold uppercase tracking-widest">Authorized Signature</div>
          <div className="text-[9px] text-[#737373] mt-1">{business.name || 'Your Name'}</div>
        </div>
      </div>
    </div>
  );
}

