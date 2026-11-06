'use client';

import { create } from 'zustand';
import {
  Invoice,
  Business,
  Client,
  LineItem,
  Discount,
  Tax,
  PaymentDetails,
  InvoiceStatus,
  ThemeName,
} from '@/types/invoice';
import {
  defaultInvoice,
  createEmptyLineItem,
  generateId,
  generateInvoiceNumber,
} from '@/lib/defaults';
import {
  calcSubtotal,
  calcDiscountAmount,
  calcTaxAmount,
  calcGrandTotal,
} from '@/lib/calculations';
import {
  saveDraft,
  loadDraft,
  saveBusinessInfo,
  loadBusinessInfo,
  savePaymentInfo,
  loadPaymentInfo,
} from '@/lib/storage';

interface InvoiceState extends Invoice {
  // Prefix for invoice number generation
  invoicePrefix: string;

  // PDF export state
  isExporting: boolean;

  // Actions
  updateBusiness: (business: Partial<Business>) => void;
  updateClient: (client: Partial<Client>) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  setLineItems: (items: LineItem[]) => void;
  setDiscount: (discount: Partial<Discount>) => void;
  setTax: (tax: Partial<Tax>) => void;
  setShipping: (amount: number) => void;
  setNotes: (notes: string) => void;
  setTerms: (terms: string) => void;
  updatePaymentDetails: (details: Partial<PaymentDetails>) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemeName) => void;
  setAccentColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setAmountPaid: (amount: number) => void;
  setInvoiceNumber: (number: string) => void;
  setDocumentTitle: (title: string) => void;
  setInvoicePrefix: (prefix: string) => void;
  setInvoiceDate: (date: string) => void;
  setDueDate: (date: string) => void;
  setStatus: (status: InvoiceStatus) => void;
  setLogo: (dataUrl: string) => void;
  setSignature: (dataUrl: string) => void;
  setIsExporting: (val: boolean) => void;
  recalculate: () => void;
  loadFromDraft: () => boolean;
  resetInvoice: () => void;
  getInvoiceData: () => Invoice;
}

function recalcFields(state: Partial<InvoiceState>): Partial<InvoiceState> {
  const lineItems = state.lineItems || [];
  const discount = state.discount || defaultInvoice.discount;
  const tax = state.tax || defaultInvoice.tax;
  const shipping = state.shipping || 0;

  const subtotal = calcSubtotal(lineItems);
  const total = calcGrandTotal(subtotal, discount, tax, shipping);
  const amountPaid = state.amountPaid || 0;
  const balanceDue = total - amountPaid;

  return { subtotal, total, amountPaid, balanceDue };
}

