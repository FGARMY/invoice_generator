export interface Business {
  name: string;
  logoUrl: string; // base64 data URL or empty
  signatureUrl: string; // base64 data URL or empty
  address: string;
  email: string;
  phone: string;
  website: string;
  taxId: string; // Tax ID / GSTIN
}

export interface Client {
  id: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  hsnSac?: string; // HSN/SAC code
  quantity: number;
  unitPrice: number;
  taxRate: number; // per-item tax rate (percentage), 0 if not used
  total: number; // auto-calculated: quantity * unitPrice
}

export interface Discount {
  type: 'flat' | 'percent';
  value: number;
}

export interface Tax {
  label: string; // e.g. "GST", "VAT", "Sales Tax"
  rate: number; // percentage
  isGST: boolean; // if true, split into CGST/SGST or IGST
  gstType: 'intraState' | 'interState'; // CGST+SGST vs IGST
}

export interface PaymentDetails {
  bankName: string;
  accountNumber: string;
  ifscSwift: string; // IFSC or SWIFT code
  bankAddress?: string;
  upiId: string;
  paymentLink: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export type ThemeName = 'minimal-mono' | 'corporate-blue' | 'bold-modern';

export interface Invoice {
  documentTitle: string; // e.g. "TAX INVOICE"
  invoiceNumber: string;
  invoiceDate: string; // ISO date string
  dueDate: string; // ISO date string
  status: InvoiceStatus;

  business: Business;
  client: Client;
  lineItems: LineItem[];

  subtotal: number; // auto-calculated
  discount: Discount;
  tax: Tax;
  shipping: number;
  total: number; // auto-calculated
  amountPaid: number;
  balanceDue: number; // auto-calculated

  notes: string;
  terms: string;
  paymentDetails: PaymentDetails;

  currency: string; // currency code e.g. "INR", "USD"
  theme: ThemeName;
  accentColor: string; // hex color for theme accent override
  fontFamily: string;
}
