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
  name: '',
  logoUrl: '',
  signatureUrl: '',
  address: '',
  email: '',
  phone: '',
  website: '',
  taxId: '',
};

export const defaultClient: Client = {
  id: generateId(),
  name: '',
  company: '',
  address: '',
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
  label: 'Tax',
  rate: 0,
  isGST: false,
  gstType: 'intraState',
};

export const defaultPaymentDetails: PaymentDetails = {
  bankName: '',
  accountNumber: '',
  ifscSwift: '',
  upiId: '',
  paymentLink: '',
};

export function generateInvoiceNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}${year}-${seq}`;
}

export const defaultInvoice: Invoice = {
  invoiceNumber: generateInvoiceNumber('INV-', 1),
  invoiceDate: getTodayISO(),
  dueDate: getDueDateISO(30),
  status: 'Draft',
  business: { ...defaultBusiness },
  client: { ...defaultClient },
  lineItems: [createEmptyLineItem()],
  subtotal: 0,
  discount: { ...defaultDiscount },
  tax: { ...defaultTax },
  shipping: 0,
  total: 0,
  amountPaid: 0,
  balanceDue: 0,
  notes: 'Thank you for your business!',
  terms: 'Payment is due within 30 days of the invoice date.',
  paymentDetails: { ...defaultPaymentDetails },
  currency: 'INR',
  theme: 'minimal-mono',
  accentColor: '#2563eb',
  fontFamily: 'Inter',
};
