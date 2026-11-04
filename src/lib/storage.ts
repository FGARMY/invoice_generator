import { Invoice, Client } from '@/types/invoice';

const DRAFT_KEY = 'invoice-generator-draft-v3';
const CLIENTS_KEY = 'invoice-generator-clients';
const SEQUENCE_KEY = 'invoice-generator-sequence';
const BUSINESS_KEY = 'invoice-generator-business-v3';
const PAYMENT_KEY = 'invoice-generator-payment-v3';

// --- Draft Persistence ---

export function saveDraft(invoice: Invoice): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
}

export function loadDraft(): Invoice | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    if (data) return JSON.parse(data) as Invoice;
  } catch (e) {
    console.error('Failed to load draft:', e);
  }
  return null;
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

// --- Client Management ---

export function saveClient(client: Client): void {
  const clients = getClients();
  const existing = clients.findIndex((c) => c.id === client.id);
  if (existing >= 0) {
    clients[existing] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function getClients(): Client[] {
  try {
    const data = localStorage.getItem(CLIENTS_KEY);
    if (data) return JSON.parse(data) as Client[];
  } catch (e) {
    console.error('Failed to load clients:', e);
  }
  return [];
}

export function deleteClient(id: string): void {
  const clients = getClients().filter((c) => c.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

// --- Invoice Sequence ---

export function getNextSequence(): number {
  try {
    const seq = localStorage.getItem(SEQUENCE_KEY);
    const next = seq ? parseInt(seq, 10) + 1 : 1;
    localStorage.setItem(SEQUENCE_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

export function getCurrentSequence(): number {
  try {
    const seq = localStorage.getItem(SEQUENCE_KEY);
    return seq ? parseInt(seq, 10) : 0;
  } catch {
    return 0;
  }
}

// --- Business Persistence (remember across invoices) ---

export function saveBusinessInfo(business: Invoice['business']): void {
  try {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
  } catch (e) {
    console.error('Failed to save business info:', e);
  }
}

export function loadBusinessInfo(): Invoice['business'] | null {
  try {
    const data = localStorage.getItem(BUSINESS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load business info:', e);
  }
  return null;
}

export function savePaymentInfo(paymentDetails: Invoice['paymentDetails']): void {
  try {
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(paymentDetails));
  } catch (e) {
    console.error('Failed to save payment info:', e);
  }
}

export function loadPaymentInfo(): Invoice['paymentDetails'] | null {
  try {
    const data = localStorage.getItem(PAYMENT_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load payment info:', e);
  }
  return null;
}
