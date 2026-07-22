'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { formatCurrency, getCurrencySymbol } from '@/lib/currencies';
import { formatDateDisplay } from '@/lib/defaults';
import {
  calcSubtotal,
  calcDiscountAmount,
  calcTaxAmount,
  calcGSTSplit,
} from '@/lib/calculations';

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart);
  if (decPart > 0) {
    result += ' and ' + convert(decPart) + ' Paise';
  }
  return result + ' Only';
}

export default function MinimalMono() {
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
  const sym = getCurrencySymbol(currency);

  const initials = business.name
    ? business.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'CO';

  const borderColor = '#1a1a1a';

  return (
    <div
      className="bg-[#ffffff] text-[#111827] min-h-[842px] text-[11px] leading-snug p-6"
      style={{ fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : "'Inter', sans-serif" }}
    >
      {/* Top: Tax Invoice Title + Original Copy */}
      <div className="text-center mb-1">
        <h1 className="text-[15px] font-bold tracking-wide">Tax Invoice</h1>
      </div>
      <div className="text-right text-[9px] text-[#6b7280] italic -mt-4 mb-2">Original Copy</div>

      {/* Company Header Row */}
      <div className="border-2 mb-0" style={{ borderColor }}>
        <div className="flex">
          {/* Logo + Company Info */}
          <div className="flex-1 p-3 flex gap-3" style={{ borderRight: `1px solid ${borderColor}` }}>
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="Logo" className="max-h-24 max-w-[200px] w-auto object-contain flex-shrink-0" />
            ) : (
              <div
                className="w-14 h-14 rounded flex items-center justify-center text-[#ffffff] font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {initials}
              </div>
            )}
            <div>
              {!business.logoUrl && (
                <h2 className="text-[14px] font-bold uppercase tracking-wider">
                  {business.name || 'Your Business Name'}
                </h2>
              )}
              {business.address && (
                <p className="text-[10px] text-[#4b5563] mt-0.5 whitespace-pre-line">{business.address}</p>
              )}
              {business.taxId && (
                <p className="text-[10px] text-[#4b5563] mt-0.5">
                  <span className="font-semibold">GSTIN:</span> {business.taxId}
                </p>
              )}
              {business.phone && (
                <p className="text-[10px] text-[#4b5563]">
                  <span className="font-semibold">Phone number:</span> {business.phone}
                </p>
              )}
              {business.email && (
                <p className="text-[10px] text-[#4b5563]">
                  <span className="font-semibold">Email:</span> {business.email}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="w-[200px] flex-shrink-0 text-[10px]">
            <div className="flex border-b" style={{ borderColor }}>
              <div className="flex-1 px-2 py-1.5 font-semibold" style={{ borderRight: `1px solid ${borderColor}` }}>Invoice No.</div>
              <div className="flex-1 px-2 py-1.5 font-semibold">Dated</div>
            </div>
            <div className="flex border-b" style={{ borderColor }}>
              <div className="flex-1 px-2 py-1.5" style={{ borderRight: `1px solid ${borderColor}` }}>{invoiceNumber}</div>
              <div className="flex-1 px-2 py-1.5">{formatDateDisplay(invoiceDate)}</div>
            </div>
            <div className="flex border-b" style={{ borderColor }}>
              <div className="flex-1 px-2 py-1.5 font-semibold" style={{ borderRight: `1px solid ${borderColor}` }}>Due Date</div>
              <div className="flex-1 px-2 py-1.5 font-semibold">P.O No.</div>
            </div>
            <div className="flex">
              <div className="flex-1 px-2 py-1.5" style={{ borderRight: `1px solid ${borderColor}` }}>{formatDateDisplay(dueDate)}</div>
              <div className="flex-1 px-2 py-1.5">—</div>
            </div>
          </div>
        </div>
      </div>

      {/* Consignee / Shipping Row */}
      <div className="border-x-2 border-b-2" style={{ borderColor }}>
        <div className="flex">
          <div className="flex-1 p-2.5" style={{ borderRight: `1px solid ${borderColor}` }}>
            <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Consignee (Bill To)</p>
            <p className="font-bold text-[12px]">{client.name || '—'}</p>
            {client.company && <p className="text-[10px] text-[#374151] font-medium">{client.company}</p>}
            {client.address && (
              <p className="text-[10px] text-[#4b5563] mt-0.5 whitespace-pre-line">{client.address}</p>
            )}
            {client.email && <p className="text-[10px] text-[#4b5563]">{client.email}</p>}
            {client.phone && <p className="text-[10px] text-[#4b5563]">{client.phone}</p>}
          </div>
          <div className="flex-1 p-2.5">
            <p className="text-[9px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Shipping Address</p>
            <p className="font-bold text-[12px]">{client.name || '—'}</p>
            {client.company && <p className="text-[10px] text-[#374151] font-medium">{client.company}</p>}
            {client.address && (
              <p className="text-[10px] text-[#4b5563] mt-0.5 whitespace-pre-line">{client.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-x-2 border-b-2" style={{ borderColor }}>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-center w-8" style={{ borderColor }}>
              S.No.
            </th>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-left" style={{ borderColor }}>
              Description of Goods / Services
            </th>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-center w-16" style={{ borderColor }}>
              HSN/SAC
            </th>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-center w-14" style={{ borderColor }}>
              Quantity
            </th>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-center w-14" style={{ borderColor }}>
              Rate
            </th>
            <th className="border-r px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-center w-10" style={{ borderColor }}>
              Per
            </th>
            <th className="px-2 py-2 text-[9px] font-bold text-[#4b5563] uppercase text-right w-20" style={{ borderColor }}>
              Amount ({sym})
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <tr key={item.id} className="border-x-2 border-b" style={{ borderColor: i === lineItems.length - 1 ? borderColor : '#e5e7eb' }}>
                <td className="border-r px-2 py-2 text-center text-[#4b5563]" style={{ borderColor: '#d1d5db' }}>
                  {i + 1}
                </td>
                <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}>
                  <span className="font-medium whitespace-pre-line">{item.description || <span className="text-[#d1d5db] italic">—</span>}</span>
                </td>
                <td className="border-r px-2 py-2 text-center text-[#6b7280]" style={{ borderColor: '#d1d5db' }}>{item.hsnSac || '—'}</td>
                <td className="border-r px-2 py-2 text-center" style={{ borderColor: '#d1d5db' }}>{item.quantity}</td>
                <td className="border-r px-2 py-2 text-center" style={{ borderColor: '#d1d5db' }}>{item.unitPrice.toFixed(2)}</td>
                <td className="border-r px-2 py-2 text-center text-[#6b7280]" style={{ borderColor: '#d1d5db' }}>Nos</td>
                <td className="px-2 py-2 text-right font-medium">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}

          {/* Shipping row */}
          {shipping > 0 && (
            <tr className="border-x-2 border-b" style={{ borderColor: '#e5e7eb' }}>
              <td className="border-r px-2 py-2 text-center text-[#4b5563]" style={{ borderColor: '#d1d5db' }}>
                {lineItems.length + 1}
              </td>
              <td className="border-r px-2 py-2 font-medium" style={{ borderColor: '#d1d5db' }}>Freight Charges</td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="border-r px-2 py-2 text-center" style={{ borderColor: '#d1d5db' }}>1</td>
              <td className="border-r px-2 py-2 text-center" style={{ borderColor: '#d1d5db' }}>{shipping.toFixed(2)}</td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="px-2 py-2 text-right font-medium">{shipping.toFixed(2)}</td>
            </tr>
          )}

          {/* Empty rows for formal look */}
          {lineItems.length < 5 && Array.from({ length: 5 - lineItems.length - (shipping > 0 ? 1 : 0) }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-x-2 border-b" style={{ borderColor: '#e5e7eb' }}>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}>&nbsp;</td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="border-r px-2 py-2" style={{ borderColor: '#d1d5db' }}></td>
              <td className="px-2 py-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax + Totals Section */}
      <div className="border-x-2 border-b-2" style={{ borderColor }}>
        {/* Discount */}
        {discount.value > 0 && (
          <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex-1"></div>
            <div className="w-[200px] flex border-l" style={{ borderColor: '#d1d5db' }}>
              <div className="flex-1 px-2 py-1 text-[10px] text-[#4b5563]">
                Discount {discount.type === 'percent' ? `(${discount.value}%)` : '(Flat)'}
              </div>
              <div className="w-20 px-2 py-1 text-right text-[10px] text-[#dc2626]">-{discountAmt.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Tax rows */}
        {tax.rate > 0 && (
          <div className="border-b" style={{ borderColor: '#e5e7eb' }}>
            {tax.isGST && tax.gstType === 'intraState' ? (
              <>
                <div className="flex">
                  <div className="flex-1"></div>
                  <div className="w-[280px] flex border-l" style={{ borderColor: '#d1d5db' }}>
                    <div className="flex-1 px-2 py-1 text-[10px] font-semibold">CGST OUTPUT</div>
                    <div className="w-14 px-2 py-1 text-[10px] text-center">{(tax.rate / 2).toFixed(1)}%</div>
                    <div className="w-20 px-2 py-1 text-right text-[10px]">{gst.cgst.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex border-t" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex-1"></div>
                  <div className="w-[280px] flex border-l" style={{ borderColor: '#d1d5db' }}>
                    <div className="flex-1 px-2 py-1 text-[10px] font-semibold">SGST OUTPUT</div>
                    <div className="w-14 px-2 py-1 text-[10px] text-center">{(tax.rate / 2).toFixed(1)}%</div>
                    <div className="w-20 px-2 py-1 text-right text-[10px]">{gst.sgst.toFixed(2)}</div>
                  </div>
                </div>
              </>
            ) : tax.isGST && tax.gstType === 'interState' ? (
              <div className="flex">
                <div className="flex-1"></div>
                <div className="w-[280px] flex border-l" style={{ borderColor: '#d1d5db' }}>
                  <div className="flex-1 px-2 py-1 text-[10px] font-semibold">IGST OUTPUT</div>
                  <div className="w-14 px-2 py-1 text-[10px] text-center">{tax.rate}%</div>
                  <div className="w-20 px-2 py-1 text-right text-[10px]">{gst.igst.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="flex">
                <div className="flex-1"></div>
                <div className="w-[280px] flex border-l" style={{ borderColor: '#d1d5db' }}>
                  <div className="flex-1 px-2 py-1 text-[10px] font-semibold">{tax.label} TAX OUTPUT</div>
                  <div className="w-14 px-2 py-1 text-[10px] text-center">{tax.rate}%</div>
                  <div className="w-20 px-2 py-1 text-right text-[10px]">{taxAmt.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grand Total */}
        <div className="flex border-t-2" style={{ borderColor }}>
          <div className="flex-1"></div>
          <div className="w-[280px] flex border-l-2" style={{ borderColor }}>
            <div className="flex-1 px-2 py-2 text-[11px] font-bold uppercase">Grand Total</div>
            <div className="w-20 px-2 py-2 text-right text-[12px] font-bold">{sym}{total.toFixed(2)}</div>
          </div>
        </div>

        {/* Amount Paid & Balance Due */}
        {(amountPaid > 0) && (
          <>
            <div className="flex border-t" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex-1"></div>
              <div className="w-[280px] flex border-l" style={{ borderColor: '#d1d5db' }}>
                <div className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#4b5563]">Amount Paid</div>
                <div className="w-20 px-2 py-1 text-right text-[10px] text-[#4b5563]">-{sym}{amountPaid.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex border-t-2" style={{ borderColor }}>
              <div className="flex-1"></div>
              <div className="w-[280px] flex border-l-2 bg-[#f3f4f6]" style={{ borderColor }}>
                <div className="flex-1 px-2 py-2 text-[11px] font-bold uppercase">Balance Due</div>
                <div className="w-20 px-2 py-2 text-right text-[12px] font-bold">{sym}{balanceDue.toFixed(2)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Amount in Words */}
      <div className="border-x-2 border-b-2 px-3 py-2" style={{ borderColor }}>
        <p className="text-[10px]">
          <span className="font-semibold">Amount (in words):</span>{' '}
          <span className="italic">{numberToWords(total)}</span>
        </p>
      </div>

      {/* Bank Details + Signatory */}
      <div className="border-x-2 border-b-2" style={{ borderColor }}>
        <div className="flex">
          {/* Bank Details */}
          <div className="flex-1 p-3" style={{ borderRight: `1px solid ${borderColor}` }}>
            <p className="text-[10px] font-bold mb-1.5 underline">Bank Details:</p>
            {paymentDetails.bankName && (
              <p className="text-[10px] text-[#374151]">
                <span className="font-semibold">Bank:</span> {paymentDetails.bankName}
              </p>
            )}
            {paymentDetails.accountNumber && (
              <p className="text-[10px] text-[#374151]">
                <span className="font-semibold">A/c No:</span> {paymentDetails.accountNumber}
              </p>
            )}
            {paymentDetails.ifscSwift && (
              <p className="text-[10px] text-[#374151]">
                <span className="font-semibold">IFSC Code:</span> {paymentDetails.ifscSwift}
              </p>
            )}
            {paymentDetails.upiId && (
              <p className="text-[10px] text-[#374151]">
                <span className="font-semibold">UPI:</span> {paymentDetails.upiId}
              </p>
            )}
            {!paymentDetails.bankName && !paymentDetails.upiId && (
              <p className="text-[10px] text-[#9ca3af] italic">No bank details provided</p>
            )}
          </div>

          {/* Company Seal + Signatory */}
          <div className="w-[220px] p-3 text-center">
            <p className="text-[10px] font-bold mb-2">For {business.name || 'Your Business'}</p>
            {business.signatureUrl ? (
              <div className="h-12 flex items-center justify-center mb-1">
                <img src={business.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="h-12 mb-1"></div>
            )}
            <div className="border-t pt-1" style={{ borderColor: '#d1d5db' }}>
              <p className="text-[9px] text-[#6b7280]">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Declaration + Notes */}
      <div className="border-x-2 border-b-2 p-3" style={{ borderColor }}>
        <p className="text-[9px] font-bold mb-1 underline">Declaration:</p>
        {terms ? (
          <p className="text-[9px] text-[#4b5563] whitespace-pre-line">{terms}</p>
        ) : (
          <p className="text-[9px] text-[#4b5563]">
            We declare that this invoice shows the actual price of the goods / services described and that all particulars are true and correct.
          </p>
        )}
        {notes && (
          <p className="text-[9px] text-[#6b7280] mt-1.5 italic">Note: {notes}</p>
        )}
      </div>
    </div>
  );
}