export const useInvoiceStore = create<InvoiceState>()((set, get) => ({
  ...defaultInvoice,
  invoicePrefix: 'DB/26-27/',
  isExporting: false,

  updateBusiness: (updates) =>
    set((state) => {
      const business = { ...state.business, ...updates };
      saveBusinessInfo(business);
      return { business };
    }),

  updateClient: (updates) =>
    set((state) => ({
      client: { ...state.client, ...updates },
    })),

  addLineItem: () =>
    set((state) => {
      const lineItems = [...state.lineItems, createEmptyLineItem()];
      return { lineItems, ...recalcFields({ ...state, lineItems }) };
    }),

  removeLineItem: (id) =>
    set((state) => {
      const lineItems = state.lineItems.filter((item) => item.id !== id);
      // Always keep at least one row
      if (lineItems.length === 0) lineItems.push(createEmptyLineItem());
      return { lineItems, ...recalcFields({ ...state, lineItems }) };
    }),

  updateLineItem: (id, updates) =>
    set((state) => {
      const lineItems = state.lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      });
      return { lineItems, ...recalcFields({ ...state, lineItems }) };
    }),

  setLineItems: (items) =>
    set((state) => {
      const lineItems =
        items.length > 0
          ? items.map((item) => ({
              ...item,
              id: item.id || generateId(),
              total: (item.quantity || 0) * (item.unitPrice || 0),
            }))
          : [createEmptyLineItem()];
      return { lineItems, ...recalcFields({ ...state, lineItems }) };
    }),

  setDiscount: (updates) =>
    set((state) => {
      const discount = { ...state.discount, ...updates };
      return { discount, ...recalcFields({ ...state, discount }) };
    }),

  setTax: (updates) =>
    set((state) => {
      const tax = { ...state.tax, ...updates };
      return { tax, ...recalcFields({ ...state, tax }) };
    }),

  setShipping: (amount) =>
    set((state) => {
      return { shipping: amount, ...recalcFields({ ...state, shipping: amount }) };
    }),

  setNotes: (notes) => set({ notes }),
  setTerms: (terms) => set({ terms }),

  updatePaymentDetails: (updates) =>
    set((state) => {
      const paymentDetails = { ...state.paymentDetails, ...updates };
      savePaymentInfo(paymentDetails);
      return { paymentDetails };
    }),

  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme }),
  setAccentColor: (accentColor) => set({ accentColor }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setAmountPaid: (amountPaid) =>
    set((state) => {
      return { amountPaid, ...recalcFields({ ...state, amountPaid }) };
    }),
  setInvoiceNumber: (invoiceNumber) => set({ invoiceNumber }),
  setDocumentTitle: (documentTitle) => set({ documentTitle }),

  setInvoicePrefix: (prefix) =>
    set((state) => {
      const num = state.invoiceNumber.replace(/^[A-Za-z-]+/, '');
      return {
        invoicePrefix: prefix,
        invoiceNumber: `${prefix}${num}`,
      };
    }),

  setInvoiceDate: (invoiceDate) => set({ invoiceDate }),
  setDueDate: (dueDate) => set({ dueDate }),
  setStatus: (status) => set({ status }),

  setLogo: (dataUrl) =>
    set((state) => {
      const business = { ...state.business, logoUrl: dataUrl };
      saveBusinessInfo(business);
      return { business };
    }),

  setSignature: (dataUrl) =>
    set((state) => {
      const business = { ...state.business, signatureUrl: dataUrl };
      saveBusinessInfo(business);
      return { business };
    }),

  setIsExporting: (isExporting) => set({ isExporting }),

  recalculate: () =>
    set((state) => recalcFields(state)),

  loadFromDraft: () => {
    const draft = loadDraft();
    const savedBusiness = loadBusinessInfo();
    const savedPayment = loadPaymentInfo();
    if (draft) {
      const mergedBusiness = savedBusiness
        ? {
            ...draft.business,
            ...savedBusiness,
            logoUrl: savedBusiness.logoUrl || draft.business?.logoUrl || '',
            signatureUrl: savedBusiness.signatureUrl || draft.business?.signatureUrl || '',
          }
        : draft.business;
      const mergedPayment = savedPayment
        ? { ...draft.paymentDetails, ...savedPayment }
        : draft.paymentDetails;
      set({
        ...draft,
        business: mergedBusiness,
        paymentDetails: mergedPayment,
        ...recalcFields(draft),
      });
      return true;
    }
    return false;
  },

  resetInvoice: () => {
    const state = get();
    const prefix = state.invoicePrefix;
    const seq = parseInt(
      state.invoiceNumber.replace(/\D/g, '').slice(-3) || '0',
      10
    );
    set({
      ...defaultInvoice,
      invoiceNumber: generateInvoiceNumber(prefix, seq + 1),
      invoicePrefix: prefix,
      business: state.business,
      paymentDetails: state.paymentDetails,
      notes: state.notes,
      terms: state.terms,
      currency: state.currency,
      theme: state.theme,
      accentColor: state.accentColor,
      fontFamily: state.fontFamily,
    });
  },

  getInvoiceData: () => {
    const state = get();
    const {
      invoicePrefix: _p,
      isExporting: _e,
      updateBusiness: _1,
      updateClient: _2,
      addLineItem: _3,
      removeLineItem: _4,
      updateLineItem: _5,
      setLineItems: _5_a,
      setDiscount: _6,
      setTax: _7,
      setShipping: _8,
      setNotes: _9,
      setTerms: _10,
      updatePaymentDetails: _11,
      setCurrency: _12,
      setTheme: _13,
      setAccentColor: _14,
      setInvoiceNumber: _15,
      setInvoicePrefix: _16,
      setInvoiceDate: _17,
      setDueDate: _18,
      setStatus: _19,
      setLogo: _20,
      setSignature: _20_a,
      setIsExporting: _21,
      recalculate: _22,
      loadFromDraft: _23,
      resetInvoice: _24,
      getInvoiceData: _25,
      setFontFamily: _26,
      setAmountPaid: _27,
      setDocumentTitle: _28,
      ...invoiceData
    } = state;
    return invoiceData as Invoice;
  },
}));

// Autosave middleware - subscribe to store changes and persist
let autosaveTimeout: NodeJS.Timeout | null = null;

if (typeof window !== 'undefined') {
  useInvoiceStore.subscribe((state) => {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
      const data = state.getInvoiceData();
      saveDraft(data);
    }, 3000);
  });
}
