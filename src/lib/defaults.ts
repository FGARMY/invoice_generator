import { Invoice, Business, Client, LineItem, PaymentDetails, Discount, Tax } from '@/types/invoice';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDueDateISO(daysFromNow: number = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const defaultBusiness: Business = {
  name: "D BHARTY'S ENTERPRISES",
  logoUrl: '/adbpack-logo.svg',
  signatureUrl: '/signature.svg',
  address: "3rd Floor, Part of 2/224, Trilok Puri\nEast Delhi, Delhi - 110091\nState Name : Delhi",
  email: '',
  phone: '',
  website: '',
  taxId: 'GSTIN : 07ADZPU4004G1Z6\nPAN/IT No : ADZPU4004G',
};

export const defaultClient: Client = {
  id: generateId(),
  name: 'HAPDCO Herbals Pvt Ltd',
  company: 'HAPDCO Herbals Pvt Ltd',
  address: 'Dasauli, Kursi Road,\nNear Integral University,\nLucknow - 226026,\nUttar Pradesh - 09\nGST: 09AACCH0480Q1Z6',
  email: '',
  phone: '',
};

export function createEmptyLineItem(): LineItem {
  return {
    id: generateId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    total: 0,
  };
}

export const defaultDiscount: Discount = {
  type: 'percent',
  value: 0,
};

export const defaultTax: Tax = {
  label: 'IGST',
  rate: 18,
  isGST: true,
  gstType: 'interState',
};

export const defaultPaymentDetails: PaymentDetails = {
  bankName: 'HDFC Bank',
  accountNumber: '50200077328410',
  ifscSwift: 'HDFC0004153',
  bankAddress: 'Club 5, DLF Phase 5, Gurugram',
  upiId: '',
  paymentLink: '',
};

export function generateInvoiceNumber(prefix: string, sequence: number): string {
  const seq = String(sequence).padStart(4, '0');
  if (prefix.includes('/') || (prefix.includes('-') && /\d/.test(prefix))) {
    return `${prefix}${seq}`;
  }
  const year = new Date().getFullYear();
  return `${prefix}${year}-${String(sequence).padStart(3, '0')}`;
}

export const defaultInvoice: Invoice = {
  documentTitle: 'TAX INVOICE',
  invoiceNumber: 'DB/26-27/006',
  invoiceDate: '2026-07-24',
  dueDate: getDueDateISO(30),
  status: 'Draft',
  business: { ...defaultBusiness },
  client: { ...defaultClient },
  lineItems: [
    {
      id: generateId(),
      description: 'Respro Forte 120ml Labels 65 x 135mm',
      hsnSac: '48211020',
      quantity: 24800,
      unitPrice: 0.92,
      taxRate: 18,
      total: 22816,
    },
    {
      id: generateId(),
      description: 'Plate Charges Respro Forte',
      hsnSac: '84425090',
      quantity: 5,
      unitPrice: 1000.00,
      taxRate: 18,
      total: 5000,
    }
  ],
  subtotal: 27816,
  discount: { ...defaultDiscount },
  tax: { ...defaultTax },
  shipping: 0.12,
  total: 32823,
  amountPaid: 0,
  balanceDue: 32823,
  notes: 'Short & Access: ₹0.12 (Adjusted in Total)\nAmount in Words: Thirty Two Thousand Eight Hundred Twenty Three Only',
  terms: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
  paymentDetails: { ...defaultPaymentDetails },
  currency: 'INR',
  theme: 'minimal-mono',
  accentColor: '#2563eb',
  fontFamily: 'Inter',
};
